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
  tea?: { name: string; type: string } | null;
  date: Date | string;
  duration: number;
  steeps: number;
  volume: number;
  grams: number;
  temp?: number | null;
  rating: number;
};

export type UserProfile = {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  emailVerified?: Date | null;
};
