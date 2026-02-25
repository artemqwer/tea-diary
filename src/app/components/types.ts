export type Tea = {
  id: string;
  name: string;
  type: string;
  color?: string | null;
  year: number;
  origin: string;
  total: number;
  remaining: number;
};

export type Session = {
  id: string;
  tea?: { name: string; type: string };
  date: Date;
  duration: number;
  steeps: number;
  volume: number;
  rating: number;
};
