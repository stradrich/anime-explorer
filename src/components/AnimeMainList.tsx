import LoadingSkeleton from "../components/ui/loading-skeleton"
import AnimeCard from "./AnimeCard"
import type { Anime } from "../types/anime"
import { mockAnimeArr } from "../types/mockData/anime"
import { useEffect, useRef, useState } from "react"

const ANIME_DISPLAY_COUNT = 8;

export default function AnimeMainList() {
  const [loading, setLoading] = useState(false);
  const [visibleCount, setVisibleCount] = useState(ANIME_DISPLAY_COUNT);
  const [infiniteScrollEnabled, setInfiniteScrollEnabled] = useState(false);
 
  const loaderRef = useRef<HTMLDivElement | null>(null);

  // Initial loading
  useEffect(() => {
    setLoading(true);
    setTimeout(() => setLoading(false), 100);
  }, []);

  const visibleAnimes = mockAnimeArr.slice(0, visibleCount);

  // Load more 
  const loadMore = () => {
    setLoading(true);
    setTimeout(() => {
      setVisibleCount(prev => prev + ANIME_DISPLAY_COUNT)
      setInfiniteScrollEnabled(true); // switch to infinity scroll after clicking load more btn
      setLoading(false);
    }, 500) // simulate delay
  }

  // Infinite Scroll
  useEffect(() => {
    if (!infiniteScrollEnabled) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          visibleCount < mockAnimeArr.length &&
          !loading
        ) {
          setLoading(true);
          setTimeout(() => {
            setVisibleCount((prev) => prev + ANIME_DISPLAY_COUNT);
            setLoading(false);
          }, 500);
        }
      },
      {
        rootMargin: "200px",
      }
    );

    if (loaderRef.current) observer.observe(loaderRef.current);

    return () => observer.disconnect();
  }, [infiniteScrollEnabled, visibleCount, loading]);

  return (
    <section className="container">
      {/* Header */}
      <header style={{ marginBottom: "1rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 600 }}>
          Discover Anime
        </h1>
        <p style={{ color: "#6b7280" }}>
          Browse popular anime and your personal favorites
        </p>
      </header>

      {/* Filter Section */}
      <div style={{ marginBottom: "1.5rem" }}>
        <label style={{ fontWeight: 500 }}>
          Filter by Genre
        </label>
        {/* Genre dropdown goes here later */}
      </div>

      {/* Content Area */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          gap: "1rem",
        }}
      >
        {visibleAnimes.map((anime) => (
          <AnimeCard key={anime.id} anime={anime} />
        ))}
        {loading && <LoadingSkeleton count={ANIME_DISPLAY_COUNT} />}
      </div>

      {/* Pagination / Load More */}
      {!infiniteScrollEnabled && (
        <div style={{ marginTop: "2rem", textAlign: "center" }}>
          <button
            onClick={loadMore}
            // disabled
            style={{
              padding: "0.75rem 1.5rem",
              borderRadius: "0.5rem",
              backgroundColor: "#e5e7eb",
              // cursor: "not-allowed",
            }}
          >
            Load more
          </button>
        </div>
      )}

      {/* Infinite scroll sentinel */}
      {infiniteScrollEnabled && (
        <div
          ref={loaderRef}
          style={{ height: "40px", marginTop: "2rem" }}
        />
      )}
    </section>
  )
}
