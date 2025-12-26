import { useNavigate, useParams } from "react-router-dom"
import { mockAnimeDetail } from "../types/mockData/anime-detail";
import { useState } from "react";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { useFavourites } from "../context/FavouritesContext";

export default function AnimeDetailedPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  // const [isFavourite, setIsFavourite] = useState(false);
  const { favourites, toggleFavourite } = useFavourites();


  const anime = mockAnimeDetail.find(
    (anime) => anime.id === Number(id)
  );

  if (!anime) {
    return <p>Anime not found</p>;
  }

  // const toggleFavourite = () => setIsFavourite(!isFavourite);
   const isFavourite = favourites.includes(anime.id);

  return (
    <div>
      <button onClick={() => navigate(-1)}>
        Back
      </button>

       <button
        onClick={() => toggleFavourite(anime.id)}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          fontSize: "1.5rem",
          color: isFavourite ? "red" : "gray",
        }}
      >
      {isFavourite ? <AiFillHeart /> : <AiOutlineHeart />}
    </button>

      <div>
          {/* Anime Image */}
          <img src={anime.imageUrl} alt={anime.title} />
          {/* Anime Details */}
          <h1>{anime.title}</h1>
          <p> ⭐ {anime.score?.toFixed(1)}</p>
          <p>{anime.year}</p>
          <p>{anime.genres.join(", ")}</p>
          <p>{anime.synopsis}</p>
          <p>{anime.background}</p>
          <p>{anime.episodes}</p>
          <p>{anime.duration}</p>
          <p>{anime.rating}</p>
          <p>Studios: {anime.studios.join(", ")}</p>
          <p>Producers: {anime.producers.join(", ")}</p>
          
      </div>
    </div>
  )
}
