// src/api/jikan.ts
export type Anime = {
  id: number; // changed from mal_id for UI consistency
  title: string;
  imageUrl: string; // changed from image_url
  synopsis: string;
  episodes: number;
  score: number;
  type: string;
  rating: string; // changed from rated
  year?: number | null;
  genres?: string[];
};

export type AnimeDetail = Anime & {
  duration?: string;
  studios?: string[];
  producers?: string[];
  background?: string;
  genres?: string[];
};

// fetch top anime list
export async function fetchTopAnime(page: number = 1): Promise<Anime[]> {
  const res = await fetch(`https://api.jikan.moe/v4/top/anime?page=${page}`);
  const data = await res.json();
  return data.data.map((anime: any) => ({
    id: anime.mal_id,
    title: anime.title,
    imageUrl: anime.images?.jpg?.image_url || "",
    synopsis: anime.synopsis,
    episodes: anime.episodes,
    score: anime.score,
    type: anime.type,
    rating: anime.rating,
    year: anime.year,
    genres: anime.genres?.map((g: any) => g.name) || [],
  }));
}

// fetch anime details by ID
export async function fetchAnimeById(id: number): Promise<AnimeDetail> {
  const res = await fetch(`https://api.jikan.moe/v4/anime/${id}/full`);
  const data = await res.json();
  const anime = data.data;
  return {
    id: anime.mal_id,
    title: anime.title,
    imageUrl: anime.images?.jpg?.image_url || "",
    synopsis: anime.synopsis,
    episodes: anime.episodes,
    score: anime.score,
    type: anime.type,
    rating: anime.rating,
    year: anime.year,
    duration: anime.duration,
    studios: anime.studios?.map((s: any) => s.name) || [],
    producers: anime.producers?.map((p: any) => p.name) || [],
    background: anime.background || "",
    genres: anime.genres?.map((g: any) => g.name) || [],
  };
}
