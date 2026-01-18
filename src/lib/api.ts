import { Ejer, Opskrift, Ugeplan, Indkoebspost, Ugedag } from './types';

const API_BASE = process.env.NEXT_PUBLIC_N8N_URL || 'https://n8n.srv965476.hstgr.cloud/webhook';

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const text = await response.text();
  if (!text) {
    return undefined as T;
  }

  const data = JSON.parse(text);

  // Hvis response har en data property, returner den (også selvom den er null)
  if ('data' in data) {
    return data.data;
  }
  return data;
}

// Ejere
export async function hentEjere(): Promise<Ejer[]> {
  return fetchApi<Ejer[]>('/madplan/ejere');
}

export async function opretEjer(navn: string): Promise<Ejer> {
  return fetchApi<Ejer>('/madplan/ejer/opret', {
    method: 'POST',
    body: JSON.stringify({ navn }),
  });
}

// Ugeplaner
export async function hentUgeplan(ejerId: string, aar: number, uge: number): Promise<Ugeplan | null> {
  try {
    return await fetchApi<Ugeplan>(`/madplan/uge?ejerId=${ejerId}&aar=${aar}&uge=${uge}`);
  } catch {
    return null;
  }
}

// Map dansk dagsnavn til Airtable feltnavn
const dagTilFelt: Record<Ugedag, string> = {
  mandag: 'Mandag',
  tirsdag: 'Tirsdag',
  onsdag: 'Onsdag',
  torsdag: 'Torsdag',
  fredag: 'Fredag',
  loerdag: 'Loerdag',
  soendag: 'Soendag',
};

export async function gemDag(
  ejerId: string,
  aar: number,
  uge: number,
  dag: Ugedag,
  ret: string,
  opskriftId?: string
): Promise<Ugeplan> {
  // Først hent eksisterende ugeplan
  let ugeplan = await hentUgeplan(ejerId, aar, uge);

  // Hvis ingen ugeplan findes, opret en ny
  if (!ugeplan) {
    const created = await fetchApi<{ id: string }>('/madplan/uge/opret', {
      method: 'POST',
      body: JSON.stringify({ ejerId, aar, uge }),
    });
    ugeplan = { id: created.id, ejerId, aar, uge, dage: {} } as Ugeplan;
  }

  // Opdater dagen - brug POST og send feltNavn direkte
  const feltNavn = dagTilFelt[dag];
  await fetchApi('/madplan/dag/opdater', {
    method: 'POST',
    body: JSON.stringify({ id: ugeplan.id, feltNavn, ret, opskriftId }),
  });

  // Hent opdateret ugeplan
  return (await hentUgeplan(ejerId, aar, uge)) as Ugeplan;
}

export async function sletDag(
  ejerId: string,
  aar: number,
  uge: number,
  dag: Ugedag
): Promise<void> {
  // Hent eksisterende ugeplan for at få id
  const ugeplan = await hentUgeplan(ejerId, aar, uge);
  if (!ugeplan) return;

  // Brug POST og send feltNavn direkte
  const feltNavn = dagTilFelt[dag];
  await fetchApi('/madplan/dag/slet', {
    method: 'POST',
    body: JSON.stringify({ id: ugeplan.id, feltNavn }),
  });
}

export async function kopierUge(
  ejerId: string,
  fraAar: number,
  fraUge: number,
  tilAar: number,
  tilUge: number
): Promise<Ugeplan> {
  return fetchApi<Ugeplan>('/madplan/uge/kopier', {
    method: 'POST',
    body: JSON.stringify({ ejerId, fraAar, fraUge, tilAar, tilUge }),
  });
}

// Opskrifter
export async function hentOpskrifter(ejerId: string): Promise<Opskrift[]> {
  return fetchApi<Opskrift[]>(`/madplan/opskrifter?ejerId=${ejerId}`);
}

export async function hentOpskrift(id: string): Promise<Opskrift> {
  return fetchApi<Opskrift>(`/madplan/opskrift?id=${id}`);
}

export async function opretOpskrift(opskrift: Omit<Opskrift, 'id' | 'oprettetDato'>): Promise<Opskrift> {
  return fetchApi<Opskrift>('/madplan/opskrift/opret', {
    method: 'POST',
    body: JSON.stringify(opskrift),
  });
}

export async function opdaterOpskrift(id: string, opskrift: Partial<Opskrift>): Promise<Opskrift> {
  return fetchApi<Opskrift>('/madplan/opskrift/opdater', {
    method: 'PUT',
    body: JSON.stringify({ id, ...opskrift }),
  });
}

export async function sletOpskrift(id: string): Promise<void> {
  await fetchApi('/madplan/opskrift/slet', {
    method: 'DELETE',
    body: JSON.stringify({ id }),
  });
}

// Indkøbsliste
export async function hentIndkoebsliste(ejerId: string, aar: number, uge: number): Promise<Indkoebspost[]> {
  return fetchApi<Indkoebspost[]>(`/madplan/indkob?ejerId=${ejerId}&aar=${aar}&uge=${uge}`);
}

export async function tilfoejManuelPost(
  ejerId: string,
  aar: number,
  uge: number,
  navn: string
): Promise<Indkoebspost> {
  return fetchApi<Indkoebspost>('/madplan/indkob/tilfoej', {
    method: 'POST',
    body: JSON.stringify({ ejerId, aar, uge, navn }),
  });
}

export async function opdaterIndkoebspost(id: string, afkrydset: boolean): Promise<Indkoebspost> {
  return fetchApi<Indkoebspost>('/madplan/indkob/opdater', {
    method: 'PUT',
    body: JSON.stringify({ id, afkrydset }),
  });
}

export async function sletIndkoebspost(id: string): Promise<void> {
  await fetchApi('/madplan/indkob/slet', {
    method: 'DELETE',
    body: JSON.stringify({ id }),
  });
}

// Hent tidligere brugte retter
export async function hentTidligereRetter(ejerId: string): Promise<string[]> {
  return fetchApi<string[]>(`/madplan/retter?ejerId=${ejerId}`);
}

// Import opskrift fra URL
export interface ImportedOpskrift {
  titel: string;
  portioner: number;
  ingredienser: string[];
  fremgangsmaade: string;
}

export async function importOpskriftFraUrl(url: string): Promise<ImportedOpskrift> {
  const response = await fetch(`${API_BASE}/madplan/opskrift/import-url`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const result = await response.json();
  if (!result.success || !result.data) {
    throw new Error(result.error || 'Kunne ikke importere opskrift fra URL');
  }
  return result.data;
}

// Import opskrift fra billede
export async function importOpskriftFraBillede(imageBase64: string): Promise<ImportedOpskrift> {
  const response = await fetch(`${API_BASE}/madplan/opskrift/import-billede`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageBase64 }),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const result = await response.json();
  if (!result.success || !result.data) {
    throw new Error(result.error || 'Kunne ikke importere opskrift fra billede');
  }
  return result.data;
}

// Tilføj ingredienser til indkøbsliste
export async function tilfoejIngredienser(
  ejerId: string,
  aar: number,
  uge: number,
  ingredienser: string[]
): Promise<number> {
  let added = 0;
  for (const ingrediens of ingredienser) {
    const navn = ingrediens.trim();
    if (navn) {
      await tilfoejManuelPost(ejerId, aar, uge, navn);
      added++;
    }
  }
  return added;
}
