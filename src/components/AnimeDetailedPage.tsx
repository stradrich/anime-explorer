// import { mockAnimeDetail } from "../types/mockData/anime-detail"; // keep for reference
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";
import { useFavourites } from "../context/FavouritesContext";
import { useAnime } from "../context/AnimeContext";
import type { AnimeDetail } from "../api/dataTypes";
import { Button } from "@mui/material";

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
    // <div className="container">
    //   <button onClick={() => navigate(-1)}>Back</button>

    //   <button
    //     onClick={() => toggleFavourite(anime.id)}
    //     aria-label={isFavourite ? "Remove from favourites" : "Add to favourites"}
    //   >
    //     {isFavourite ? <AiFillHeart /> : <AiOutlineHeart />}
    //   </button>

    //   <div>
    //     <img
    //       src={anime.imageUrl}
    //       alt={anime.title}
    //     />
    //     <h1>{anime.title}</h1>
    //     <p>⭐ {anime.score?.toFixed(1) ?? "N/A"}</p>
    //     <p>Year: {anime.year ?? "Unknown"}</p>
    //     <p>Genres: {anime.genres?.join(", ") ?? "N/A"}</p>
    //     <p>{anime.synopsis ?? ""}</p>
    //     <p>{anime.background ?? ""}</p>
    //     <p>Episodes: {anime.episodes ?? "Unknown"}</p>
    //     <p>Duration: {anime.duration ?? "Unknown"}</p>
    //     <p>Rating: {anime.rating ?? "N/A"}</p>
    //     <p>Studios: {anime.studios?.join(", ") ?? "N/A"}</p>
    //     <p>Producers: {anime.producers?.join(", ") ?? "N/A"}</p>
    //   </div>
    // </div>
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Header Buttons */}
      <div className="flex justify-between items-center">
        {/* <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 rounded-lg bg-gray-100 text-black hover:bg-gray-300 transition"
        >
          Back
        </button> */}

        <Button
          variant="outlined"
          onClick={() => navigate(-1)}
          sx={{
            color: "black",
            borderColor: "black",
            "&:hover": {
              backgroundColor: "rgba(0,0,0,0.05)",
              borderColor: "black",
            },
            "&:focus": {
              outline: "none",
              boxShadow: "none",
            },
          }}
        >
          Back
        </Button>

        <Button
          variant="text"
          onClick={() => toggleFavourite(anime.id)}
          aria-label={isFavourite ? "Remove from favourites" : "Add to favourites"}
          sx={{
            color: isFavourite ? "red" : "gray",
            fontSize: 28,
            minWidth: 0,        
            padding: 0,
            "&:hover": {
              backgroundColor: "transparent",
              transform: "scale(1.2)",
            },
            "&:focus": {
              outline: "none",
              boxShadow: "none",
            },
            transition: "transform 0.2s ease",
          }}
        >
          {isFavourite ? <AiFillHeart /> : <AiOutlineHeart />}
        </Button>

        {/* <button
          onClick={() => toggleFavourite(anime.id)}
          aria-label={isFavourite ? "Remove from favourites" : "Add to favourites"}
          className="text-2xl text-red-500 hover:scale-110 transition-transform"
        >
          {isFavourite ? <AiFillHeart /> : <AiOutlineHeart />}
        </button> */}
      </div>

      {/* Main Card */}
      <div className="flex flex-col md:flex-row gap-6 bg-white/80 backdrop-blur-md rounded-xl shadow-lg overflow-hidden p-6">
        {/* Image */}
        <div className="flex-shrink-0 w-full md:w-64 h-96 rounded-lg overflow-hidden">
          <img
            src={anime.imageUrl}
            alt={anime.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Details */}
        <div className="flex-1 flex flex-col justify-between space-y-4">
          <h1 className="text-3xl font-bold text-gray-900">{anime.title}</h1>

          <div className="flex flex-wrap gap-4 text-gray-700">
            <span>⭐ {anime.score?.toFixed(1) ?? "N/A"}</span>
            <span>Year: {anime.year ?? "Unknown"}</span>
            <span>Episodes: {anime.episodes ?? "Unknown"}</span>
            <span>Duration: {anime.duration ?? "Unknown"}</span>
            <span>Rating: {anime.rating ?? "N/A"}</span>
          </div>

          {anime.genres && anime.genres.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {anime.genres.map((genre, index) => (
                <span
                  key={`${genre}-${index}`}
                  className="px-3 py-1 bg-gray-200 text-gray-800 rounded-full text-sm"
                >
                  {genre}
                </span>
              ))}
            </div>
          )}

          <div className="text-gray-700 space-y-2">
            <p><strong>Studios:</strong> {anime.studios?.join(", ") ?? "N/A"}</p>
            <p><strong>Producers:</strong> {anime.producers?.join(", ") ?? "N/A"}</p>
            {anime.synopsis && <p><strong>Synopsis:</strong> {anime.synopsis}</p>}
            {anime.background && <p><strong>Background:</strong> {anime.background}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
