// src/components/AnimeMainList.tsx
import LoadingSkeleton from "../components/ui/loading-skeleton";
import AnimeCard from "./AnimeCard";
import type { Anime } from "../api/jikan";
// import { mockAnimeArr } from "../types/mockData/anime"; // keep for reference
import { useAnime } from "../context/AnimeContext";
import { useEffect, useRef, useState } from "react";

const ANIME_DISPLAY_COUNT = 8;

export default function AnimeMainList() {
  const { topAnime, fetchNextPage, loading: contextLoading } = useAnime();
  const [visibleCount, setVisibleCount] = useState(ANIME_DISPLAY_COUNT);
  const [infiniteScrollEnabled, setInfiniteScrollEnabled] = useState(false);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  // const visibleAnimes = mockAnimeArr.slice(0, visibleCount); // old mock
  const visibleAnimes = topAnime.slice(0, visibleCount);
  
  const loadMore = () => {
    setVisibleCount((prev) => prev + ANIME_DISPLAY_COUNT);
    setInfiniteScrollEnabled(true);
    // Fetch next page if we reach end of current array
    if (visibleCount + ANIME_DISPLAY_COUNT >= topAnime.length) {
      fetchNextPage();
    }
  };

  // Infinite Scroll
  useEffect(() => {
    if (!infiniteScrollEnabled) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !contextLoading) {
          setVisibleCount((prev) => prev + ANIME_DISPLAY_COUNT);
          fetchNextPage();
        }
      },
      { rootMargin: "200px" }
    );

    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [infiniteScrollEnabled, contextLoading, fetchNextPage]);

  if (contextLoading && topAnime.length === 0) {
    return <LoadingSkeleton count={ANIME_DISPLAY_COUNT} />;
  }

  return (
    <section className="container">
      <header style={{ marginBottom: "1rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 600 }}>Discover Anime</h1>
        <p style={{ color: "#6b7280" }}>Browse popular anime and your personal favorites</p>
      </header>

      <div style={{ marginBottom: "1.5rem" }}>
        <label style={{ fontWeight: 500 }}>Filter by Genre</label>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "1rem" }}>
        {visibleAnimes.map((anime: Anime) => (
          <AnimeCard key={anime.id} anime={anime} />
        ))}
        {contextLoading && <LoadingSkeleton count={ANIME_DISPLAY_COUNT} />}
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

