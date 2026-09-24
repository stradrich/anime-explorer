// AniList GraphQL API — used as an automatic fallback when Jikan is unavailable.
// AniList exposes MAL ids via `idMal`, so anime ids stay consistent with Jikan;
// entries without a MAL id are dropped to keep detail-page lookups working.

import type { Anime, AnimeDetail } from "./dataTypes";

const ANILIST_URL = "https://graphql.anilist.co";

const MEDIA_FIELDS = `
  idMal
  title { romaji english }
  coverImage { large }
  description
  episodes
  averageScore
  format
  seasonYear
  genres
`;

// AniList's fixed genre taxonomy (GenreCollection). Anything else is queried as a tag.
const ANILIST_GENRES = new Set([
  "Action", "Adventure", "Comedy", "Drama", "Ecchi", "Fantasy", "Hentai", "Horror",
  "Mahou Shoujo", "Mecha", "Music", "Mystery", "Psychological", "Romance",
  "Sci-Fi", "Slice of Life", "Sports", "Supernatural", "Thriller",
]);

// The only genre whose entries are all flagged isAdult on AniList. Filtering
// isAdult: false with it selected returns nothing, so the filter is lifted for it.
const ADULT_GENRES = new Set(["Hentai"]);

// MAL genre/theme names that AniList spells differently (genre or tag equivalents,
// verified against MediaTagCollection). Unlisted names are tried verbatim as a tag.
// An empty entry means MAL has the genre but AniList has no equivalent at all;
// those return [] without spending a request. Audited against live Jikan (78
// genres/themes/demographics) and live AniList tags on 2026-09-24.
const MAL_TO_ANILIST: Record<string, { genre?: string; tag?: string }> = {
  "Avant Garde": {},
  "Award Winning": {},
  "Erotica": {},
  "Love Status Quo": {},
  "Showbiz": { tag: "Acting" },
  "Suspense": { genre: "Thriller" },
  "Team Sports": { genre: "Sports" },
  "Boys Love": { tag: "Boys' Love" },
  "Girls Love": { tag: "Yuri" },
  "Gourmet": { tag: "Food" },
  "CGDCT": { tag: "Cute Girls Doing Cute Things" },
  "Childcare": { tag: "Parenthood" },
  "Gag Humor": { tag: "Slapstick" },
  "Harem": { tag: "Female Harem" },
  "Reverse Harem": { tag: "Male Harem" },
  "High Stakes Game": { tag: "Gambling" },
  "Idols (Female)": { tag: "Idol" },
  "Idols (Male)": { tag: "Idol" },
  "Love Polygon": { tag: "Love Triangle" },
  "Magical Sex Shift": { tag: "Gender Bending" },
  "Medical": { tag: "Medicine" },
  "Organized Crime": { tag: "Crime" },
  "Performing Arts": { tag: "Musical Theater" },
  "Pets": { tag: "Animals" },
  "Racing": { tag: "Cars" },
  "Strategy Game": { tag: "Board Game" },
  "Time Travel": { tag: "Time Manipulation" },
  "Video Game": { tag: "Video Games" },
  "Visual Arts": { tag: "Drawing" },
  "Workplace": { tag: "Work" },
  "Adult Cast": { tag: "Primarily Adult Cast" },
  "Anthropomorphic": { tag: "Anthropomorphism" },
  "Combat Sports": { tag: "Boxing" },
};

const FORMAT_LABELS: Record<string, string> = {
  TV: "TV",
  TV_SHORT: "TV",
  MOVIE: "Movie",
  SPECIAL: "Special",
  OVA: "OVA",
  ONA: "ONA",
  MUSIC: "Music",
};

// AniList allows ~30 requests/min (degraded mode) and its 429 responses carry no
// CORS headers, so the browser surfaces a rate limit as a rejected fetch
// ("Failed to fetch") rather than a readable 429. Treat any rejection as
// transient: back off and retry a couple of times before giving up.
const RETRY_DELAYS_MS = [2000, 5000];

async function gql(query: string, variables: Record<string, unknown>, attempt = 0): Promise<any> {
  let res: Response;
  try {
    res = await fetch(ANILIST_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ query, variables }),
    });
  } catch (err) {
    if (attempt < RETRY_DELAYS_MS.length) {
      const delay = RETRY_DELAYS_MS[attempt];
      console.warn(`AniList unreachable or rate limited. Retrying in ${delay}ms...`);
      await new Promise((r) => setTimeout(r, delay));
      return gql(query, variables, attempt + 1);
    }
    throw new Error(`AniList request failed: ${err instanceof Error ? err.message : String(err)}`);
  }

  if (res.status === 429 && attempt < RETRY_DELAYS_MS.length) {
    const retryAfter = Number(res.headers.get("Retry-After")) * 1000;
    const delay = Math.min(retryAfter || RETRY_DELAYS_MS[attempt], 10_000);
    console.warn(`Rate limited by AniList. Retrying in ${delay}ms...`);
    await new Promise((r) => setTimeout(r, delay));
    return gql(query, variables, attempt + 1);
  }

  const json = await res.json().catch(() => null);
  if (!res.ok || json?.errors?.length) {
    const message = json?.errors?.[0]?.message ?? `status ${res.status}`;
    throw new Error(`AniList request failed: ${message}`);
  }
  return json.data;
}

function stripHtml(text: string | null | undefined): string {
  return (text || "").replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, "");
}

function toAnime(media: any): Anime {
  return {
    id: media.idMal,
    title: media.title?.english || media.title?.romaji || "",
    imageUrl: media.coverImage?.large || "",
    synopsis: stripHtml(media.description),
    episodes: media.episodes ?? 0,
    score: media.averageScore != null ? media.averageScore / 10 : 0,
    type: FORMAT_LABELS[media.format] || media.format || "",
    rating: "",
    year: media.seasonYear ?? null,
    genres: media.genres || [],
  };
}

export async function fetchAnimeList(opts: {
  page?: number;
  genre?: string;
  search?: string;
  sort?: "POPULARITY_DESC" | "SCORE_DESC";
}): Promise<Anime[]> {
  // Resolve a MAL genre/theme name to AniList's genre or tag vocabulary
  let genre: string | undefined;
  let tag: string | undefined;
  if (opts.genre) {
    const alias = MAL_TO_ANILIST[opts.genre];
    if (alias) {
      if (!alias.genre && !alias.tag) {
        console.warn(`AniList has no equivalent for "${opts.genre}"`);
        return [];
      }
      ({ genre, tag } = alias);
    }
    else if (ANILIST_GENRES.has(opts.genre)) genre = opts.genre;
    else tag = opts.genre; // exact-name tags like Isekai, Samurai, Shounen
  }

  let data: any;
  try {
    data = await gql(
      `query ($page: Int, $genre: String, $tag: String, $search: String, $sort: [MediaSort], $isAdult: Boolean) {
        Page(page: $page, perPage: 25) {
          media(type: ANIME, genre: $genre, tag: $tag, search: $search, sort: $sort, isAdult: $isAdult) {
            ${MEDIA_FIELDS}
          }
        }
      }`,
      {
        page: opts.page ?? 1,
        genre,
        tag,
        search: opts.search,
        sort: opts.sort ? [opts.sort] : undefined,
        // Hide adult entries unless the user explicitly picked an adult genre
        isAdult: genre && ADULT_GENRES.has(genre) ? undefined : false,
      }
    );
  } catch (err) {
    // A MAL genre with no AniList equivalent → empty result, not an outage
    if (tag && err instanceof Error && /invalid|not found/i.test(err.message)) {
      console.warn(`AniList has no equivalent for "${opts.genre}"`);
      return [];
    }
    throw err;
  }

  return data.Page.media.filter((m: any) => m.idMal).map(toAnime);
}

export async function fetchAnimeDetailByMalId(id: number): Promise<AnimeDetail | null> {
  let data: any;
  try {
    data = await gql(
      `query ($idMal: Int) {
        Media(idMal: $idMal, type: ANIME) {
          ${MEDIA_FIELDS}
          duration
          studios { nodes { name isAnimationStudio } }
        }
      }`,
      { idMal: id }
    );
  } catch (err) {
    if (err instanceof Error && err.message.includes("Not Found")) return null;
    throw err;
  }

  const m = data.Media;
  if (!m?.idMal) return null;

  const studios = m.studios?.nodes ?? [];
  return {
    ...toAnime(m),
    duration: m.duration ? `${m.duration} min per ep` : "",
    studios: studios.filter((s: any) => s.isAnimationStudio).map((s: any) => s.name),
    producers: studios.filter((s: any) => !s.isAnimationStudio).map((s: any) => s.name),
    background: "",
  };
}

export async function fetchGenreNames(): Promise<string[]> {
  const data = await gql(`query { GenreCollection }`, {});
  return data.GenreCollection as string[];
}
