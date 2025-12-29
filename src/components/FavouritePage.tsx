import LoadingSkeleton from "../components/ui/loading-skeleton";
import AnimeCard from "./AnimeCard";
// import { mockAnimeArr } from "../types/mockData/anime"; // keep for reference
import { useFavourites } from "../context/FavouritesContext";
import { useAnime } from "../context/AnimeContext";
import { Link } from "react-router-dom";
import { useMemo, useState, useEffect } from "react";
import type { AnimeDetail } from "../api/dataTypes";

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
    <section className="container">
      <h1>My Favorites</h1>
      <button onClick={clearFavourites} disabled={favourites.length === 0}>
        Clear All Favourites
      </button>

      {favourites.length === 0 ? (
        <div>
          <h2>No favourites yet</h2>
          <Link to="/">
            <p>Browse anime and build your collection ❤️</p>
          </Link>
        </div>
      ) : loading ? (
        <LoadingSkeleton count={Math.max(favourites.length, 8)} />
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
            gap: "1rem",
          }}
        >
          {favouriteAnimes.map((anime) => (
            <AnimeCard key={anime.id} anime={anime} />
          ))}
        </div>
      )}
    </section>
  );
}