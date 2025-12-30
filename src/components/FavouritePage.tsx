import LoadingSkeleton from "../components/ui/loading-skeleton";
import AnimeCard from "./AnimeCard";
// import { mockAnimeArr } from "../types/mockData/anime"; // keep for reference
import { useFavourites } from "../context/FavouritesContext";
import { useAnime } from "../context/AnimeContext";
import { Link } from "react-router-dom";
import { useMemo, useState, useEffect } from "react";
import type { AnimeDetail } from "../api/dataTypes";
import { Button } from "@mui/material";

export default function FavoritePage() {
  const { favourites, clearFavourites } = useFavourites();
  const { animeById, fetchAnimeById } = useAnime();
  const [favouriteAnimes, setFavouriteAnimes] = useState<AnimeDetail[]>([]); // retrieve favourite anime data to populate AnimeCard
  const [loading, setLoading] = useState(true);

  console.log(favouriteAnimes);
  
  // Fetch any favourite anime that is missing from cache
  useEffect(() => {
    let isMounted = true;

    const loadFavourites = async () => {
      setLoading(true);

      const promises = favourites.map(async (favId) => {
        if (animeById[favId]) return animeById[favId];
        const anime = await fetchAnimeById(favId);
        return anime;
      });

      const results = await Promise.all(promises);
      if (!isMounted) return;

      // Filter out nulls and remove duplicates
      const uniqueAnimesMap = new Map<number, AnimeDetail>();
      results.forEach((a) => {
        if (a) uniqueAnimesMap.set(a.id, a);
      });

      setFavouriteAnimes(Array.from(uniqueAnimesMap.values()));
      setLoading(false);
    };

    loadFavourites();

    return () => {
      isMounted = false;
    };
  }, [favourites, animeById, fetchAnimeById]);

  return (
    // <section className="container">
    //   <h1>My Favorites</h1>
    //   <button onClick={clearFavourites} disabled={favourites.length === 0}>
    //     Clear All Favourites
    //   </button>

    //   {favourites.length === 0 ? (
    //     <div>
    //       <h2>No favourites yet</h2>
    //       <Link to="/">
    //         <p>Browse anime and build your collection ❤️</p>
    //       </Link>
    //     </div>
    //   ) : loading ? (
    //     <LoadingSkeleton count={Math.max(favourites.length, 8)} />
    //   ) : (
    //     <div>
    //       {favouriteAnimes.map((anime) => (
    //         <AnimeCard key={anime.id} anime={anime} />
    //       ))}
    //     </div>
    //   )}
    // </section>
     <section className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-900">My Favorites</h1>
        {/* <button
          onClick={clearFavourites}
          disabled={favourites.length === 0}
          className="px-4 py-2 rounded-lg bg-gray-100 text-red-600 font-semibold hover:bg-red-200 disabled:opacity-50 transition"
        >
          Clear All
          </button> */}
          <Button
            variant="text"
            color="error"
            onClick={clearFavourites}
            disabled={favourites.length === 0}
          >
            Clear All
        </Button>
      </div>



      {/* Empty state */}
      {favourites.length === 0 ? (
        <div className="text-center space-y-2 text-gray-600">
          <h2 className="text-6xl font-medium mt-[10rem] mb-[2rem]">no favourites yet 🐣</h2>
          <Link to="/" className="text-red-500 hover:underline">
            Browse anime and build your collection
          </Link>
        </div>
      ) : loading ? (
        <LoadingSkeleton count={Math.max(favourites.length, 8)} />
      ) : (
        // Grid of favorite anime
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {favouriteAnimes.map((anime) => (
            <AnimeCard key={anime.id} anime={anime} />
          ))}
        </div>
      )}
    </section>
  );
}