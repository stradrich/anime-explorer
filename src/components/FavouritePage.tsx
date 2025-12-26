import LoadingSkeleton from "../components/ui/loading-skeleton"
import AnimeCard from "./AnimeCard"
import { mockAnimeArr } from "../types/mockData/anime"
import { useFavourites } from "../context/FavouritesContext"
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function FavoritePage() {
  const { favourites, clearFavourites } = useFavourites();
    const [loading, setLoading] = useState(false);

    const favouriteAnimes = mockAnimeArr.filter(anime => 
      favourites.includes(anime.id)
    );
    
    useEffect(() => {
      setLoading(true);
      setTimeout(() => setLoading(false), 100);
    }, []); 

  return (
     <section className="container">

      <div>
        <h1>My Favorites</h1>
        <button 
          onClick={clearFavourites}
          disabled={favouriteAnimes.length === 0}
        >
          Clear All Favourites
        </button>
        <div>
          {favouriteAnimes.length === 0 ? (
            <div>
              <h2>No favourites yet</h2>
               <Link to={`/`}>
                  <p>Browse anime and build your collection ❤️</p>
               </Link>
            </div>
          ) : (
            <div>
              {loading ? 
                   (<LoadingSkeleton/>) 
                   : 
                   (
                     <div
                       style={{
                         display: "grid",
                         gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                         gap: "1rem",
                       }}
                     >
                       {favouriteAnimes.map((anime) => (
                         <AnimeCard anime={anime}/>
                       ))}
                     </div>
                   )
               }
            </div>
          )}
        </div>
      </div>
     </section>
  )
}
