import LoadingSkeleton from "../components/ui/loading-skeleton";
import AnimeCard from "./AnimeCard";
// import { mockAnimeArr } from "../types/mockData/anime"; // keep for reference
import { useFavourites } from "../context/FavouritesContext";
import { useAnime } from "../context/AnimeContext";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function FavoritePage() {
  const { favourites, clearFavourites } = useFavourites();
  const { topAnime, fetchNextPage } = useAnime();
  const [loading, setLoading] = useState(false);

  console.log(favourites);
  
  // Keep favourites in sync with localStorage + other tabs
  const [favouriteAnimes, setFavouriteAnimes] = useState(
    topAnime.filter((anime) => favourites.includes(anime.id))
  );

  // Update favouriteAnimes whenever topAnime or favourites change
  useEffect(() => {
    setFavouriteAnimes(topAnime.filter((anime) => favourites.includes(anime.id)));
  }, [topAnime, favourites]);

  // Handle loading on mount
  useEffect(() => {
    setLoading(true);
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
            <LoadingSkeleton />
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "1rem" }}>
              {favouriteAnimes.map((anime, index) => (
                <AnimeCard key={`${anime.id}-${index}`} anime={anime} />
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
