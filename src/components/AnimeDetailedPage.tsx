import { useNavigate, useParams } from "react-router-dom"
import { mockAnimeDetail } from "../types/mockData/anime-detail";

export default function AnimeDetailedPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const anime = mockAnimeDetail.find(
    (anime) => anime.id === Number(id)
  );

  if (!anime) {
    return <p>Anime not found</p>;
  }

  return (
    <div>
      <button onClick={() => navigate(-1)}>
        Back
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
