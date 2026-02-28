# Context: Search

## Dual-mode search
Chạy song song 2 engine, merge kết quả:

```
User gõ query
    ├→ GET /search?q=...          (Elasticsearch full-text)
    └→ POST /search/semantic      (AI vector search)
         ↓
    Merge + deduplicate by hotelId
    Semantic results → gắn badge "AI-powered"
    Render SearchResults
```

## API (`src/api/search.api.ts`)
```ts
searchApi.fullText({ q, page, limit, ... })   // Elasticsearch
searchApi.semantic({ query, limit })           // AI vector search
```

## Hook (`src/hooks/useSearch.ts`)
```ts
const { results, isLoading, keyword, semantic } = useSearch(query)
// Dùng Promise.allSettled để cả 2 fail độc lập
// Debounce query 300ms (useDebounce hook)
```

## Components (`src/components/search/`)
- `SearchBar` — input với debounce, navigate → `/search?q=...`
- `SearchResults` — render list, phân biệt keyword vs semantic results
- `SemanticBadge` — badge "AI-powered" gắn lên semantic results

## Page: `src/pages/public/SearchResultsPage.tsx`
- Đọc `?q=` từ URL → gọi `useSearch(q)`
- Không cần login (public route)

## Types (`src/types/search.ts`)
```ts
interface SearchResult {
  hotelId: string
  name: string
  score: number
  source: 'keyword' | 'semantic'
  // ...hotel fields
}
```
