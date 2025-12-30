// GET /v4/anime                                                          → fetchAllAnime
// GET /v4/top/anime                                                      → fetchAllTopAnime
// GET /v4/top/anime?page=:page                                           → AnimeMainList infinite scrolling
// GET /v4/anime/{id}/full                                                → AnimeDetailedPage
// GET /v4/anime?genres=:genreId&page=:page                               → fetchAnimeById
// GET /v4/anime?genres=${id}&order_by=popularity&sort=desc&page=${page}. → fetchAnimeByQuery

import type { Anime, AnimeDetail } from "./dataTypes";

export interface RawGenre {
  mal_id: number;
  name: string;
}

export async function fetchAllGenres(): Promise<RawGenre[]> {
  const data = await safeFetch(`https://api.jikan.moe/v4/genres/anime`);
  if (!data) return [];

  return data.map((g: any) => ({
    mal_id: g.mal_id,
    name: g.name,
  }));
}

async function safeFetch(url: string, retries = 3, delay = 1000): Promise<any> {
  try {
    const res = await fetch(url);

    if (res.status === 429) {
      if (retries > 0) {
        console.warn(`Rate limited. Retrying in ${delay}ms...`);
        await new Promise((r) => setTimeout(r, delay));
        return safeFetch(url, retries - 1, delay * 2);
      } else {
        console.error(`Failed after retries: 429 Too Many Requests`);
        return null;
      }
    }

    if (!res.ok) {
      console.warn(`Request failed with status ${res.status}`);
      return null;
    }

    const json = await res.json();
    if (!json.data) {
      console.warn("No data returned from Jikan", json);
      return null;
    }

    return json.data;
  } catch (err) {
    console.error("Fetch error:", err);
    return null;
  }
}

/**
 * Fetch all anime with pagination
 */
export async function fetchAllAnime(page: number = 1): Promise<Anime[]> {
  const data = await safeFetch(`https://api.jikan.moe/v4/anime?page=${page}`);
  if (!data) return [];

  return data.map((anime: any) => ({
    id: anime.mal_id,
    title: anime.title || "",
    imageUrl: anime.images?.jpg?.image_url || "",
    synopsis: anime.synopsis || "",
    episodes: anime.episodes ?? 0,
    score: anime.score ?? 0,
    type: anime.type || "",
    rating: anime.rating || "",
    year: anime.year ?? null,
    genres: anime.genres?.map((g: any) => g.name) || [],
  }));
}

/**
 * Fetch anime details by ID
 */
export async function fetchAnimeById(id: number): Promise<AnimeDetail | null> {
  const anime = await safeFetch(`https://api.jikan.moe/v4/anime/${id}/full`);
  if (!anime) return null;

  return {
    id: anime.mal_id,
    title: anime.title || "",
    imageUrl: anime.images?.jpg?.image_url || "",
    synopsis: anime.synopsis || "",
    episodes: anime.episodes ?? 0,
    score: anime.score ?? 0,
    type: anime.type || "",
    rating: anime.rating || "",
    year: anime.year ?? null,
    duration: anime.duration || "",
    studios: anime.studios?.map((s: any) => s.name) || [],
    producers: anime.producers?.map((p: any) => p.name) || [],
    background: anime.background || "",
    genres: anime.genres?.map((g: any) => g.name) || [],
  };
}

export async function fetchAnimeByCategory(
  category: "genres" | "explicit_genres" | "themes" | "demographics",
  id: number,
  page: number = 1
): Promise<Anime[]> {
  const data = await safeFetch(`https://api.jikan.moe/v4/anime?genres=${id}&order_by=popularity&sort=desc&page=${page}`);
  if (!data) return [];

  return data.map((anime: any) => ({
    id: anime.mal_id,
    title: anime.title || "",
    imageUrl: anime.images?.jpg?.image_url || "",
    synopsis: anime.synopsis || "",
    episodes: anime.episodes ?? 0,
    score: anime.score ?? 0,
    type: anime.type || "",
    rating: anime.rating || "",
    year: anime.year ?? null,
    genres: anime.genres?.map((g: any) => g.name) || [],
    explicit_genres: anime.explicit_genres?.map((g: any) => g.name) || [],
    themes: anime.themes?.map((g: any) => g.name) || [],
    demographics: anime.demographics?.map((g: any) => g.name) || [],
  }));
}

/**
 * Fetch top anime (all pages)
 */
export async function fetchAllTopAnime(page: number = 1): Promise<Anime[]> {
  const data = await safeFetch(`https://api.jikan.moe/v4/top/anime?page=${page}`);
  if (!data) return [];

  return data.map((anime: any) => ({
    id: anime.mal_id,
    title: anime.title || "",
    imageUrl: anime.images?.jpg?.image_url || "",
    synopsis: anime.synopsis || "",
    episodes: anime.episodes ?? 0,
    score: anime.score ?? 0,
    type: anime.type || "",
    rating: anime.rating || "",
    year: anime.year ?? null,
    genres: anime.genres?.map((g: any) => g.name) || [],
  }));
}

