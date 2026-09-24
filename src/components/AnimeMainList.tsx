import LoadingSkeleton from "../components/ui/loading-skeleton";
import AnimeCard from "./AnimeCard";
import type { Anime } from "../api/dataTypes";
// // import { mockAnimeArr } from "../types/mockData/anime"; // keep for reference
import { useAnime } from "../context/AnimeContext";
import { useEffect, useRef, useState } from "react";
import { fetchAnimeByCategory } from "../api/jikan";
import Button from "@mui/material/Button";

const ANIME_DISPLAY_COUNT = 8;
const MAX_SEARCH_PAGE = 3;

type Mode = "default" | "genre" | "search" | "top";

export default function AnimeMainList() {
  const { allAnime, fetchNextPage, loading: contextLoading, genreOptions, fetchAnimeByQuery, topAnime, fetchNextTopPage, loadingTop, apiError, reportApiError, retryFetch } = useAnime();
  const [mode, setMode] = useState<Mode>("default");
  // visible anime count
  const [visibleCount, setVisibleCount] = useState(ANIME_DISPLAY_COUNT);
  // infinite scroll
  const [infiniteScrollEnabled, setInfiniteScrollEnabled] = useState(false);
  const loaderRef = useRef<HTMLDivElement | null>(null);
  // --- Genre ---
  const [selectedGenre, setSelectedGenre] = useState<number | "top" | null>("top");
  const [animeList, setAnimeList] = useState<Anime[]>([]);
  const [genrePage, setGenrePage] = useState(1);
  const [genreLoading, setGenreLoading] = useState(false);
  // false once a genre page comes back empty or fails, so infinite scroll stops paging
  const [genreHasMore, setGenreHasMore] = useState(true);
  const genreLoadingRef = useRef(false);
  // --- Search ---
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Anime[]>([]);
  const searchPageRef = useRef(1);
  const searchLoadingRef = useRef(false);
  // bumped by the Retry button to re-run the genre/search effects
  const [retryKey, setRetryKey] = useState(0);
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

  // Search ignores the genre filter, except that selecting an adult genre opts
  // the search into adult titles too (the AniList fallback hides them otherwise).
  const selectedGenreName = genreOptions.find((g) => g.mal_id === selectedGenre)?.name;
  const adultSearch = selectedGenreName === "Hentai";

  // --- Fetch search results ---
  useEffect(() => {
    if (!debouncedQuery) {
      setSearchResults([]);
      searchPageRef.current = 1;
      return;
    }

    let cancelled = false;
    searchLoadingRef.current = true;
    fetchAnimeByQuery(debouncedQuery, 1, adultSearch)
      .then((data) => {
        if (!cancelled) setSearchResults(data);
        searchPageRef.current = 2;
      })
      .finally(() => (searchLoadingRef.current = false));

    return () => { cancelled = true };
  }, [debouncedQuery, adultSearch, retryKey]);

  const fetchNextSearchPage = async () => {
    if (searchLoadingRef.current) return;
    if (searchPageRef.current > MAX_SEARCH_PAGE) return;

    searchLoadingRef.current = true;
    try {
      const data = await fetchAnimeByQuery(debouncedQuery, searchPageRef.current, adultSearch);
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
    if (typeof selectedGenre !== "number") return;

    let cancelled = false;
    setGenreLoading(true);
    genreLoadingRef.current = true;

    fetchAnimeByCategory("genres", selectedGenre, genrePage, selectedGenreName)
      .then((data) => {
        if (cancelled) return;
        setAnimeList((prev) => (genrePage === 1 ? data : [...prev, ...data]));
        // an empty page means we've run past the last page — stop paging
        if (data.length === 0) setGenreHasMore(false);
      })
      .catch(() => {
        if (cancelled) return;
        setGenreHasMore(false);
        reportApiError();
      })
      .finally(() => {
        if (cancelled) return;
        genreLoadingRef.current = false;
        setGenreLoading(false);
      });

    return () => { cancelled = true };
  }, [selectedGenre, genrePage, retryKey]);

  const handleRetry = () => {
    retryFetch();
    setGenreHasMore(true);
    setRetryKey((k) => k + 1);
  };

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
  // The observer is NOT re-created on loading toggles: doing so re-fired the
  // callback every time a fetch finished while the sentinel was still in view
  // (e.g. an empty grid), paging endlessly and tripping API rate limits.
  // It is torn down entirely while an API error is showing; Retry re-arms it.
  useEffect(() => {
    if (!infiniteScrollEnabled || apiError || !loaderRef.current) return;

    const observer = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) return;

      setVisibleCount((prev) => prev + ANIME_DISPLAY_COUNT);

      if (mode === "default") fetchNextPage();
      else if (mode === "top") fetchNextTopPage();
      else if (mode === "genre") {
        if (genreLoadingRef.current) return;
        setGenrePage((p) => p + 1);
      }
      else if (mode === "search") fetchNextSearchPage();
    }, { rootMargin: "200px" });

    observer.observe(loaderRef.current);
    return () => observer.disconnect();
  }, [infiniteScrollEnabled, mode, apiError, genreHasMore]);

  // --- Determine what to show ---
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
      setGenreHasMore(true);

      // prevent infinite scroll from firing immediately
      setInfiniteScrollEnabled(false);
    }
  }, [selectedGenre]);

  return (
    <section className="space-y-6">
  <header className="space-y-2">
    <h1 className="text-3xl font-bold text-gray-900">Discover Anime</h1>
    <p className="text-gray-600">Browse popular anime and your personal favorites</p>
  </header>

  <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
    {/* Genre Filter */}
    <div className="flex flex-col">
      <label className="mb-1 text-gray-700 font-thin">Filter by Genre</label>
      <select
        value={selectedGenre ?? ""}
        onChange={(e) =>
          setSelectedGenre(
            e.target.value === "top" ? "top" :
            e.target.value === "" ? null :
            Number(e.target.value)
          )
        }
        className="px-3 py-2 font-medium rounded-lg border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-600 transition"
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

    {/* Search Input */}
    <div className="flex flex-col flex-1">
      <label className="mb-1 text-gray-700 font-thin">Search Anime</label>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Type anime name..."
        className="px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:border-gray-600 transition w-full"
      />
    </div>
  </div>

  {/* API outage banner */}
  {apiError && (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-lg border border-red-300 bg-red-50 px-4 py-3">
      <p className="flex-1 text-red-800">
        The anime database (Jikan / MyAnimeList) is unreachable right now, so some
        content couldn't load. This is an upstream outage — please try again in a moment.
      </p>
      <Button
        variant="outlined"
        onClick={handleRetry}
        sx={{
          color: "black",
          borderColor: "black",
          flexShrink: 0,
          "&:hover": { backgroundColor: "rgba(49, 49, 49, 0.08)", borderColor: "black" },
          "&:focus": { outline: "none", boxShadow: "none" },
        }}
      >
        Retry
      </Button>
    </div>
  )}

  {/* Anime Grid */}
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
    {visibleAnimes.map((anime: Anime, idx: number) => (
      <AnimeCard key={`${anime.id}-${idx}`} anime={anime} />
    ))}
    {(contextLoading || genreLoading || searchLoadingRef.current || loadingTop) && (
      <LoadingSkeleton count={ANIME_DISPLAY_COUNT} />
    )}
  </div>

  {/* Empty state */}
  {visibleAnimes.length === 0 &&
    !(contextLoading || genreLoading || searchLoadingRef.current || loadingTop) &&
    !apiError && (
      <p className="text-center text-gray-500 py-8">
        No results found. If this keeps happening, the primary database (MyAnimeList)
        may be down and this {mode === "search" ? "search" : "genre"} isn't available
        on the fallback source.
        {mode === "search" && !adultSearch && (
          <> Adult titles only appear in search when the Hentai genre is selected.</>
        )}
      </p>
    )}

  {/* Load More Button */}
  {!infiniteScrollEnabled && (
    <div className="flex justify-center mt-6">
      <Button
        variant="outlined"
        color="primary"
        onClick={loadMore}
        sx={{
          color: "black",                 // text color
          borderColor: "black",           // border color
          "&:hover": {
            backgroundColor: "rgba(49, 49, 49, 0.08)", // subtle black hover
            borderColor: "black",        // keep border black on hover
          },
          "&:focus": {
            outline: "none",             // remove default focus ring
            boxShadow: "none",           // remove default focus shadow
          },
        }}
      >
        Load more
      </Button>
    </div>
  )}

  {infiniteScrollEnabled && !apiError && (mode !== "genre" || genreHasMore) && <div ref={loaderRef} />}
</section>

  );
}

