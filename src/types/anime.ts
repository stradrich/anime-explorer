// minimalised jikan payload, only necessary field used for anime cards
// export interface Anime {
//     id: number
//     title: string
//     imageUrl: string
//     score: number | null
//     year: number | null
//     genres: string[]
// }


export type Anime = {
  id: number;
  title: string;
  imageUrl: string;
  synopsis: string;
  episodes: number;
  score: number;
  type: string;
  rating: string;
  year: number | null;
  genres: string[];
}
