import type { Hotel } from './hotel'

export interface SearchQuery {
  q: string
  page?: number
  limit?: number
}

export interface SearchResult {
  hotel: Hotel
  score: number
  source: 'keyword' | 'semantic'
}

