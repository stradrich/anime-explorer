import LoadingSkeleton from "../components/ui/loading-skeleton"
import AnimeCard from "./AnimeCard"
import { mockAnimeArr } from "../types/mockData/anime"

export default function FavoritePage() {
  return (
     <section className="container">

      <div>
        <h1>My Favorites</h1>
        <div>
          <h2>No favourites yet</h2>
          <p>Browse anime and build your collection ❤️</p>

         <LoadingSkeleton/> 

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
            gap: "1rem",
          }}
        >
          {mockAnimeArr.map((anime) => (
            <AnimeCard anime={anime}/>
          ))}
        </div>
        </div>
      </div>
     </section>
  )
}
