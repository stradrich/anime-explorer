import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import type { Anime, AnimeDetail } from "../api/dataTypes";
import { fetchAllAnime, fetchAllGenres, fetchAnimeById as fetchAnimeByIdApi, type RawGenre, fetchAllTopAnime, searchAnime } from "../api/jikan";

interface AnimeContextType {
  allAnime: Anime[];
  animeById: Record<number, AnimeDetail>;
  fetchNextPage: () => Promise<void>;
  fetchAnimeById: (id: number) => Promise<void>;
  loading: boolean;
  genreOptions: RawGenre[];
  fetchAnimeByQuery: (query: string, page?: number, adult?: boolean) => Promise<Anime[]>;
  topAnime: Anime[];
  fetchNextTopPage: () => Promise<void>;
  loadingTop: boolean;
  apiError: boolean;
  reportApiError: () => void;
  retryFetch: () => void;
}

const AnimeContext = createContext<AnimeContextType | undefined>(undefined);

export const AnimeProvider = ({ children }: { children: ReactNode }) => {
  const [allAnime, setAllAnime] = useState<Anime[]>([]);
  const [animeById, setAnimeById] = useState<Record<number, AnimeDetail>>({});
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const fetchedPagesRef = useRef<Set<number>>(new Set());
  const [genreOptions, setGenreOptions] = useState<RawGenre[]>([]);
  const [topAnime, setTopAnime] = useState<Anime[]>([]);
  const [topPage, setTopPage] = useState(1);
  const [loadingTop, setLoadingTop] = useState(false);
   const fetchedTopPagesRef = useRef<Set<number>>(new Set());
  const [apiError, setApiError] = useState(false);

  useEffect(() => {
    fetchAllGenres().then(setGenreOptions).catch(() => setApiError(true));
  }, []);

   // --- Default anime pagination ---
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
      // allow this page to be retried
      fetchedPagesRef.current.delete(page);
      setApiError(true);
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
      setApiError(true);
    }
  };

const fetchAnimeByQuery = async (query: string, page: number = 1, adult = false): Promise<Anime[]> => {
  try {
    const results = await searchAnime(query, page, adult);
    const seen = new Set(allAnime.map(a => a.id));
    return results.filter((anime) => !seen.has(anime.id));
  } catch (err) {
    console.error("Failed to fetch search results:", err);
    setApiError(true);
    return [];
  }
};


 // --- Top anime pagination ---
  const fetchNextTopPage = async () => {
    if (loadingTop || fetchedTopPagesRef.current.has(topPage)) return;
    fetchedTopPagesRef.current.add(topPage);
    setLoadingTop(true);
    try {
      const data = await fetchAllTopAnime(topPage);
      setTopAnime(prev => {
        const seen = new Set(prev.map(a => a.id));
        const uniqueNew = data.filter(a => !seen.has(a.id));
        return [...prev, ...uniqueNew];
      });
      setTopPage(p => p + 1);
    } catch (err) {
      console.error("Failed to fetch top anime:", err);
      fetchedTopPagesRef.current.delete(topPage);
      setApiError(true);
    } finally {
      setLoadingTop(false);
    }
  };

  useEffect(() => {
    fetchNextPage();
    fetchNextTopPage();
  }, []);

  const reportApiError = () => setApiError(true);

  const retryFetch = () => {
    setApiError(false);
    if (genreOptions.length === 0) {
      fetchAllGenres().then(setGenreOptions).catch(() => setApiError(true));
    }
    fetchNextPage();
    fetchNextTopPage();
  };

  return (
    <AnimeContext.Provider value={{ allAnime, animeById, fetchNextPage, fetchAnimeById, loading, genreOptions, fetchAnimeByQuery, topAnime, fetchNextTopPage, loadingTop, apiError, reportApiError, retryFetch }}>
      {children}
    </AnimeContext.Provider>
  );
};

export const useAnime = () => {
  const context = useContext(AnimeContext);
  if (!context) throw new Error("useAnime must be used inside AnimeProvider");
  return context;
};
