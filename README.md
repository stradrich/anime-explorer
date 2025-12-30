Anime Explorer App - README
Here's a comprehensive README you can copy for your interview preparation:

Anime Explorer App
A React-based anime discovery application that consumes the Jikan API (MyAnimeList). Built with TypeScript, Tailwind CSS, and React Router for seamless client-side navigation.

🏗️ System Architecture
High-Level Design

┌─────────────────────────────────────────────────────────────┐
│                      Client (React + Vite)                   │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │ AnimeContext │  │FavouritesCtx │  │     Router         │ │
│  │  (API Data)  │  │  (LocalStorage)│ │ (React Router)    │ │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘ │
│         │                │                     │            │
│         └────────────────┼─────────────────────┘            │
│                          ▼                                  │
│              ┌─────────────────────────┐                    │
│              │      Jikan API Layer     │                    │
│              │   (src/api/jikan.ts)     │                    │
│              └─────────────────────────┘                    │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
              ┌─────────────────────────┐
              │    Jikan API v4         │
              │  (api.jikan.moe)        │
              └─────────────────────────┘
Key Architecture Decisions
Separation of Concerns: API logic isolated in src/api/, components in src/components/, state management in src/context/

Custom Hooks Pattern: useAnime() and useFavourites() hooks provide clean access to global state

Client-Side Caching: Anime data cached in context to minimize redundant API calls

Local Storage Persistence: Favorites synced across browser sessions using localStorage + storage event listener

📡 API Design (Jikan v4 Integration)
All API calls abstracted in src/api/jikan.ts:


// API Endpoints Mapping
// GET /v4/anime                   → fetchAllAnime (paginated list)
// GET /v4/top/anime               → fetchAllTopAnime (top-rated)
// GET /v4/top/anime?page=:page    → Infinite scroll pagination
// GET /v4/anime/{id}/full         → fetchAnimeById (detailed info)
// GET /v4/anime?genres=:id        → fetchAnimeByCategory (filtering)
// GET /v4/anime?q=:query          → fetchAnimeByQuery (search)
Rate Limiting Handling
The Jikan API enforces rate limits (429 responses). Implemented exponential backoff:


async function safeFetch(url: string, retries = 3, delay = 1000): Promise<any> {
  const res = await fetch(url);
  
  if (res.status === 429) {
    if (retries > 0) {
      await new Promise(r => setTimeout(r, delay));
      return safeFetch(url, retries - 1, delay * 2); // Exponential backoff
    }
    return null;
  }
  // ...
}
🔄 State Management Strategy
AnimeContext
Purpose: Centralized API data and pagination state
State Variables:
allAnime[] - Full anime list
animeById{} - Cache by ID (avoids refetching)
topAnime[] - Top-rated anime
page, topPage - Pagination tracking
fetchedPagesRef - Prevents duplicate page fetches
FavouritesContext
Purpose: Persist user favorites across sessions
Storage: localStorage with cross-tab sync via storage event
Actions: toggleFavourite(), clearFavourites()
Why React Context (Not Redux/Zustand)?
Simpler for this app's scope
No external dependencies needed
Built-in provider pattern fits naturally
🖥️ UI/UX Design
Routing Structure

/                           → AnimeMainList (discover page)
/anime/:id                  → AnimeDetailedPage (full info)
/favorites                  → FavoritePage (user's collection)
Component Hierarchy

App (providers + router)
├── Layout (header + outlet)
│   ├── AnimeMainList
│   │   ├── GenreFilter (dropdown)
│   │   ├── SearchInput
│   │   └── AnimeGrid
│   │       └── AnimeCard × N
│   ├── AnimeDetailedPage
│   │   ├── BackButton
│   │   ├── FavoriteToggle
│   │   └── AnimeInfo (synopsis, studios, etc.)
│   └── FavoritePage
│       ├── EmptyState
│       └── AnimeGrid
UX Considerations
Infinite Scrolling: IntersectionObserver API triggers loadMore at 200px viewport margin
Loading States: Skeleton UI (LoadingSkeleton component) maintains layout stability
Debounced Search: 250ms debounce prevents API spam while typing
Responsive Grid: grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4
Empty States: Friendly messaging when no favorites exist
Interaction Design
Card Hover: Scale transform + shadow elevation
Heart Animation: CSS transitions on favorite toggle
Genre Filtering: Dropdown with immediate feedback
Load More: Button fallback when infinite scroll disabled
⚡ Performance Optimizations
1. Pagination with Deduplication

// Prevent duplicate entries across page fetches
setAllAnime((prev) => {
  const seen = new Set(prev.map(a => a.id));
  const uniqueNew = data.filter(a => !seen.has(a.id));
  return [...prev, ...uniqueNew];
});
2. Cache-First Fetching

// Check cache before API call
if (animeById[animeId]) {
  setAnime(animeById[animeId]);
} else {
  fetchAnimeById(animeId);
}
3. Page Fetch Guards

// Prevent redundant fetches
if (loading || fetchedPagesRef.current.has(page)) return;
4. Component-Level Optimizations
React.memo for AnimeCard (optional)
Virtualization consideration for large lists (not needed for current scale)
Lazy loading via React.lazy (route-based)
🎯 Three-Mode Search Architecture
The search system operates in exclusive modes:

Mode 1: Default (All Anime)
Fetches from /v4/anime?page=N
Used when no filters active
Mode 2: Genre Filter
Fetches from /v4/anime?genres=:id&order_by=popularity&sort=desc
Separate pagination state (genrePage)
Genre options loaded once on mount
Mode 3: Search Query
Debounced 250ms before API call
Max 3 pages for search results
Clears on mode change

// Mode determination logic
useEffect(() => {
  if (debouncedQuery) setMode("search");
  else if (selectedGenre === "top") setMode("top");
  else if (selectedGenre) setMode("genre");
  else setMode("default");
}, [debouncedQuery, selectedGenre]);
🚀 Deployment (Vercel)
Build Configuration

// vercel.json - SPA routing support
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
Build Commands

npm run build  # TypeScript check + Vite build
npm run dev    # Development server
🔧 Tech Stack
| Category | Technology |
|----------|------------|
| Framework | React 19 + TypeScript |
| Build Tool | Vite 7 |
| Styling | Tailwind CSS 4 |
| UI Components | Material UI (MUI) |
| Routing | React Router DOM 7 |
| Icons | React Icons (Lucide/FontAwesome) |
| API | Fetch with custom rate-limit handling |
| State | React Context + localStorage |

📋 Requirements Checklist
Core Features ✅
[x] Anime list with pagination
[x] Detail screen with full info
[x] Favorites with localStorage persistence
[x] Genre filtering via dropdown
[x] Search functionality with debouncing
[x] Responsive grid layout
[x] Loading skeleton states
[x] Error handling (graceful fallbacks)
Bonus Points
[x] TypeScript for type safety
[x] React Context for state management
[x] CSS transitions and hover effects
[x] Infinite scroll implementation
[ ] Unit tests (Jest)
[ ] Deep linking
[ ] Share functionality
🔮 Potential Improvements
Optimistic UI: Update favorite state immediately, sync later
React Query: Replace context with React Query for better caching
Virtualization: react-window for 1000+ item lists
Testing: Jest + React Testing Library
PWA: Service worker for offline support
Share API: Web Share Target for social sharing
🧠 Interview Talking Points
Why Context over Redux? - Simplicity, no boilerplate, sufficient for app scope
Infinite scroll vs Load More - Tradeoffs: UX vs complexity
Rate limiting strategy - Exponential backoff, user experience considerations
Caching strategy - Memory cache + localStorage persistence
Debouncing search - Performance vs responsiveness balance
SPA routing on Vercel - Rewrite rules explanation
Built with ❤️ using React, TypeScript, and the Jikan API
