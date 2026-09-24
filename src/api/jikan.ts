// GET /v4/anime                                                          → fetchAllAnime
// GET /v4/top/anime                                                      → fetchAllTopAnime
// GET /v4/top/anime?page=:page                                           → AnimeMainList infinite scrolling
// GET /v4/anime/{id}/full                                                → AnimeDetailedPage
// GET /v4/anime?genres=:genreId&page=:page                               → fetchAnimeById
// GET /v4/anime?genres=${id}&order_by=popularity&sort=desc&page=${page}. → fetchAnimeByQuery
//
// Jikan is a scraper in front of MyAnimeList and goes down whenever MAL does.
// Every fetcher here falls back to AniList (see anilist.ts) when Jikan fails
// after retries. AniList results carry MAL ids (idMal), so ids stay consistent.

import type { Anime, AnimeDetail } from "./dataTypes";
import * as anilist from "./anilist";

export interface RawGenre {
  mal_id: number;
  name: string;
}

// AniList-sourced genres get synthetic negative ids so they are never sent to
// Jikan's ?genres= filter (which expects MAL genre ids).
export async function fetchAllGenres(): Promise<RawGenre[]> {
  try {
    const data = await safeFetch(`https://api.jikan.moe/v4/genres/anime`);
    if (!data) return [];

    return data.map((g: any) => ({
      mal_id: g.mal_id,
      name: g.name,
    }));
  } catch (err) {
    console.warn("Jikan genres unavailable, falling back to AniList:", err);
    const names = await anilist.fetchGenreNames();
    return names.map((name, i) => ({ mal_id: -(i + 1), name }));
  }
}

async function safeFetch(url: string, retries = 3, delay = 1000): Promise<any> {
  let res: Response;
  try {
    res = await fetch(url);
  } catch (err) {
    if (retries > 0) {
      console.warn(`Network error. Retrying in ${delay}ms...`);
      await new Promise((r) => setTimeout(r, delay));
      return safeFetch(url, retries - 1, delay * 2);
    }
    console.error("Fetch error:", err);
    throw err;
  }

  // 429 = rate limited: back off and retry up to 3 times
  if (res.status === 429) {
    if (retries > 0) {
      console.warn(`Rate limited by Jikan. Retrying in ${delay}ms...`);
      await new Promise((r) => setTimeout(r, delay));
      return safeFetch(url, retries - 1, delay * 2);
    }
    throw new Error(`Jikan request failed after retries: ${res.status}`);
  }

  // 5xx = Jikan/MyAnimeList outage: one quick retry, then fail fast so the
  // AniList fallback kicks in without a long backoff chain
  if (res.status >= 500) {
    if (retries === 3) {
      console.warn(`Got ${res.status} from Jikan. Retrying once...`);
      await new Promise((r) => setTimeout(r, 800));
      return safeFetch(url, 0, delay);
    }
    throw new Error(`Jikan request failed: ${res.status}`);
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
}

function mapJikanAnime(anime: any): Anime {
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
    genres: anime.genres?.map((g: any) => g.name) || [],
  };
}

/**
 * Fetch all anime with pagination
 */
export async function fetchAllAnime(page: number = 1): Promise<Anime[]> {
  try {
    const data = await safeFetch(`https://api.jikan.moe/v4/anime?page=${page}`);
    if (!data) return [];
    return data.map(mapJikanAnime);
  } catch (err) {
    console.warn("Jikan unavailable, falling back to AniList:", err);
    return anilist.fetchAnimeList({ page, sort: "POPULARITY_DESC" });
  }
}

/**
 * Fetch anime details by ID
 */
export async function fetchAnimeById(id: number): Promise<AnimeDetail | null> {
  let anime: any;
  try {
    anime = await safeFetch(`https://api.jikan.moe/v4/anime/${id}/full`);
  } catch (err) {
    console.warn("Jikan unavailable, falling back to AniList:", err);
    return anilist.fetchAnimeDetailByMalId(id);
  }
  if (!anime) return null;

  return {
    ...mapJikanAnime(anime),
    duration: anime.duration || "",
    studios: anime.studios?.map((s: any) => s.name) || [],
    producers: anime.producers?.map((p: any) => p.name) || [],
    background: anime.background || "",
  };
}

export async function fetchAnimeByCategory(
  _category: "genres" | "explicit_genres" | "themes" | "demographics",
  id: number,
  page: number = 1,
  genreName?: string
): Promise<Anime[]> {
  // Synthetic (AniList-sourced) genre id — Jikan can't resolve it, go straight to AniList
  if (id < 0) {
    if (!genreName) return [];
    return anilist.fetchAnimeList({ page, genre: genreName, sort: "POPULARITY_DESC" });
  }

  let data: any;
  try {
    data = await safeFetch(`https://api.jikan.moe/v4/anime?genres=${id}&order_by=popularity&sort=desc&page=${page}`);
  } catch (err) {
    if (!genreName) throw err;
    console.warn("Jikan unavailable, falling back to AniList:", err);
    return anilist.fetchAnimeList({ page, genre: genreName, sort: "POPULARITY_DESC" });
  }
  if (!data) return [];

  return data.map((anime: any) => ({
    ...mapJikanAnime(anime),
    explicit_genres: anime.explicit_genres?.map((g: any) => g.name) || [],
    themes: anime.themes?.map((g: any) => g.name) || [],
    demographics: anime.demographics?.map((g: any) => g.name) || [],
  }));
}

/**
 * Search anime by name
 */
// `adult` is only needed by the AniList fallback: Jikan's search includes adult
// titles by default, AniList hides them unless asked explicitly.
export async function searchAnime(query: string, page: number = 1, adult = false): Promise<Anime[]> {
  try {
    const data = await safeFetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&page=${page}`);
    if (!data) return [];
    return data.map(mapJikanAnime);
  } catch (err) {
    console.warn("Jikan unavailable, falling back to AniList:", err);
    return anilist.fetchAnimeList({ page, search: query, adult });
  }
}

/**
 * Fetch top anime (all pages)
 */
export async function fetchAllTopAnime(page: number = 1): Promise<Anime[]> {
  try {
    const data = await safeFetch(`https://api.jikan.moe/v4/top/anime?page=${page}`);
    if (!data) return [];
    return data.map(mapJikanAnime);
  } catch (err) {
    console.warn("Jikan unavailable, falling back to AniList:", err);
    return anilist.fetchAnimeList({ page, sort: "SCORE_DESC" });
  }
}
