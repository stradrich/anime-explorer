// import { mockAnimeDetail } from "../types/mockData/anime-detail"; // keep for reference
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { useFavourites } from "../context/FavouritesContext";
import { useAnime } from "../context/AnimeContext";
import type { AnimeDetail } from "../api/dataTypes";

export default function AnimeDetailedPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { favourites, toggleFavourite } = useFavourites();
  const { animeById, fetchAnimeById } = useAnime();
  const [anime, setAnime] = useState<AnimeDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const animeId = Number(id);
    if (isNaN(animeId)) return;

    // Use cache if available
    if (animeById[animeId]) {
      setAnime(animeById[animeId]);
      setLoading(false);
    } else {
      setLoading(true);
      fetchAnimeById(animeId)
        .then(() => {
          setAnime(animeById[animeId] ?? null);
        })
        .finally(() => setLoading(false));
    }
  }, [id, animeById, fetchAnimeById]);

  if (loading) return <p>Loading...</p>;
  if (!anime) return <p>Anime not found</p>;

  const isFavourite = favourites.includes(anime.id);

  return (
    <div className="container">
      <button onClick={() => navigate(-1)}>Back</button>

      <button
        onClick={() => toggleFavourite(anime.id)}
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          fontSize: "1.5rem",
          color: isFavourite ? "red" : "gray",
          marginLeft: "1rem",
        }}
        aria-label={isFavourite ? "Remove from favourites" : "Add to favourites"}
      >
        {isFavourite ? <AiFillHeart /> : <AiOutlineHeart />}
      </button>

      <div style={{ marginTop: "1rem" }}>
        <img
          src={anime.imageUrl}
          alt={anime.title}
          style={{ width: "250px", borderRadius: "0.5rem" }}
        />
        <h1>{anime.title}</h1>
        <p>⭐ {anime.score?.toFixed(1) ?? "N/A"}</p>
        <p>Year: {anime.year ?? "Unknown"}</p>
        <p>Genres: {anime.genres?.join(", ") ?? "N/A"}</p>
        <p>{anime.synopsis ?? ""}</p>
        <p>{anime.background ?? ""}</p>
        <p>Episodes: {anime.episodes ?? "Unknown"}</p>
        <p>Duration: {anime.duration ?? "Unknown"}</p>
        <p>Rating: {anime.rating ?? "N/A"}</p>
        <p>Studios: {anime.studios?.join(", ") ?? "N/A"}</p>
        <p>Producers: {anime.producers?.join(", ") ?? "N/A"}</p>
      </div>
    </div>
  );
}
