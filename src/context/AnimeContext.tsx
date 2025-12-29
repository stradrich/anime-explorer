import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import type { Anime, AnimeDetail } from "../api/jikan";
import { fetchTopAnime, 
          // fetchAnimeById as fetchAnimeByIdApi
        } from "../api/jikan";

interface AnimeContextType {
  topAnime: Anime[];
  animeById: Record<number, AnimeDetail>;
  fetchNextPage: () => Promise<void>;
  // fetchAnimeById: (id: number) => Promise<void>;
  loading: boolean;
}

const AnimeContext = createContext<AnimeContextType | undefined>(undefined);

export const AnimeProvider = ({ children }: { children: ReactNode }) => {
  const [topAnime, setTopAnime] = useState<Anime[]>([]);
  const [animeById, setAnimeById] = useState<Record<number, AnimeDetail>>({});
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const fetchedPagesRef = useRef<Set<number>>(new Set());

  const fetchNextPage = async () => {
    if (loading || fetchedPagesRef.current.has(page)) return;

    fetchedPagesRef.current.add(page);
    setLoading(true);

    try {
      const data = await fetchTopAnime(page);

      setTopAnime((prev) => {
        const seen = new Set(prev.map((a) => a.id));
        const uniqueNew = data.filter((a) => !seen.has(a.id));
        return [...prev, ...uniqueNew];
      });

      // setAnimeById((prev) => {
      //   const copy = { ...prev };
      //   data.forEach((anime) => {
      //     copy[anime.id] = anime;
      //   });
      //   return copy;
      // });

      setPage((p) => p + 1);
    } catch (err) {
      console.error("Failed to fetch top anime:", err);
    } finally {
      setLoading(false);
    }
  };

  // const fetchAnimeById = async (id: number) => {
  //   if (animeById[id]) return;
  //   try {
  //     const anime = await fetchAnimeByIdApi(id);
  //     setAnimeById((prev) => ({ ...prev, [id]: anime }));
  //   } catch (err) {
  //     console.error(`Failed to fetch anime ${id}:`, err);
  //   }
  // };


  useEffect(() => {
    fetchNextPage();
  }, []);

  return (
    <AnimeContext.Provider 
        value={{ topAnime, 
                //  animeById, 
                 fetchNextPage, 
                //  fetchAnimeById, 
                 loading }}>
      {children}
    </AnimeContext.Provider>
  );
};

export const useAnime = () => {
  const context = useContext(AnimeContext);
  if (!context) throw new Error("useAnime must be used inside AnimeProvider");
  return context;
};
