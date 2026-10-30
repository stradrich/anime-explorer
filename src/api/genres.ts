// MyAnimeList genre taxonomy, bundled so the genre dropdown is always complete
// and never depends on Jikan being reachable. Snapshot of
// GET https://api.jikan.moe/v4/genres/anime taken 2026-09-24 (78 entries, max id 83),
// in Jikan's own order. MAL adds a genre a few times a year at most; jikan.ts
// refreshes this list from Jikan in the background when it is available.
//
// Re-audit:  curl -s https://api.jikan.moe/v4/genres/anime | jq '.data[] | {mal_id, name}'
//
// Every name here has a verified AniList genre/tag equivalent (or an explicit
// "no equivalent" entry) in anilist.ts, so filtering works on the fallback too.

export type GenreCategory = "genres" | "explicit_genres" | "themes" | "demographics";

export interface MalGenre {
  mal_id: number;
  /** MAL's official name. Drives the AniList mapping, so never change it for display. */
  name: string;
  category: GenreCategory;
  /** Better-known alternate name, shown in brackets in the dropdown. */
  aka?: string;
}

export const genreLabel = (g: MalGenre) => (g.aka ? `${g.name} (${g.aka})` : g.name);

export const GENRE_CATEGORY_LABELS: Record<GenreCategory, string> = {
  genres: "Genres",
  explicit_genres: "Explicit",
  themes: "Themes",
  demographics: "Demographics",
};

export const MAL_GENRES: MalGenre[] = [
  // Genres (18)
  { mal_id: 1, name: "Action", category: "genres" },
  { mal_id: 2, name: "Adventure", category: "genres" },
  { mal_id: 5, name: "Avant Garde", category: "genres" },
  { mal_id: 46, name: "Award Winning", category: "genres" },
  { mal_id: 28, name: "Boys Love", category: "genres", aka: "Yaoi" },
  { mal_id: 4, name: "Comedy", category: "genres" },
  { mal_id: 8, name: "Drama", category: "genres" },
  { mal_id: 10, name: "Fantasy", category: "genres" },
  { mal_id: 26, name: "Girls Love", category: "genres", aka: "Yuri" },
  { mal_id: 47, name: "Gourmet", category: "genres" },
  { mal_id: 14, name: "Horror", category: "genres" },
  { mal_id: 7, name: "Mystery", category: "genres" },
  { mal_id: 22, name: "Romance", category: "genres" },
  { mal_id: 24, name: "Sci-Fi", category: "genres" },
  { mal_id: 36, name: "Slice of Life", category: "genres" },
  { mal_id: 30, name: "Sports", category: "genres" },
  { mal_id: 37, name: "Supernatural", category: "genres" },
  { mal_id: 41, name: "Suspense", category: "genres" },

  // Explicit genres (3)
  { mal_id: 9, name: "Ecchi", category: "explicit_genres" },
  { mal_id: 49, name: "Erotica", category: "explicit_genres" },
  { mal_id: 12, name: "Hentai", category: "explicit_genres" },

  // Themes (52)
  { mal_id: 50, name: "Adult Cast", category: "themes" },
  { mal_id: 51, name: "Anthropomorphic", category: "themes" },
  { mal_id: 52, name: "CGDCT", category: "themes" },
  { mal_id: 53, name: "Childcare", category: "themes" },
  { mal_id: 54, name: "Combat Sports", category: "themes" },
  { mal_id: 81, name: "Crossdressing", category: "themes" },
  { mal_id: 55, name: "Delinquents", category: "themes" },
  { mal_id: 39, name: "Detective", category: "themes" },
  { mal_id: 56, name: "Educational", category: "themes" },
  { mal_id: 57, name: "Gag Humor", category: "themes" },
  { mal_id: 58, name: "Gore", category: "themes" },
  { mal_id: 35, name: "Harem", category: "themes" },
  { mal_id: 59, name: "High Stakes Game", category: "themes" },
  { mal_id: 13, name: "Historical", category: "themes" },
  { mal_id: 60, name: "Idols (Female)", category: "themes" },
  { mal_id: 61, name: "Idols (Male)", category: "themes" },
  { mal_id: 62, name: "Isekai", category: "themes" },
  { mal_id: 63, name: "Iyashikei", category: "themes" },
  { mal_id: 64, name: "Love Polygon", category: "themes" },
  { mal_id: 65, name: "Magical Sex Shift", category: "themes" },
  { mal_id: 66, name: "Mahou Shoujo", category: "themes" },
  { mal_id: 17, name: "Martial Arts", category: "themes" },
  { mal_id: 18, name: "Mecha", category: "themes" },
  { mal_id: 67, name: "Medical", category: "themes" },
  { mal_id: 38, name: "Military", category: "themes" },
  { mal_id: 19, name: "Music", category: "themes" },
  { mal_id: 6, name: "Mythology", category: "themes" },
  { mal_id: 68, name: "Organized Crime", category: "themes" },
  { mal_id: 69, name: "Otaku Culture", category: "themes" },
  { mal_id: 20, name: "Parody", category: "themes" },
  { mal_id: 70, name: "Performing Arts", category: "themes" },
  { mal_id: 71, name: "Pets", category: "themes" },
  { mal_id: 40, name: "Psychological", category: "themes" },
  { mal_id: 3, name: "Racing", category: "themes" },
  { mal_id: 72, name: "Reincarnation", category: "themes" },
  { mal_id: 73, name: "Reverse Harem", category: "themes" },
  { mal_id: 74, name: "Love Status Quo", category: "themes" },
  { mal_id: 21, name: "Samurai", category: "themes" },
  { mal_id: 23, name: "School", category: "themes" },
  { mal_id: 75, name: "Showbiz", category: "themes" },
  { mal_id: 29, name: "Space", category: "themes" },
  { mal_id: 11, name: "Strategy Game", category: "themes" },
  { mal_id: 31, name: "Super Power", category: "themes" },
  { mal_id: 76, name: "Survival", category: "themes" },
  { mal_id: 77, name: "Team Sports", category: "themes" },
  { mal_id: 78, name: "Time Travel", category: "themes" },
  { mal_id: 32, name: "Vampire", category: "themes" },
  { mal_id: 79, name: "Video Game", category: "themes" },
  { mal_id: 80, name: "Visual Arts", category: "themes" },
  { mal_id: 48, name: "Workplace", category: "themes" },
  { mal_id: 82, name: "Urban Fantasy", category: "themes" },
  { mal_id: 83, name: "Villainess", category: "themes" },

  // Demographics (5)
  { mal_id: 43, name: "Josei", category: "demographics" },
  { mal_id: 15, name: "Kids", category: "demographics" },
  { mal_id: 42, name: "Seinen", category: "demographics" },
  { mal_id: 25, name: "Shoujo", category: "demographics" },
  { mal_id: 27, name: "Shounen", category: "demographics" },
];
