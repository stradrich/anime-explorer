import type { Anime } from "../mock-anime";

const IMAGE =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_UcbzOVEtzpiThlTe9udnaG2pOL1GIYXnTw&s";

export const mockAnimeArr: Anime[] = Array.from({ length: 100 }, (_, i): Anime => {
  const id = i + 1;
  return {
    id,
    title: `Test ${id}`,
    imageUrl: IMAGE,
    score: Number((7.2 + (id % 6) * 0.3).toFixed(1)),
    year: 2000 + (id % 25),
    genres:
      id % 5 === 0
        ? ["Drama", "Thriller"]
        : id % 3 === 0
        ? ["Action", "Fantasy"]
        : ["Adventure", "Comedy"],
  };
});
