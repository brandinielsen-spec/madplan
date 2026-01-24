# Madplan n8n Workflows

Denne mappe indeholder de aktive n8n workflows der driver Madplan-appen.

## Oversigt

| Workflow | Endpoint | Metode | Beskrivelse |
|----------|----------|--------|-------------|
| Hent Ejere | `/madplan/ejere` | GET | Henter alle ejere (brugere) |
| Hent Opskrifter | `/madplan/opskrifter` | GET | Henter alle opskrifter for en ejer |
| Hent Uge | `/madplan/uge` | GET | Henter ugeplan for specifik uge |
| Hent Indkøbsliste | `/madplan/indkob` | GET | Henter indkøbsliste for en uge |
| Opret Opskrift | `/madplan/opskrift/opret` | POST | Opretter ny opskrift |
| Opdater Opskrift | `/madplan/opskrift/opdater` | PUT | Opdaterer eksisterende opskrift |
| Opdater Dag | `/madplan/dag/opdater` | POST | Sætter ret på en dag i ugeplanen |
| Slet Dag | `/madplan/dag/slet` | POST | Fjerner ret fra en dag |
| Tilføj Indkøbspost | `/madplan/indkob/tilfoej` | POST | Tilføjer manuel vare til indkøbsliste |
| Import fra URL | `/madplan/opskrift/import-url` | POST | Importerer opskrift fra webside |
| Import fra Billede | `/madplan/opskrift/import-billede` | POST | Importerer opskrift fra billede med AI |

## Arkitektur

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Next.js    │────▶│    n8n      │────▶│  Airtable   │
│  Frontend   │◀────│  Workflows  │◀────│  Database   │
└─────────────┘     └─────────────┘     └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │ OpenRouter  │
                    │  (AI/LLM)   │
                    └─────────────┘
```

## Workflow-detaljer

### Hent Ejere
Henter alle ejere fra Airtable Ejere-tabellen og returnerer dem som JSON.

**Response:**
```json
{
  "success": true,
  "data": [
    { "id": "rec...", "navn": "Familienavn" }
  ]
}
```

### Hent Opskrifter
Henter alle opskrifter for en specifik ejer.

**Query params:** `ejerId`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "rec...",
      "ejerId": "rec...",
      "titel": "Spaghetti Carbonara",
      "portioner": 4,
      "ingredienser": ["400g spaghetti", "200g bacon", ...],
      "fremgangsmaade": "...",
      "oprettetDato": "2026-01-24"
    }
  ]
}
```

### Hent Uge
Henter ugeplan med retter for hver dag.

**Query params:** `ejerId`, `aar`, `uge`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "rec...",
    "ejerId": "rec...",
    "aar": 2026,
    "uge": 4,
    "dage": {
      "mandag": { "ret": "Lasagne", "opskriftId": "rec..." },
      "tirsdag": { "ret": "Pizza" },
      ...
    }
  }
}
```

### Opdater Dag
Sætter eller ændrer retten for en specifik dag.

**Body:**
```json
{
  "id": "rec...",
  "feltNavn": "Mandag",
  "ret": "Lasagne",
  "opskriftId": "rec..."
}
```

### Import fra Billede
Bruger Claude Sonnet 4 via OpenRouter til at aflæse opskrifter fra billeder.

**Body:**
```json
{
  "imageBase64": "data:image/jpeg;base64,..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "titel": "Opskriftens navn",
    "portioner": 4,
    "ingredienser": ["ingrediens 1", "ingrediens 2", ...],
    "fremgangsmaade": "Tilberedningsvejledning..."
  }
}
```

## Airtable-struktur

### Ejere
| Felt | Type |
|------|------|
| Navn | Single line text |

### Opskrifter
| Felt | Type |
|------|------|
| EjerId | Single line text |
| Titel | Single line text |
| Portioner | Number |
| Ingredienser | Long text (linjeskift-separeret) |
| Fremgangsmaade | Long text |
| Dato | Date |

### Ugeplaner
| Felt | Type |
|------|------|
| EjerId | Single line text |
| Aar | Number |
| Uge | Number |
| Mandag, Tirsdag, ... | Single line text |
| MandagOpskriftId, ... | Single line text |

### Indkoebsposter
| Felt | Type |
|------|------|
| EjerId | Single line text |
| Aar | Number |
| Uge | Number |
| Navn | Single line text |
| Kilde | Single select (ret/manuel) |
| Afkrydset | Checkbox |

## Deployment

Workflows deployes til n8n Cloud via API:

```javascript
// Opret workflow
POST /api/v1/workflows
{
  "name": "Workflow navn",
  "nodes": [...],
  "connections": {...},
  "settings": {...}
}

// Aktiver workflow
POST /api/v1/workflows/{id}/activate
```

## Fejlfinding

### Workflow returnerer tom response
- Tjek at workflow er aktivt i n8n
- Tjek Airtable credentials er gyldige
- Se execution logs i n8n

### AI import mangler ingredienser
- Prompten er konfigureret til at tælle alle ingredienser
- Prøv med et tydeligere billede
- Check at billedet er korrekt base64-encoded
