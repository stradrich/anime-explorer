import type { AnimeDetail } from "../mock-anime-detail";

const IMAGE =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_UcbzOVEtzpiThlTe9udnaG2pOL1GIYXnTw&s";

export const mockAnimeDetail: AnimeDetail[] = Array.from(
  { length: 100 },
  (_, i): AnimeDetail => {
    const id = i + 1;
    return {
      id,
      title: `Test ${id}`,
      imageUrl: IMAGE,
      synopsis: `Synopsis for Test ${id}`,
      background: `Background info for Test ${id}`,
      score: Number((7.2 + (id % 6) * 0.3).toFixed(1)),
      year: 2000 + (id % 25),
      episodes: id % 3 === 0 ? 24 : 12,
      duration: "24 min per ep",
      rating: id % 4 === 0 ? "R - 17+" : "PG-13",
      genres:
        id % 5 === 0
          ? ["Drama", "Thriller"]
          : id % 3 === 0
          ? ["Action", "Fantasy"]
          : ["Adventure", "Comedy"],
      studios: [`Studio ${String.fromCharCode(65 + (id % 26))}`],
      producers: [`Producer ${id}`],
    };
  }
);
