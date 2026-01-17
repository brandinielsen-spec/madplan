export interface Ejer {
  id: string;
  navn: string;
}

export interface Opskrift {
  id: string;
  ejerId: string;
  titel: string;
  portioner: number;
  ingredienser: string[];
  fremgangsmaade: string;
  oprettetDato: string;
}

export interface DagData {
  ret: string | null;
  opskriftId: string | null;
}

export interface Ugeplan {
  id: string;
  ejerId: string;
  aar: number;
  uge: number;
  dage: {
    mandag: DagData;
    tirsdag: DagData;
    onsdag: DagData;
    torsdag: DagData;
    fredag: DagData;
    loerdag: DagData;
    soendag: DagData;
  };
}

export interface Indkoebspost {
  id: string;
  ejerId: string;
  aar: number;
  uge: number;
  navn: string;
  kilde: 'ret' | 'manuel';
  afkrydset: boolean;
}

export type Ugedag = 'mandag' | 'tirsdag' | 'onsdag' | 'torsdag' | 'fredag' | 'loerdag' | 'soendag';

export const UGEDAGE: { key: Ugedag; label: string }[] = [
  { key: 'mandag', label: 'Mandag' },
  { key: 'tirsdag', label: 'Tirsdag' },
  { key: 'onsdag', label: 'Onsdag' },
  { key: 'torsdag', label: 'Torsdag' },
  { key: 'fredag', label: 'Fredag' },
  { key: 'loerdag', label: 'Lørdag' },
  { key: 'soendag', label: 'Søndag' },
];
