import { Link } from "react-router-dom";
import type { Anime } from "../api/dataTypes";

interface Props {
  anime: Anime;
}

export default function AnimeCard({ anime }: Props) {
  return (
      <Link to={`/anime/${anime.id}`} className="group">
      <div className="flex flex-col bg-white rounded-xl shadow-md overflow-hidden h-full transition-transform transform hover:scale-105 hover:shadow-xl">
        {/* Image */}
        <div className="w-full h-48 overflow-hidden rounded-t-xl">
          <img
            src={anime.imageUrl}
            alt={anime.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Content */}
        <div className="p-4 flex-1 flex flex-col justify-between">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
            {anime.title}
          </h3>

          <div className="mt-2 flex justify-between items-center text-sm text-gray-600">
            <span>⭐ {anime.score?.toFixed(1) ?? "N/A"}</span>
            <span>{anime.year ?? "Unknown"}</span>
          </div>

          {/* Genres */}
          {anime.genres && anime.genres.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {anime.genres.slice(0, 2).map((genre: string, index: number) => (
                <span
                  key={`${genre}-${index}`}
                  className="px-2 py-1 text-xs font-medium bg-gray-200 text-gray-800 rounded-full"
                >
                  {genre}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
