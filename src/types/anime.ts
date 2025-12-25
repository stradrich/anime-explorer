// minimalised jikan payload, only necessary field used for anime cards
export interface Anime {
    id: number
    title: string
    imageUrl: string
    score: number | null
    year: number | null
    genres: string[]
}