// src/components/AnimeMainList.tsx
import LoadingSkeleton from "../components/ui/loading-skeleton";
import AnimeCard from "./AnimeCard";
import type { Anime } from "../api/dataTypes";
// import { mockAnimeArr } from "../types/mockData/anime"; // keep for reference
import { useAnime } from "../context/AnimeContext";
import { useEffect, useRef, useState } from "react";
import { fetchAnimeByCategory } from "../api/jikan";


const ANIME_DISPLAY_COUNT = 8;

export default function AnimeMainList() {
  const { allAnime, fetchNextPage, loading: contextLoading, genreOptions} = useAnime();
  const [visibleCount, setVisibleCount] = useState(ANIME_DISPLAY_COUNT);
  const [infiniteScrollEnabled, setInfiniteScrollEnabled] = useState(false);
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  const [animeList, setAnimeList] = useState<Anime[]>([]); // fetch genre based on selectedGenre during filtering 
  const [genrePage, setGenrePage] = useState(1);
  const [genreLoading, setGenreLoading] = useState(false);

  
  const isGenreMode = selectedGenre !== null;

  // useEffect(() => {
  //   const timeout = setTimeout(() => {
  //     if (selectedGenre) {
  //       fetchAnimeByCategory("genres", selectedGenre, 1).then(setAnimeList);
  //     }
  //   }, 500); // wait 500ms after user stops changing

  //   return () => clearTimeout(timeout);
  // }, [selectedGenre]);

  // console.log(animeList);
  // console.log(genreOptions);
  // console.log(selectedGenre);
  
  // const visibleAnimes = mockAnimeArr.slice(0, visibleCount); // old mock
  // const visibleAnimes = allAnime.slice(0, visibleCount);
  // const sourceAnimes = selectedGenre ? animeList : allAnime;
  const sourceAnimes = selectedGenre
                        ? Array.from(new Map(animeList.map(a => [a.id, a])).values())
                        : allAnime;
  const visibleAnimes = sourceAnimes.slice(0, visibleCount);

  // useEffect(() => {
  //   if (!selectedGenre) {
  //     setAnimeList([]);
  //     setGenrePage(1);
  //     setVisibleCount(ANIME_DISPLAY_COUNT);
  //     return;
  //   }

  //   setGenrePage(1);
  //   setAnimeList([]);
  //   setVisibleCount(ANIME_DISPLAY_COUNT);
  // }, [selectedGenre]);

  useEffect(() => {
  if (!selectedGenre) return;

  let cancelled = false;
  setGenreLoading(true);

  fetchAnimeByCategory("genres", selectedGenre, genrePage)
      .then((data) => {
        if (!cancelled) {
          setAnimeList((prev) =>
            genrePage === 1 ? data : [...prev, ...data]
          );
        }
      })
      .finally(() => setGenreLoading(false));

    return () => {
      cancelled = true;
    };
  }, [selectedGenre, genrePage]);


  const loadMore = () => {
    setVisibleCount((prev) => prev + ANIME_DISPLAY_COUNT);
    setInfiniteScrollEnabled(true);
    // Fetch next page if we reach end of current array
    if (visibleCount + ANIME_DISPLAY_COUNT >= allAnime.length) {
      fetchNextPage();
    }
  };

  // Infinite Scroll
  // useEffect(() => {
  //   if (!infiniteScrollEnabled || selectedGenre) return;

  //   const observer = new IntersectionObserver(
  //     (entries) => {
  //       if (entries[0].isIntersecting && !contextLoading) {
  //         setVisibleCount((prev) => prev + ANIME_DISPLAY_COUNT);
  //         fetchNextPage();
  //       }
  //     },
  //     { rootMargin: "200px" }
  //   );

  //   if (loaderRef.current) observer.observe(loaderRef.current);
  //   return () => observer.disconnect();
  // }, [infiniteScrollEnabled, contextLoading, fetchNextPage]);

  // if (contextLoading && allAnime.length === 0) {
  //   return <LoadingSkeleton count={ANIME_DISPLAY_COUNT} />;
  // }

  useEffect(() => {
    if (!infiniteScrollEnabled) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;

        setVisibleCount((prev) => prev + ANIME_DISPLAY_COUNT);

        if (isGenreMode && !genreLoading) {
          setGenrePage((p) => p + 1);
        }

        if (!isGenreMode && !contextLoading) {
          fetchNextPage();
        }
      },
      { rootMargin: "200px" }
    );

    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [
    infiniteScrollEnabled,
    isGenreMode,
    genreLoading,
    contextLoading,
    fetchNextPage,
  ]);
  
  useEffect(() => {
    setVisibleCount(ANIME_DISPLAY_COUNT);
  }, [selectedGenre]);

  return (
    <section className="container">
      <header style={{ marginBottom: "1rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 600 }}>Discover Anime</h1>
        <p style={{ color: "#6b7280" }}>Browse popular anime and your personal favorites</p>
      </header>

      {/* <div style={{ marginBottom: "1.5rem" }}>
        <label style={{ fontWeight: 500 }}>Filter by Genre</label>
      </div> */}

      <div style={{ marginBottom: "1.5rem" }}>
        <label style={{ fontWeight: 500 }}>Filter by Genre</label>
        <select
          value={selectedGenre ?? ""}
          onChange={(e) => setSelectedGenre(Number(e.target.value))}
          style={{ marginLeft: "0.5rem", padding: "0.25rem 0.5rem" }}
        >
          <option value="">All</option>
          {genreOptions.map((genre) => (
            <option key={genre.mal_id} value={genre.mal_id}>
              {genre.name}
            </option>
          ))}
        </select>
      </div>


      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "1rem" }}>
        {/* {visibleAnimes.map((anime: Anime) => (
          <AnimeCard key={anime.id} anime={anime} />
        ))} */}
        {visibleAnimes.map((anime: Anime, idx: number) => (
          <AnimeCard key={`${anime.id}-${idx}`} anime={anime} />
        ))}

        {/* {contextLoading && <LoadingSkeleton count={ANIME_DISPLAY_COUNT} />} */}
        {(contextLoading || genreLoading) && <LoadingSkeleton count={ANIME_DISPLAY_COUNT} />}
      </div>

      {!infiniteScrollEnabled && (
        <div style={{ marginTop: "2rem", textAlign: "center" }}>
          <button onClick={loadMore} style={{ padding: "0.75rem 1.5rem", borderRadius: "0.5rem", backgroundColor: "#e5e7eb" }}>
            Load more
          </button>
        </div>
      )}

      {infiniteScrollEnabled && <div ref={loaderRef} style={{ height: "40px", marginTop: "2rem" }} />}
    </section>
  );
}


