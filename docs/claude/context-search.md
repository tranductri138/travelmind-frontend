# Context: Search

## Unified search
BE chạy song song keyword + semantic, merge & deduplicate, FE chỉ gọi 1 API:

```
User gõ query
    → GET /search?q=...
         ↓
    BE: Promise.allSettled([keyword, semantic])
    BE: merge (semantic trước, keyword sau), deduplicate by hotel.id
         ↓
    FE nhận kết quả đã merge
    Semantic results → gắn badge "AI-powered"
    Render SearchResults
```

## API (`src/api/search.api.ts`)
```ts
searchApi.search({ q, page, limit })   // GET /search — unified (keyword + semantic)
```

## Hook (`src/hooks/useSearch.ts`)
```ts
const { data, isLoading } = useSearch(query, { page, limit })
// Debounce query 300ms (useDebounce hook) ở page level
```

## Components (`src/components/search/`)
- `SearchBar` — input với debounce, navigate → `/search?q=...`
- `SearchResults` — render list, phân biệt keyword vs semantic results
- `SemanticBadge` — badge "AI-powered" gắn lên semantic results

## Page: `src/pages/public/SearchResultsPage.tsx`
- Đọc `?q=` từ URL → debounce → gọi `useSearch(q)`
- Không cần login (public route)

## Types (`src/types/search.ts`)
```ts
interface SearchResult {
  hotel: Hotel
  score: number
  source: 'keyword' | 'semantic'
}
```
