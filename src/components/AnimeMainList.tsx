import LoadingSkeleton from "../components/ui/loading-skeleton";
import AnimeCard from "./AnimeCard";
import type { Anime } from "../api/dataTypes";
// // import { mockAnimeArr } from "../types/mockData/anime"; // keep for reference
import { useAnime } from "../context/AnimeContext";
import { useEffect, useRef, useState } from "react";
import { fetchAnimeByCategory } from "../api/jikan";

const ANIME_DISPLAY_COUNT = 8;
const MAX_SEARCH_PAGE = 3;

type Mode = "default" | "genre" | "search" | "top";

export default function AnimeMainList() {
  const { allAnime, fetchNextPage, loading: contextLoading, genreOptions, fetchAnimeByQuery, topAnime, fetchNextTopPage, loadingTop} = useAnime();

  // console.log(genreOptions);
  
  const [mode, setMode] = useState<Mode>("default");
  // console.log(mode);
  
  // visible UI count
  const [visibleCount, setVisibleCount] = useState(ANIME_DISPLAY_COUNT);

  // infinite scroll
  const [infiniteScrollEnabled, setInfiniteScrollEnabled] = useState(false);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  // --- Genre ---
  // const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  // const [selectedGenre, setSelectedGenre] = useState<number | "top" | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<number | "top" | null>("top");
  const [animeList, setAnimeList] = useState<Anime[]>([]);
  const [genrePage, setGenrePage] = useState(1);
  const [genreLoading, setGenreLoading] = useState(false);

  // --- Search ---
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Anime[]>([]);
  const searchPageRef = useRef(1);
  const searchLoadingRef = useRef(false);

  // --- Determine mode ---
  useEffect(() => {
    if (debouncedQuery) setMode("search");
    else if (selectedGenre === "top") setMode("top");
    else if (selectedGenre) setMode("genre");
    else setMode("default");
  }, [debouncedQuery, selectedGenre]);

  // --- Reset visibleCount on mode change ---
  useEffect(() => {
    setVisibleCount(ANIME_DISPLAY_COUNT);
  }, [mode]);

  // --- Search debounce ---
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedQuery(searchQuery), 250);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // --- Fetch search results ---
  useEffect(() => {
    if (!debouncedQuery) {
      setSearchResults([]);
      searchPageRef.current = 1;
      return;
    }

    let cancelled = false;
    searchLoadingRef.current = true;
    fetchAnimeByQuery(debouncedQuery, 1)
      .then((data) => {
        if (!cancelled) setSearchResults(data);
        searchPageRef.current = 2;
      })
      .finally(() => (searchLoadingRef.current = false));

    return () => { cancelled = true };
  }, [debouncedQuery]);

  const fetchNextSearchPage = async () => {
    if (searchLoadingRef.current) return;
    if (searchPageRef.current > MAX_SEARCH_PAGE) return;

    searchLoadingRef.current = true;
    try {
      const data = await fetchAnimeByQuery(debouncedQuery, searchPageRef.current);
      setSearchResults((prev) => [...prev, ...data]);
      searchPageRef.current += 1;
    } catch (err) {
      console.error("Search fetch error:", err);
    } finally {
      searchLoadingRef.current = false;
    }
  };

  // --- Fetch genre page ---
  useEffect(() => {
    // if (!selectedGenre) return;
    if (typeof selectedGenre !== "number") return;

    let cancelled = false;
    setGenreLoading(true);

    fetchAnimeByCategory("genres", selectedGenre, genrePage)
      .then((data) => {
        if (!cancelled) {
          setAnimeList((prev) => (genrePage === 1 ? data : [...prev, ...data]));
        }
      })
      .finally(() => setGenreLoading(false));

    return () => { cancelled = true };
  }, [selectedGenre, genrePage]);

  // --- Load more button ---
  const loadMore = () => {
    setVisibleCount((prev) => prev + ANIME_DISPLAY_COUNT);
    setInfiniteScrollEnabled(true);

    if (mode === "default") fetchNextPage();
    else if (mode === "top") fetchNextTopPage();
    else if (mode === "genre") setGenrePage((p) => p + 1);
    else if (mode === "search") fetchNextSearchPage();
  };

  // --- Infinite scroll ---
  useEffect(() => {
    if (!infiniteScrollEnabled || !loaderRef.current) return;

    const observer = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return;

      setVisibleCount((prev) => prev + ANIME_DISPLAY_COUNT);

      if (mode === "default") fetchNextPage();
      else if (mode === "top") fetchNextTopPage();
      else if (mode === "genre") setGenrePage((p) => p + 1);
      else if (mode === "search") fetchNextSearchPage();
    }, { rootMargin: "200px" });

    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [infiniteScrollEnabled, mode, genreLoading, contextLoading, loadingTop]);

  // --- Determine what to show ---
  // const sourceAnimes =
  //   mode === "search" ? searchResults :
  //   mode === "genre" ? Array.from(new Map(animeList.map(a => [a.id, a])).values()) :
  //   allAnime;
    const sourceAnimes =
    mode === "search" ? searchResults :
    mode === "genre" ? Array.from(new Map(animeList.map(a => [a.id, a])).values()) :
    mode === "top" ? topAnime :
    allAnime;


  const visibleAnimes = sourceAnimes.slice(0, visibleCount);

  // --- Clear search when switching to genre ---
  useEffect(() => {
    if (selectedGenre !== null) {
      // Clear search state
      setSearchQuery("");
      setDebouncedQuery("");
      setSearchResults([]);
      searchPageRef.current = 1;

      // Reset visible count and genre page
      setVisibleCount(ANIME_DISPLAY_COUNT);
      setGenrePage(1);
      setAnimeList([]);

      // prevent infinite scroll from firing immediately
      setInfiniteScrollEnabled(false);
    }
  }, [selectedGenre]);

  return (
    <section className="container">
      <header style={{ marginBottom: "1rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 600 }}>Discover Anime</h1>
        <p style={{ color: "#6b7280" }}>Browse popular anime and your personal favorites</p>
      </header>

      <div style={{ marginBottom: "1.5rem" }}>
        <label style={{ fontWeight: 500 }}>Filter by Genre</label>
        <select
          value={selectedGenre ?? ""}
          // onChange={(e) => setSelectedGenre(Number(e.target.value))}
            onChange={(e) =>
              setSelectedGenre(
                e.target.value === "top" ? "top" :
                e.target.value === "" ? null :
                Number(e.target.value)
              )
            }
          style={{ marginLeft: "0.5rem", padding: "0.25rem 0.5rem" }}
        >
          <option value="top">Top Anime</option>
          <option value="">All</option>
          {genreOptions.map((genre) => (
            <option key={genre.mal_id} value={genre.mal_id}>
              {genre.name}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: "1.5rem" }}>
        <label style={{ fontWeight: 500 }}>Search Anime</label>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Type anime name..."
          style={{ marginLeft: "0.5rem", padding: "0.25rem 0.5rem", width: "200px" }}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "1rem" }}>
        {visibleAnimes.map((anime: Anime, idx: number) => (
          <AnimeCard key={`${anime.id}-${idx}`} anime={anime} />
        ))}
        {(contextLoading || genreLoading || searchLoadingRef.current || loadingTop) && <LoadingSkeleton count={ANIME_DISPLAY_COUNT} />}
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

