import { Link } from "react-router-dom";
import type { Anime } from "../types/anime";

interface Props {
  anime: Anime;
}

export default function AnimeCard({ anime }: Props) {
  return (
    <Link to={`/anime/${anime.id}`}>
      <div
        style={{
          borderRadius: "0.75rem",
          overflow: "hidden",
          border: "1px solid #e5e7eb",
          transition: "transform 0.2s ease",
        }}
      >
        {/* Image */}
        <div style={{ aspectRatio: "1 / 1", overflow: "hidden" }}>
          <img
            src={anime.imageUrl}
            alt={anime.title}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>

        {/* Content */}
        <div style={{ padding: "0.75rem" }}>
          <h3
            className="line-clamp-2"
            style={{
              fontSize: "0.95rem",
              fontWeight: 600,
              minHeight: "2.6em",
            }}
          >
            {anime.title}
          </h3>
          <div
            style={{
              marginTop: "0.5rem",
              fontSize: "0.8rem",
              color: "#6b7280",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>{anime.score?.toFixed(1) ?? "N/A"}</span>
            <span>{anime.year ?? "Unknown"}</span>
          </div>
        </div>

        {/* Genre */}
        <div
          style={{
            marginTop: "0.5rem",
            display: "flex",
            gap: "0.25rem",
            flexWrap: "wrap",
            padding: "0.75rem",
          }}
        >
          {anime.genres?.slice(0, 2).map((genre, index) => (
            <span
              key={`${genre}-${index}`}
              style={{
                fontSize: "0.7rem",
                backgroundColor: "#f3f4f6",
                padding: "0.15rem 0.4rem",
                borderRadius: "0.25rem",
              }}
            >
              {genre}
            </span>
          )) ?? null}
        </div>
      </div>
    </Link>
  );
}
