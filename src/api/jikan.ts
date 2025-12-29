// GET /v4/top/anime?page=:page          → AnimeMainList infinite scrolling
// GET /v4/anime/{id}/full               → AnimeDetailedPage
// GET /v4/anime?genres=:genreId&page=:page → Filtering (not implemented)

export type Anime = {
  id: number; // normalized mal_id
  title: string;
  imageUrl: string;
  synopsis: string;
  episodes: number;
  score: number;
  type: string;
  rating: string;
  year?: number | null;
  genres?: string[];
};


export type AnimeDetail = Anime & {
  duration?: string;
  studios?: string[];
  producers?: string[];
  background?: string;
};

// Generic fetch wrapper with retry for 429
async function safeFetch(url: string, retries = 3, delay = 1000): Promise<any> {
  try {
    const res = await fetch(url);

    if (res.status === 429) {
      if (retries > 0) {
        console.warn(`Rate limited. Retrying in ${delay}ms...`);
        await new Promise((r) => setTimeout(r, delay));
        return safeFetch(url, retries - 1, delay * 2); // exponential backoff
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

// Fetch top anime list
export async function fetchTopAnime(page: number = 1): Promise<Anime[]> {
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

// Fetch anime details by ID
// export async function fetchAnimeById(id: number): Promise<AnimeDetail> {
//   const anime = await safeFetch(`https://api.jikan.moe/v4/anime/${id}/full`);
//   if (!anime) throw new Error(`Anime ${id} not found or rate-limited`);

//   return {
//     id: anime.mal_id,
//     title: anime.title || "",
//     imageUrl: anime.images?.jpg?.image_url || "",
//     synopsis: anime.synopsis || "",
//     episodes: anime.episodes ?? 0,
//     score: anime.score ?? 0,
//     type: anime.type || "",
//     rating: anime.rating || "",
//     year: anime.year ?? null,
//     duration: anime.duration || "",
//     studios: anime.studios?.map((s: any) => s.name) || [],
//     producers: anime.producers?.map((p: any) => p.name) || [],
//     background: anime.background || "",
//     genres: anime.genres?.map((g: any) => g.name) || [],
//   };
// }

// Fetch anime by genre (with pagination)
// export async function fetchAnimeByGenre(
//   genre: string,
//   page: number = 1
// ): Promise<Anime[]> {
//   const data = await safeFetch(
//     `https://api.jikan.moe/v4/anime?genres=${encodeURIComponent(
//       genre
//     )}&order_by=popularity&sort=desc&page=${page}`
//   );
//   if (!data) return [];

//   return data.map((anime: any) => ({
//     id: anime.mal_id,
//     title: anime.title || "",
//     imageUrl: anime.images?.jpg?.image_url || "",
//     synopsis: anime.synopsis || "",
//     episodes: anime.episodes ?? 0,
//     score: anime.score ?? 0,
//     type: anime.type || "",
//     rating: anime.rating || "",
//     year: anime.year ?? null,
//     genres: anime.genres?.map((g: any) => g.name) || [],
//   }));
// }
