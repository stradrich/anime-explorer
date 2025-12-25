import LoadingSkeleton from "../components/ui/loading-skeleton"
import AnimeCard from "./AnimeCard"
import type { Anime } from "../types/anime"
import { mockAnimeArr } from "../types/mockData/anime"
import { useState } from "react"

export default function AnimeMainList() {
  const [loading, setLoading] = useState(false);

  return (
    <section className="container">
      {/* Header */}
      <header style={{ marginBottom: "1rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 600 }}>
          Discover Anime
        </h1>
        <p style={{ color: "#6b7280" }}>
          Browse popular anime and your personal favorites
        </p>
      </header>

      {/* Filter Section */}
      <div style={{ marginBottom: "1.5rem" }}>
        <label style={{ fontWeight: 500 }}>
          Filter by Genre
        </label>
        {/* Genre dropdown goes here later */}
      </div>

      {/* Content Area */}
      <div>
        {loading ? (
          <LoadingSkeleton />
        ) : (
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
        )
        }
      </div>

      {/* Pagination / Load More */}
      <div style={{ marginTop: "2rem", textAlign: "center" }}>
        <button
          // disabled
          style={{
            padding: "0.75rem 1.5rem",
            borderRadius: "0.5rem",
            backgroundColor: "#e5e7eb",
            cursor: "not-allowed",
          }}
        >
          Loading...
        </button>
      </div>
    </section>
  )
}
