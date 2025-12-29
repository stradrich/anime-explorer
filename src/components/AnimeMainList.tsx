// src/components/AnimeMainList.tsx
import LoadingSkeleton from "../components/ui/loading-skeleton";
import AnimeCard from "./AnimeCard";
import type { Anime } from "../api/dataTypes";
// import { mockAnimeArr } from "../types/mockData/anime"; // keep for reference
import { useAnime } from "../context/AnimeContext";
import { useEffect, useRef, useState } from "react";
import { fetchAnimeByCategory } from "../api/jikan";


const ANIME_DISPLAY_COUNT = 8;
const MAX_SEARCH_PAGE = 3;

export default function AnimeMainList() {
  const { allAnime, fetchNextPage, loading: contextLoading, genreOptions, fetchAnimeByQuery} = useAnime();
  const [visibleCount, setVisibleCount] = useState(ANIME_DISPLAY_COUNT);
  const [infiniteScrollEnabled, setInfiniteScrollEnabled] = useState(false);
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<number | null>(null);
  const [animeList, setAnimeList] = useState<Anime[]>([]); // fetch genre based on selectedGenre during filtering 
  const [genrePage, setGenrePage] = useState(1);
  const [genreLoading, setGenreLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [searchPage, setSearchPage] = useState(1);
  const [searchLoading, setSearchLoading] = useState(false);

  // console.log(genreOptions);
  // console.log(selectedGenre);
  // console.log(animeList);
  
  // console.log(searchQuery);
  // console.log(searchPage);
  // console.log(searchLoading);
  
  // const isGenreMode = selectedGenre !== null;
  const isSearchMode = debouncedQuery.length > 0;
  const isGenreMode = !isSearchMode && selectedGenre !== null;


  useEffect(() => {
  if (!debouncedQuery) {
    setSearchResults([]);
    setSearchPage(1);
    return;
  }

  let cancelled = false;
  setSearchLoading(true);

  fetchAnimeByQuery(debouncedQuery, 1).then((data) => {
    if (!cancelled) {
      setSearchResults(data);
      // setSearchPage(2); // next page
       searchPageRef.current = 2; 
      setVisibleCount(ANIME_DISPLAY_COUNT);
    }
  }).finally(() => setSearchLoading(false));

  return () => { cancelled = true };
}, [debouncedQuery]);


  // debounce the search input
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedQuery(searchQuery), 250);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // fetch results when debouncedQuery changes
  const [searchResults, setSearchResults] = useState<Anime[]>([]);
  // useEffect(() => {
  //   if (!debouncedQuery) {
  //     setSearchResults([]);
  //     return;
  //   }

  //   fetchAnimeByQuery(debouncedQuery).then(setSearchResults);
  // }, [debouncedQuery]);

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
  // const sourceAnimes = selectedGenre
  //                       ? Array.from(new Map(animeList.map(a => [a.id, a])).values())
  //                       : allAnime;
  const sourceAnimes = isSearchMode
                        ? searchResults
                        : isGenreMode
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

  // useEffect(() => {
  // if (!selectedGenre) return;

  // let cancelled = false;
  // setGenreLoading(true);

  // fetchAnimeByCategory("genres", selectedGenre, genrePage)
  //     .then((data) => {
  //       if (!cancelled) {
  //         setAnimeList((prev) =>
  //           genrePage === 1 ? data : [...prev, ...data]
  //         );
  //       }
  //     })
  //     .finally(() => setGenreLoading(false));

  //   return () => {
  //     cancelled = true;
  //   };
  // }, [selectedGenre, genrePage]);

  useEffect(() => {
    // reset search input & results when genre changes
    setSearchQuery("");
    setDebouncedQuery("");
    setSearchResults([]);
    setVisibleCount(ANIME_DISPLAY_COUNT);

    if (!selectedGenre) {
      setAnimeList([]);
      setGenrePage(1);
      return;
    }

    setGenreLoading(true);
    let cancelled = false;

    fetchAnimeByCategory("genres", selectedGenre, 1)
      .then((data) => {
        if (!cancelled) {
          setAnimeList(data);
          setGenrePage(1);
        }
      })
      .finally(() => setGenreLoading(false));

    return () => { cancelled = true };
  }, [selectedGenre]);

  // const loadMore = () => {
  //   setVisibleCount((prev) => prev + ANIME_DISPLAY_COUNT);
  //   setInfiniteScrollEnabled(true);
  //   // Fetch next page if we reach end of current array
  //   if (visibleCount + ANIME_DISPLAY_COUNT >= allAnime.length) {
  //     fetchNextPage();
  //   }
  // };

  const loadMore = () => {
  setVisibleCount((prev) => prev + ANIME_DISPLAY_COUNT);
  setInfiniteScrollEnabled(true);
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

  const searchPageRef = useRef(1);
  const searchLoadingRef = useRef(false); // lock while fetching

  // useEffect(() => {
  //   if (!infiniteScrollEnabled || !loaderRef.current) return;

  //   const observer = new IntersectionObserver(async (entries) => {
  //     if (!entries[0].isIntersecting) return;

  //     setVisibleCount((prev) => prev + ANIME_DISPLAY_COUNT);

  //     if (searchLoadingRef.current || genreLoading || contextLoading) return;

  //     if (isSearchMode && debouncedQuery) {
  //       if (searchPageRef.current > MAX_SEARCH_PAGE) return;

  //       searchLoadingRef.current = true;

  //       const data = await fetchAnimeByQuery(debouncedQuery, searchPageRef.current);
  //       console.log(`Search page ${searchPageRef.current} results:`, data);
  //       setSearchResults((prev) => [...prev, ...data]);
  //       searchPageRef.current += 1;

  //       searchLoadingRef.current = false;
  //     } else if (isGenreMode && selectedGenre) {
  //       setGenrePage((p) => p + 1);
  //     } else if (!isSearchMode && !isGenreMode) {
  //       fetchNextPage();
  //     }
  //   }, { rootMargin: "200px" });

  //   observer.observe(loaderRef.current);
  //   return () => observer.disconnect();
  // }, [
  //   infiniteScrollEnabled,
  //   isSearchMode,
  //   isGenreMode,
  //   debouncedQuery,
  //   selectedGenre,
  //   genreLoading,
  //   contextLoading,
  //   fetchNextPage
  // ]);

  const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const fetchNextSearchPage = async () => {
  if (!debouncedQuery || searchLoadingRef.current) return;
  if (searchPageRef.current > MAX_SEARCH_PAGE) return;

  searchLoadingRef.current = true;
  try {
    const data = await fetchAnimeByQuery(debouncedQuery, searchPageRef.current);
    // console.log("Raw API results:", data);
    setSearchResults(prev => [...prev, ...data]);
    searchPageRef.current += 1;
  } catch (err) {
    console.error("Search fetch error:", err);
  } finally {
    await delay(500); // throttle
    searchLoadingRef.current = false;
  }
};

// Debounce search input
useEffect(() => {
  const handler = setTimeout(() => setDebouncedQuery(searchQuery), 250);
  return () => clearTimeout(handler);
}, [searchQuery]);

// Reset search page + results when query changes
useEffect(() => {
  searchPageRef.current = 1;
  setSearchResults([]);
}, [debouncedQuery]);

// IntersectionObserver for infinite scroll
useEffect(() => {
  if (!infiniteScrollEnabled || !loaderRef.current) return;

  const observer = new IntersectionObserver((entries) => {
    if (!entries[0].isIntersecting) return;

    setVisibleCount(prev => prev + ANIME_DISPLAY_COUNT);

    if (isSearchMode) fetchNextSearchPage();
    else if (isGenreMode) setGenrePage(p => p + 1);
    else fetchNextPage();
  }, { rootMargin: "200px" });

  observer.observe(loaderRef.current);
  return () => observer.disconnect();
}, [infiniteScrollEnabled, isSearchMode, isGenreMode, debouncedQuery, selectedGenre]);

  useEffect(() => {
    setVisibleCount(ANIME_DISPLAY_COUNT);
    if (isSearchMode) setSearchPage(1);
    if (isGenreMode) setGenrePage(1);
  }, [debouncedQuery, selectedGenre]);

  useEffect(() => {
    if (!selectedGenre) {
      setAnimeList([]);
      setGenrePage(1);
    }
  }, [selectedGenre]);

//   useEffect(() => {
//   if (isSearchMode) {
//     searchPageRef.current = 1;
//     setSearchPage(1);
//     setSearchResults([]); 
//   }
// }, [debouncedQuery]);

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
        {/* {visibleAnimes.map((anime: Anime) => (
          <AnimeCard key={anime.id} anime={anime} />
        ))} */}
        {visibleAnimes.map((anime: Anime, idx: number) => (
          <AnimeCard key={`${anime.id}-${idx}`} anime={anime} />
        ))}

        {/* {contextLoading && <LoadingSkeleton count={ANIME_DISPLAY_COUNT} />} */}
        {/* {(contextLoading || genreLoading) && <LoadingSkeleton count={ANIME_DISPLAY_COUNT} />} */}
        {(searchLoading || genreLoading || contextLoading) && <LoadingSkeleton count={ANIME_DISPLAY_COUNT} />}
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


