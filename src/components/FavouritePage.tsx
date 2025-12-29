import LoadingSkeleton from "../components/ui/loading-skeleton";
import AnimeCard from "./AnimeCard";
// import { mockAnimeArr } from "../types/mockData/anime"; // keep for reference
import { useFavourites } from "../context/FavouritesContext";
import { useAnime } from "../context/AnimeContext";
import { Link } from "react-router-dom";
import { useMemo, useState, useEffect } from "react";

export default function FavoritePage() {
  const { favourites, clearFavourites } = useFavourites();
  const { topAnime } = useAnime();
  const [loading, setLoading] = useState(true);

  console.log(favourites);
  
  // Keep favourites in sync and avoid duplicates
  const favouriteAnimes = useMemo(() => {
    const uniqueAnimesMap = new Map<number, typeof topAnime[0]>();
    favourites.forEach((favId) => {
      const anime = topAnime.find((a) => a.id === favId);
      if (anime) uniqueAnimesMap.set(favId, anime);
    });
    return Array.from(uniqueAnimesMap.values());
  }, [favourites, topAnime]);

  // Simulate a loading skeleton for better UX
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <section className="container">
      <h1>My Favorites</h1>
      <button onClick={clearFavourites} disabled={favouriteAnimes.length === 0}>
        Clear All Favourites
      </button>

      {favouriteAnimes.length === 0 ? (
        <div>
          <h2>No favourites yet</h2>
          <Link to="/">
            <p>Browse anime and build your collection ❤️</p>
          </Link>
        </div>
      ) : (
        <div>
          {loading ? (
            <LoadingSkeleton count={8} />
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
        </div>
      )}
    </section>
  );
}