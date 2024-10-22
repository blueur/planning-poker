export interface Group {
  id?: string;
  name: string;
  cards: string[];
  story: string;
}

export interface Member {
  id?: string;
  name: string;
  vote: string;
}
