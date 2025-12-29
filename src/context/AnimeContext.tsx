import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import type { Anime, AnimeDetail } from "../api/dataTypes";
import { fetchAllAnime, fetchAllGenres, fetchAnimeById as fetchAnimeByIdApi, type RawGenre } from "../api/jikan";

interface AnimeContextType {
  allAnime: Anime[];
  animeById: Record<number, AnimeDetail>;
  fetchNextPage: () => Promise<void>;
  fetchAnimeById: (id: number) => Promise<void>;
  loading: boolean;
  genreOptions: RawGenre[];
  fetchAnimeByQuery: (query: string, page?: number) => Promise<Anime[]>;
}

const AnimeContext = createContext<AnimeContextType | undefined>(undefined);

export const AnimeProvider = ({ children }: { children: ReactNode }) => {
  const [allAnime, setAllAnime] = useState<Anime[]>([]);
  const [animeById, setAnimeById] = useState<Record<number, AnimeDetail>>({});
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const fetchedPagesRef = useRef<Set<number>>(new Set());
  const [genreOptions, setGenreOptions] = useState<RawGenre[]>([]);

  useEffect(() => {
    fetchAllGenres().then(setGenreOptions);
  }, []);

  const fetchNextPage = async () => {
    if (loading || fetchedPagesRef.current.has(page)) return;

    fetchedPagesRef.current.add(page);
    setLoading(true);

    try {
      const data = await fetchAllAnime(page);

      // filter duplicates
      setAllAnime((prev) => {
        const seen = new Set(prev.map((a) => a.id));
        const uniqueNew = data.filter((a) => !seen.has(a.id));
        return [...prev, ...uniqueNew];
      });

      setPage((p) => p + 1);
    } catch (err) {
      console.error("Failed to fetch anime:", err);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchAnimeById = async (id: number) => {
    if (animeById[id]) return;
    try {
      const anime = await fetchAnimeByIdApi(id);
      if (anime) {
        setAnimeById((prev) => ({ ...prev, [id]: anime }));
      }
    } catch (err) {
      console.error(`Failed to fetch anime ${id}:`, err);
    }
  };

//   const fetchAnimeByQuery = async (query: string, page: number = 1): Promise<Anime[]> => {
//   setLoading(true);
//   try {
//     const response = await fetch(`https://api.jikan.moe/v4/anime?q=${query}&page=${page}`);
//     const json = await response.json();
//     if (!json.data) return [];
    
//     // remove duplicates based on current allAnime
//     const seen = new Set(allAnime.map(a => a.id));
//     const uniqueNew = json.data.filter((anime: any) => !seen.has(anime.mal_id));
    
//     // map to Anime type
//     return uniqueNew.map((anime: any) => ({
//       id: anime.mal_id,
//       title: anime.title || "",
//       imageUrl: anime.images?.jpg?.image_url || "",
//       synopsis: anime.synopsis || "",
//       episodes: anime.episodes ?? 0,
//       score: anime.score ?? 0,
//       type: anime.type || "",
//       rating: anime.rating || "",
//       year: anime.year ?? null,
//       genres: anime.genres?.map((g: any) => g.name) || [],
//     }));
//   } catch (err) {
//     console.error("Failed to fetch search results:", err);
//     return [];
//   } finally {
//     setLoading(false);
//   }
// };

const fetchAnimeByQuery = async (query: string, page: number = 1): Promise<Anime[]> => {
  try {
    const response = await fetch(`https://api.jikan.moe/v4/anime?q=${query}&page=${page}`);
    const json = await response.json();
    if (!json.data) return [];

    return json.data.map((anime: any) => ({
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
  } catch (err) {
    console.error("Failed to fetch search results:", err);
    return [];
  }
};


  useEffect(() => {
    fetchNextPage();
  }, []);

  return (
    <AnimeContext.Provider value={{ allAnime, animeById, fetchNextPage, fetchAnimeById, loading, genreOptions, fetchAnimeByQuery }}>
      {children}
    </AnimeContext.Provider>
  );
};

export const useAnime = () => {
  const context = useContext(AnimeContext);
  if (!context) throw new Error("useAnime must be used inside AnimeProvider");
  return context;
};
