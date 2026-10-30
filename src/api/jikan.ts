// GET /v4/genres/anime                                                   → fetchAllGenres (background refresh)
// GET /v4/anime?page=:page                                               → fetchAllAnime
// GET /v4/top/anime?page=:page                                           → fetchAllTopAnime
// GET /v4/anime/{id}/full                                                → fetchAnimeById
// GET /v4/anime?genres=:id&order_by=popularity&sort=desc&page=:page      → fetchAnimeByCategory
// GET /v4/anime?q=:query&page=:page                                      → searchAnime
//
// Jikan is a scraper in front of MyAnimeList and goes down whenever MAL does.
// Every fetcher here is wrapped in:
//   cached(key, () => hedge(jikan, anilist))
// so anything loaded once this session is instant, Jikan is preferred when it
// answers quickly, and AniList (see anilist.ts) is raced in when Jikan is slow,
// failing, or recently failed. AniList results carry MAL ids (idMal), so ids
// stay consistent whichever source wins.

import type { Anime, AnimeDetail } from "./dataTypes";
import * as anilist from "./anilist";
import { MAL_GENRES, type MalGenre } from "./genres";
import { cached, fetchWithTimeout, hedge, isAbort, jikanHealth, TimeoutError } from "./request";

export type RawGenre = MalGenre;

const JIKAN = "https://api.jikan.moe/v4";
const JIKAN_TIMEOUT_MS = 8000;

// The dropdown starts from the bundled MAL_GENRES list so it is always complete.
// This refreshes it from Jikan once (picks up newly added MAL genres); on any
// failure it returns the bundled list unchanged — never throws, never shrinks.
export async function fetchAllGenres(): Promise<RawGenre[]> {
  try {
    const data = await safeFetch(`${JIKAN}/genres/anime`);
    if (!Array.isArray(data) || data.length < MAL_GENRES.length) return MAL_GENRES;

    const known = new Map(MAL_GENRES.map((g) => [g.mal_id, g]));
    return data.map((g: any) => ({
      mal_id: g.mal_id,
      name: g.name,
      // Jikan's unfiltered endpoint doesn't say which group a genre is in;
      // unknown (new) ids are almost always themes.
      category: known.get(g.mal_id)?.category ?? "themes",
      aka: known.get(g.mal_id)?.aka,
    }));
  } catch (err) {
    console.warn("Jikan genres unavailable, using bundled list:", err);
    return MAL_GENRES;
  }
}

async function safeFetch(url: string, signal?: AbortSignal, retries = 3, delay = 1000): Promise<any> {
  let res: Response;
  try {
    res = await fetchWithTimeout(url, {}, JIKAN_TIMEOUT_MS, signal);
  } catch (err) {
    // Aborted because AniList already answered: stop quietly, no retry.
    if (signal?.aborted || isAbort(err)) throw err;
    if (err instanceof TimeoutError) {
      // A hang (not a quick error) is the signature of a hard outage: don't
      // burn more time retrying, let the fallback take it.
      console.warn(`Jikan timed out after ${JIKAN_TIMEOUT_MS}ms.`);
      throw new Error(`Jikan request failed: ${err.message}`);
    }
    if (retries > 0) {
      console.warn(`Network error. Retrying in ${delay}ms...`);
      await new Promise((r) => setTimeout(r, delay));
      return safeFetch(url, signal, retries - 1, delay * 2);
    }
    console.error("Fetch error:", err);
    throw err;
  }

  // 429 = rate limited: back off and retry up to 3 times
  if (res.status === 429) {
    if (retries > 0) {
      console.warn(`Rate limited by Jikan. Retrying in ${delay}ms...`);
      await new Promise((r) => setTimeout(r, delay));
      return safeFetch(url, signal, retries - 1, delay * 2);
    }
    throw new Error(`Jikan request failed after retries: ${res.status}`);
  }

  // 5xx = Jikan/MyAnimeList outage: one quick retry, then fail fast so the
  // AniList fallback kicks in without a long backoff chain
  if (res.status >= 500) {
    if (retries === 3) {
      console.warn(`Got ${res.status} from Jikan. Retrying once...`);
      await new Promise((r) => setTimeout(r, 800));
      return safeFetch(url, signal, 0, delay);
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
 * Jikan first, AniList raced in when Jikan is slow (>2.5s), failing, or was
 * unhealthy in the last minute (then both start at once). Whichever answers
 * first wins; the other request is aborted.
 */
function jikanOrAnilist<T>(
  label: string,
  fromJikan: (signal: AbortSignal) => Promise<T>,
  fromAnilist: (signal: AbortSignal) => Promise<T>
): Promise<T> {
  return hedge(fromJikan, fromAnilist, {
    hedgeAfterMs: jikanHealth.isSuspect() ? 0 : 2500,
    onPrimaryWon: () => jikanHealth.markOk(),
    onPrimaryLost: (reason, err) => {
      jikanHealth.markFailed();
      console.warn(
        reason === "failed"
          ? `Jikan unavailable for ${label}, served by AniList:`
          : `Jikan slow for ${label}, AniList answered first.`,
        err ?? ""
      );
    },
  });
}

/** Fetch all anime with pagination */
export function fetchAllAnime(page: number = 1): Promise<Anime[]> {
  return cached(`all:${page}`, () =>
    jikanOrAnilist(
      `anime page ${page}`,
      async (signal) => ((await safeFetch(`${JIKAN}/anime?page=${page}`, signal)) ?? []).map(mapJikanAnime),
      (signal) => anilist.fetchAnimeList({ page, sort: "POPULARITY_DESC" }, signal)
    )
  );
}

/** Fetch anime details by ID */
export function fetchAnimeById(id: number): Promise<AnimeDetail | null> {
  return cached(`detail:${id}`, () =>
    jikanOrAnilist<AnimeDetail | null>(
      `anime ${id}`,
      async (signal) => {
        const anime = await safeFetch(`${JIKAN}/anime/${id}/full`, signal);
        if (!anime) return null;
        return {
          ...mapJikanAnime(anime),
          duration: anime.duration || "",
          studios: anime.studios?.map((s: any) => s.name) || [],
          producers: anime.producers?.map((p: any) => p.name) || [],
          background: anime.background || "",
        };
      },
      (signal) => anilist.fetchAnimeDetailByMalId(id, signal)
    )
  );
}

export function fetchAnimeByCategory(
  _category: "genres" | "explicit_genres" | "themes" | "demographics",
  id: number,
  page: number = 1,
  genreName?: string
): Promise<Anime[]> {
  const fromJikan = async (signal: AbortSignal) => {
    const data = await safeFetch(`${JIKAN}/anime?genres=${id}&order_by=popularity&sort=desc&page=${page}`, signal);
    if (!data) return [];
    return data.map((anime: any) => ({
      ...mapJikanAnime(anime),
      explicit_genres: anime.explicit_genres?.map((g: any) => g.name) || [],
      themes: anime.themes?.map((g: any) => g.name) || [],
      demographics: anime.demographics?.map((g: any) => g.name) || [],
    }));
  };

  return cached(`genre:${id}:${page}`, () =>
    genreName
      ? jikanOrAnilist(`genre ${genreName} page ${page}`, fromJikan, (signal) =>
          anilist.fetchAnimeList({ page, genre: genreName, sort: "POPULARITY_DESC" }, signal)
        )
      : fromJikan(new AbortController().signal)
  );
}

/**
 * Search anime by name. `adult` is only needed by the AniList fallback: Jikan's
 * search includes adult titles by default, AniList hides them unless asked.
 */
export function searchAnime(query: string, page: number = 1, adult = false): Promise<Anime[]> {
  const q = query.trim();
  return cached(`search:${q.toLowerCase()}:${adult ? 1 : 0}:${page}`, () =>
    jikanOrAnilist(
      `search "${q}" page ${page}`,
      async (signal) =>
        ((await safeFetch(`${JIKAN}/anime?q=${encodeURIComponent(q)}&page=${page}`, signal)) ?? []).map(mapJikanAnime),
      (signal) => anilist.fetchAnimeList({ page, search: q, adult }, signal)
    )
  );
}

/** Fetch top anime (all pages) */
export function fetchAllTopAnime(page: number = 1): Promise<Anime[]> {
  return cached(`top:${page}`, () =>
    jikanOrAnilist(
      `top anime page ${page}`,
      async (signal) => ((await safeFetch(`${JIKAN}/top/anime?page=${page}`, signal)) ?? []).map(mapJikanAnime),
      (signal) => anilist.fetchAnimeList({ page, sort: "SCORE_DESC" }, signal)
    )
  );
}
