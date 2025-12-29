export type Anime = {
  id: number;
  title: string;
  imageUrl: string;
  synopsis: string;
  episodes: number;
  score: number;
  type: string;
  rating: string;
  year?: number | null;
  genres?: string[];
  explicit_genres?: string[];
  themes?: string[];
  demographics?: string[];
};

export type AnimeDetail = Anime & {
  duration?: string;
  studios?: string[];
  producers?: string[];
  background?: string;
};
