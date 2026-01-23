# Build to Deployment with Interview Prep

This document maps all interview-relevant knowledge to each phase of building and deploying the Anime Explorer app.

---

## Phase 1: Project Foundation

### Checklist
- [ ] Initialize project with Vite + React + TypeScript
- [ ] Set up TypeScript config (tsconfig.json)
- [ ] Configure linting (ESLint + Prettier)
- [ ] Set up Tailwind CSS
- [ ] Configure path aliases (@/ → src)

### Interview Knowledge: Path Aliases

**With Vite (Your Setup):**
```typescript
// vite.config.ts
export default defineConfig({
  resolve: {
    alias: {
      "@": "/src",
    },
  }
});
```

**Without Vite (CRA/Webpack):**
```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

**Pure JavaScript (No tsconfig):**
- tsconfig.json is only needed for TypeScript
- Pure JS React doesn't require it
- Optional jsconfig.json for IDE support only

**Interview Answer:**
> "With Vite, path aliases are configured in vite.config.ts under `resolve.alias`. Without Vite, you'd configure them in tsconfig.json under `compilerOptions.paths`. Both achieve the same result - cleaner imports - but Vite handles bundling while TypeScript handles type resolution."

---

## Phase 2: Core Architecture

### Checklist
- [ ] Set up React Router (routes structure)
- [ ] Create Context providers (AnimeContext, FavouritesContext)
- [ ] Define TypeScript interfaces (Anime, AnimeDetail, etc.)
- [ ] Set up global styles (globals.css)

### Interview Knowledge: Routing

**Your App Uses Page Routing (React Router DOM):**
```typescript
// App.tsx - React Router v6
import { BrowserRouter, Routes, Route } from "react-router-dom";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AnimeMainList />} />
        <Route path="/anime/:id" element={<AnimeDetailedPage />} />
        <Route path="/favorites" element={<FavoritePage />} />
      </Routes>
    </BrowserRouter>
  );
}
```

**Page Routing vs File-based Routing:**

| Term | Description | Example |
|------|-------------|---------|
| **Page Routing** | Routes defined in code/components | React Router (what you use) |
| **File-based Routing** | Routes determined by file structure | Next.js App Router |

**Interview Answer:**
> "I'm using page routing with React Router DOM v6. Routes are defined using the `<Routes>` and `<Route>` components in App.tsx. This is a client-side SPA approach - all components render in the browser."

---

## Phase 3: API Layer

### Checklist
- [ ] Create API client (axios or fetch wrapper)
- [ ] Implement safeFetch with retry logic
- [ ] Create data transformation functions
- [ ] Set up API error handling

### Interview Knowledge: TypeScript Types Architecture

**All Types in Your Project:**

| File | Type/Interface | Purpose |
|------|----------------|---------|
| **src/api/dataTypes.ts** | `Anime` | App data shape (list view) |
| | `AnimeDetail` | App data shape (detail view) - extends Anime |
| **src/api/jikan.ts** | `RawGenre` | Raw Jikan API genre shape |
| **src/context/AnimeContext.tsx** | `AnimeContextType` | Context public API |

**Type Flow Diagram:**

```
┌─────────────────────────────────────────────────────────┐
│              RAW API RESPONSE                           │
│  Jikan API: { mal_id, images.jpg.image_url... }        │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼ transform()
┌─────────────────────────────────────────────────────────┐
│              RawGenre (jikan.ts)                        │
│  { mal_id: number; name: string }                       │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼ transform()
┌─────────────────────────────────────────────────────────┐
│              Anime / AnimeDetail (dataTypes.ts)         │
│  { id, title, imageUrl, score, genres... }             │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼ use in context
┌─────────────────────────────────────────────────────────┐
│              AnimeContextType (context)                 │
│  { allAnime, fetchNextPage, loading... }               │
└─────────────────────────────────────────────────────────┘
```

**Interview Answer:**
> "I have 4 main types organized by layer:
> 1. **RawGenre** - Maps Jikan's genre API response
> 2. **Anime** - App's simplified list item shape
> 3. **AnimeDetail** - Extends Anime with detail-specific fields
> 4. **AnimeContextType** - Public API contract for context consumers
>
> This separation keeps the API layer pure while providing type-safe access throughout the app."

---

## Phase 4: Component Foundation

### Checklist
- [ ] Layout component (navigation, footer, etc.)
- [ ] Base UI components (Button, Input, Card, etc.)
- [ ] Loading skeleton component
- [ ] Error boundary

### Interview Knowledge: React Hooks

**React Hooks Categories:**

| Category | Hooks | You Use It? |
|----------|-------|-------------|
| **State** | `useState` | ✅ Yes (13+ times) |
| **Effect** | `useEffect` | ✅ Yes (7+ times) |
| **Ref** | `useRef` | ✅ Yes (3+ times) |
| **Context** | `useContext` | ✅ Yes (in custom hooks) |
| **Router** | `useParams`, `useNavigate` | ✅ Yes |
| **Performance** | `useMemo`, `useCallback` | ❌ No |
| **Transition** | `useTransition`, `useDeferredValue` | ❌ No |

  ```
  Value changes?
  ├─ Yes → Does it affect UI?
  │   ├─ Yes → useState
  │   └─ No → useRef
  └─ No → Does it run AFTER render?
      ├─ Yes → useEffect
      └─ No → Is it expensive?
          ├─ Yes → useMemo
          └─ No → Plain variable

  Function passed to child?
  ├─ Yes → Does it cause re-renders?
  │   ├─ Yes → useCallback
  │   └─ No → Plain function
  └─ No → Does it need global access?
      ├─ Yes → useContext
      └─ No → Local function
    ```


**Hooks You Use in Your Project:**

```typescript
// State Hooks
const [anime, setAnime] = useState<AnimeDetail | null>(null);
const [loading, setLoading] = useState(true);

// Effect Hooks
useEffect(() => {
  fetchAnimeById(id);
}, [id]);

// Ref Hooks
const loaderRef = useRef<HTMLDivElement | null>(null);

// Context Hook (inside custom hook)
const context = useContext(AnimeContext);
if (!context) throw new Error("...");

// Router Hooks
const { id } = useParams();
const navigate = useNavigate();

// Custom Hooks
const { allAnime, fetchNextPage } = useAnime();
const { favourites, toggleFavourite } = useFavourites();
```

---

## Phase 5: Feature Components

### Checklist
- [ ] AnimeMainList (home page with search/filter)
- [ ] AnimeCard (display individual anime)
- [ ] AnimeDetailedPage (full details view)
- [ ] FavouritePage (saved favorites)

### Interview Knowledge: How to Plan Hooks

**Step 1: Ask "What Changes?"**

```typescript
// What needs to change/render on update?
- User search query? → useState + useEffect (debounce)
- Anime list data? → useState
- Scroll position? → useRef (doesn't trigger re-render)
- User favorites? → useState + useEffect (localStorage)
```

**Step 2: Pattern Matching for Features**

| Feature | Hook Pattern |
|---------|-------------|
| **Search input** | `useState` (query) → `useEffect` (debounce) → API call |
| **API data** | `useState` (data) + `useEffect` (fetch on mount) |
| **Pagination** | `useState` (page) + `useRef` (fetched pages set) |
| **Favorites** | `useState` + `useEffect` (localStorage sync) |
| **Infinite scroll** | `useRef` (observer) + `useEffect` (setup/cleanup) |
| **Context global state** | Custom hook (`useAnime`, `useFavourites`) |

**Step 3: Anti-Patterns to Avoid**

```typescript
// ❌ WRONG - Conditional hook
if (someCondition) {
  const [value, setValue] = useState(0);  // Breaks rules!
}

// ❌ WRONG - useEffect with missing dependency
useEffect(() => {
  fetchData(someId);  // Missing [someId] dependency
});

// ❌ WRONG - useRef when you need re-render
const count = useRef(0);  // Won't trigger re-render when changed!
```

---

## Phase 6: State & Logic

### Checklist
- [ ] Connect components to Context
- [ ] Implement search with debounce
- [ ] Implement infinite scroll with IntersectionObserver
- [ ] Implement favorites with localStorage

### Interview Knowledge: Your Project Features

#### 1. Dedup List Implementation (TWO levels)

**Level 1: Set-based deduplication in fetchNextPage**
```typescript
// AnimeContext.tsx - Dedupe BEFORE adding to state
const fetchNextPage = async () => {
  const data = await fetchAllAnime(page);
  setAllAnime((prev) => {
    const seen = new Set(prev.map((a) => a.id));
    const uniqueNew = data.filter((a) => !seen.has(a.id));
    return [...prev, ...uniqueNew];
  });
};
```

**Level 2: Map-based deduplication in sourceAnimes**
```typescript
// AnimeMainList.tsx - Map-based deduplication
const sourceAnimes =
  mode === "search" ? searchResults :
  mode === "genre" ? Array.from(new Map(animeList.map(a => [a.id, a])).values()) :
  mode === "top" ? topAnime :
  allAnime;
```

**Interview Answer:**
> "I implemented deduplication at two levels. The context's fetchNextPage uses Set-based filtering to prevent duplicate anime during pagination. Additionally, the render layer uses Map-based deduplication for genre filtering, where the Jikan API may return the same anime across pages due to multi-genre assignments."

---

#### 2. Debounce Implementation

```typescript
// AnimeMainList.tsx - 250ms search debounce
useEffect(() => {
  const handler = setTimeout(() => setDebouncedQuery(searchQuery), 250);
  return () => clearTimeout(handler);
}, [searchQuery]);
```

**Why Debounce?**
- Prevents excessive API calls on every keystroke
- Only triggers search after user pauses typing for 250ms

---

#### 3. Infinite Scroll with IntersectionObserver

```typescript
// Using IntersectionObserver with rootMargin: "200px"
const observer = new IntersectionObserver((entries) => {
  if (!entries[0].isIntersecting) return;
  // fetch next page...
}, { rootMargin: "200px" });
```

---

#### 4. Caching Architecture (TWO types)

**In-Memory Cache (AnimeContext) - Session Only:**
```typescript
// animeById Record caches API responses
const [animeById, setAnimeById] = useState<Record<number, AnimeDetail>>({});

// Check cache before API call
const fetchAnimeById = async (id: number) => {
  if (animeById[id]) return;  // ✅ Cache hit
  const anime = await fetchAnimeByIdApi(id);
  setAnimeById((prev) => ({ ...prev, [id]: anime }));
};
```

**Persistent Cache (FavouritesContext) - LocalStorage:**
```typescript
// Load from localStorage on init
const [favourites, setFavourites] = useState<number[]>(() => {
  const stored = localStorage.getItem("favourites");
  return stored ? JSON.parse(stored) : [];
});

// Save to localStorage on change
const toggleFavourite = (id: number) => {
  setFavourites((prev) => {
    const updated = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
    localStorage.setItem("favourites", JSON.stringify(updated));
    return updated;
  });
};

// Sync across browser tabs
useEffect(() => {
  const onStorage = (e: StorageEvent) => {
    if (e.key === "favourites") {
      setFavourites(e.newValue ? JSON.parse(e.newValue) : []);
    }
  };
  window.addEventListener("storage", onStorage);
  return () => window.removeEventListener("storage", onStorage);
}, []);
```

**Interview Answer:**
> "The app has two caching strategies. First, AnimeContext caches API responses in a Record by ID for the session, preventing redundant API calls. Second, FavouritesContext persists favorites to localStorage with cross-tab synchronization using the storage event listener."

---

## Phase 7: Testing

### Checklist
- [ ] Unit tests (React components)
- [ ] Integration tests (API calls)
- [ ] E2E tests (Cypress/Playwright)
- [ ] Type checking (tsc --noEmit)

### Interview Knowledge: Not applicable to this project (no tests yet)

**If asked about testing:**
> "This project doesn't currently have test coverage. For a production app, I'd add Jest for unit tests, React Testing Library for component tests, and consider Playwright for E2E testing."

---

## Phase 8: Build & Optimize

### Checklist
- [ ] Run production build (npm run build)
- [ ] Analyze bundle size
- [ ] Optimize images/assets
- [ ] Configure environment variables
- [ ] Set up Vite preview locally

### Interview Knowledge: Lazy Loading

**What you DON'T have (but could add):**
```typescript
// React.lazy for route-based code splitting
import { lazy, Suspense } from 'react';
const AnimeDetailedPage = lazy(() => import('./components/AnimeDetailedPage'));

<Suspense fallback={<LoadingSkeleton />}>
  <AnimeDetailedPage />
</Suspense>
```

**What you DO have instead:**
- Infinite scroll (loads more data on demand)
- IntersectionObserver (triggers data fetch when element enters viewport)

**Interview Answer:**
> "Currently the app doesn't use React.lazy for code splitting, but I could implement it for route-based lazy loading. The infinite scroll pattern I'm using handles data lazy-loading instead of component lazy-loading."

---

## Phase 9: CI/CD Pipeline

### Checklist
- [ ] Set up GitHub Actions / GitLab CI
- [ ] Auto-run tests on push
- [ ] Auto-lint on pull requests
- [ ] Deploy on merge to main

### Interview Knowledge: Not applicable to this project (no CI/CD yet)

**If asked about CI/CD:**
> "This project doesn't have CI/CD set up yet. For production, I'd add GitHub Actions to run linting and tests on every push, with automatic deployment to Vercel on merge to main."

---

## Phase 10: Deployment

### Checklist
- [ ] Choose hosting platform:
  - **Vercel** (easiest for Vite apps)
  - **Netlify**
  - **AWS Amplify**
  - **Firebase Hosting**
- [ ] Configure build command: `npm run build`
- [ ] Configure output directory: `dist`
- [ ] Set up custom domain (optional)
- [ ] Configure environment variables in deployment platform

### Interview Knowledge: Client vs Server

**Your App Architecture:**
```
┌─────────────────────────────────────────────────────────┐
│              YOUR VITE REACT APP (Client)               │
│                                                         │
│  - All code runs in BROWSER (client)                   │
│  - No server-side rendering                            │
│  - React Router handles routing on client              │
│  - Static files served by Vercel (CDN)                 │
└─────────────────────────────────────────────────────────┘
           │                                        │
           │ HTTP Request                           │ HTTP Response
           │ (fetch)                                │ (JSON)
           ▼                                        ▼
┌─────────────────────────────────────────────────────────┐
│              JIKAN API (External Server)                │
│                                                         │
│  - Runs on THEIR server                                 │
│  - Returns JSON data                                    │
│  - You don't control this server                        │
└─────────────────────────────────────────────────────────┘
```

**"use client" vs "use server":**
- These are **Next.js App Router** directives
- Your app is **Vite SPA** = pure client-side
- No SSR/SSG = no need for "use client" or "use server"

**Interview Answer:**
> "My app is a Vite-based single-page application, not Next.js. All components render client-side. I don't need 'use client' because there's no server-side rendering - the entire app runs in the browser."

---

## Phase 11: Post-Deployment

### Checklist
- [ ] Set up monitoring (Sentry, LogRocket)
- [ ] Configure analytics
- [ ] Set up error reporting
- [ ] Create status page

### Interview Knowledge: Not applicable to this project

---

## Minimal MVP Path (Interview Answer)

If building for an interview/demo:

```
1. Setup Vite + React + TS
2. Add React Router
3. Create API layer (safeFetch + Jikan)
4. Build AnimeCard + AnimeMainList
5. Add search debounce
6. Implement Context for state
7. Add AnimeDetailedPage
8. Deploy to Vercel
```

**Interview Answer:**
> "For a startup MVP, I'd first set up the project with Vite for fast builds, then create the API layer with proper error handling. Next, I'd build the core components (Card, List, Detail), add state management with Context, and deploy early to Vercel for quick feedback."

---

## Deployment Platforms Comparison

| Platform | Pros | Cons |
|----------|------|------|
| **Vercel** | Zero-config, fast, great DX | Less control |
| **Netlify** | Easy, good form handling | Can get pricey |
| **Firebase** | Great for auth/db | Google-centric |
| **AWS** | Full control | Complex setup |

**For this project:** Vercel is the best choice - it auto-detects Vite apps and requires zero config.

---

## Rules of Hooks (You Obey All!)

### ✅ Rule 1: Only Call Hooks at Top Level
```typescript
// ✅ CORRECT - Called at top level
export default function AnimeMainList() {
  const [mode, setMode] = useState<Mode>("default");
  const [visibleCount, setVisibleCount] = useState(ANIME_DISPLAY_COUNT);
}
```

### ✅ Rule 2: Only Call Hooks from React Functions
```typescript
// ✅ CORRECT - Called from React components
export const useAnime = () => {
  const context = useContext(AnimeContext);
  return context;
};
```

### ✅ Rule 3: Hooks Must Start with "use"
```typescript
// ✅ CORRECT - Custom hooks properly named
export const useAnime = () => { ... };
export const useFavourites = () => { ... };
```

### ✅ Bonus: Proper Dependency Arrays
```typescript
// ✅ CORRECT - Dependencies properly specified
useEffect(() => {
  if (debouncedQuery) setMode("search");
}, [debouncedQuery, selectedGenre]);
```

---

## INTERSECTION OBSERVER vs THROTTLE

| Aspect | IntersectionObserver | Throttle |
|--------|---------------------|----------|
| **What it does** | Detects when element enters/leaves viewport | Limits how often a function runs |
| **How it works** | Browser-native, efficient callback when visibility changes | Forces minimum time gap between executions |
| **Performance** | ✅ Excellent - runs only when state changes | ⚠️ Still fires repeatedly on scroll |
| **Best for** | Infinite scroll, lazy loading images | Scroll animations, frequent API calls |

**Interview Answer:**
> "For infinite scroll, I chose IntersectionObserver because it's more performant - it only fires when the element actually enters the viewport, rather than continuously firing scroll events. Throttle would still run on every scroll tick, just less frequently."

---

## Algorithms Used in Your App

Your app uses several algorithmic techniques. Here's a complete breakdown:

### 1. Debouncing (Search)

**Location:** AnimeMainList.tsx (lines 52-56)

```typescript
useEffect(() => {
  const handler = setTimeout(() => setDebouncedQuery(searchQuery), 250);
  return () => clearTimeout(handler);
}, [searchQuery]);
```

**What it does:** Delays updating the search query until user stops typing for 250ms

**Algorithm Type:** Rate-limiting / Delay algorithm

**Time Complexity:** O(1) per keystroke

---

### 2. Set-based Deduplication (Pagination)

**Location:** AnimeContext.tsx (fetchNextPage)

```typescript
setAllAnime((prev) => {
  const seen = new Set(prev.map((a) => a.id));
  const uniqueNew = data.filter((a) => !seen.has(a.id));
  return [...prev, ...uniqueNew];
});
```

**What it does:** Prevents duplicate anime from appearing during infinite scroll pagination

**Algorithm Type:** Deduplication using Hash Set

**Time Complexity:** O(n) for Set creation + O(n) for filtering

---

### 3. Map-based Deduplication (Genre Mode)

**Location:** AnimeMainList.tsx (line 134)

```typescript
const sourceAnimes =
  mode === "genre" ? Array.from(new Map(animeList.map(a => [a.id, a])).values()) :
  // ...
```

**What it handles:** Removes duplicates when same anime appears in multiple genre pages

**Algorithm Type:** Deduplication using Hash Map

**Time Complexity:** O(n) for Map creation

---

### 4. Intersection Observer Pattern (Infinite Scroll)

**Location:** AnimeMainList.tsx

```typescript
const observer = new IntersectionObserver((entries) => {
  if (!entries[0].isIntersecting) return;
  setVisibleCount((prev) => prev + ANIME_DISPLAY_COUNT);
  // fetch next page...
}, { rootMargin: "200px" });
```

**What it does:** Detects when loader element enters viewport and triggers data fetch

**Algorithm Type:** Observer pattern (browser-native)

**Performance:** O(1) - only fires when element visibility actually changes

---

### 5. Page Tracking with Sets (Pagination)

**Location:** AnimeContext.tsx

```typescript
const fetchedPagesRef = useRef<Set<number>>(new Set());

const fetchNextPage = async () => {
  if (fetchedPagesRef.current.has(page)) return;  // Prevent duplicate fetches
  fetchedPagesRef.current.add(page);
  // ...
};
```

**What it does:** Tracks which pages have been fetched to prevent re-fetching

**Algorithm Type:** Set membership check

**Time Complexity:** O(1) for has() and add()

---

### 6. Cache-aside Pattern (In-Memory Cache)

**Location:** AnimeContext.tsx (animeById)

```typescript
const fetchAnimeById = async (id: number) => {
  if (animeById[id]) return;  // Cache hit - no API call
  const anime = await fetchAnimeByIdApi(id);
  setAnimeById((prev) => ({ ...prev, [id]: anime }));  // Cache miss - store result
};
```

**What it does:** Stores API responses in memory to avoid redundant network calls

**Algorithm Type:** Cache-aside / Memoization

**Time Complexity:** O(1) for cache lookup

---

### 7. LocalStorage Persistence with Cross-tab Sync

**Location:** FavouritesContext.tsx

```typescript
// Load from localStorage on init
const [favourites, setFavourites] = useState<number[]>(() => {
  const stored = localStorage.getItem("favourites");
  return stored ? JSON.parse(stored) : [];
});

// Sync across browser tabs
useEffect(() => {
  const onStorage = (e: StorageEvent) => {
    if (e.key === "favourites") {
      setFavourites(e.newValue ? JSON.parse(e.newValue) : []);
    }
  };
  window.addEventListener("storage", onStorage);
}, []);
```

**What it does:** Persists favorites across sessions and syncs between browser tabs

**Algorithm Type:** Event-driven state synchronization

---

### 8. State Machine (Mode-based Rendering)

**Location:** AnimeMainList.tsx

```typescript
type Mode = "default" | "genre" | "search" | "top";

useEffect(() => {
  if (debouncedQuery) setMode("search");
  else if (selectedGenre === "top") setMode("top");
  else if (selectedGenre) setMode("genre");
  else setMode("default");
}, [debouncedQuery, selectedGenre]);
```

**What it does:** Determines display mode based on user interactions

**Algorithm Type:** State machine pattern

---

### Summary Table

| Algorithm/Pattern | Location | Type | Time Complexity |
|-------------------|----------|------|-----------------|
| Debouncing | AnimeMainList.tsx | Rate-limiting | O(1) |
| Set dedup | AnimeContext.tsx | Deduplication | O(n) |
| Map dedup | AnimeMainList.tsx | Deduplication | O(n) |
| IntersectionObserver | AnimeMainList.tsx | Observer pattern | O(1) |
| Page tracking | AnimeContext.tsx | Set membership | O(1) |
| Cache-aside | AnimeContext.tsx | Memoization | O(1) |
| LocalStorage sync | FavouritesContext.tsx | Event-driven | O(1) |
| State machine | AnimeMainList.tsx | Mode-based logic | O(1) |

**Interview Answer:**
> "My app uses several algorithmic techniques:
> 1. **Debouncing** for search input with 250ms delay
> 2. **Set-based deduplication** to prevent duplicate anime in pagination
> 3. **Map-based deduplication** for genre filtering
> 4. **IntersectionObserver** for efficient infinite scroll
> 5. **Cache-aside pattern** for in-memory API caching
> 6. **State machine** to manage display modes
>
> The key focus was on performance: using browser-native APIs where possible, avoiding redundant API calls, and ensuring O(1) operations for frequently called checks."

---

## Flattening vs Normalization (Data Structure Patterns)

### The Problem: Nested API Responses

APIs often return deeply nested data that's hard to work with:

```javascript
// API Response (Nested)
{
  "data": [
    {
      "id": 1,
      "title": "Naruto",
      "genres": [
        { "id": 1, "name": "Action" },
        { "id": 2, "name": "Anime" }
      ],
      "author": {
        "id": 1,
        "name": "Kishimoto"
      }
    }
  ]
}
```

### Option 1: Flattening (Dot Notation)

Converts nested objects into flat keys:

```javascript
// Flattened (Bad for UI!)
{
  "id": 1,
  "title": "Naruto",
  "genres.0.id": 1,
  "genres.0.name": "Action",
  "genres.1.id": 2,
  "genres.1.name": "Anime",
  "author.id": 1,
  "author.name": "Kishimoto"
}
```

**Problems:**
- ❌ Destroys array structure
- ❌ Loses semantic meaning (is "genres.0.name" an array or object?)
- ❌ Hard to render in UI
- ❌ Difficult to update nested values

### Option 2: Normalization (Your App's Approach)

Keep entities separate, reference by ID:

```typescript
// Normalized (Good for UI!)
// entities = {
//   animes: { 1: { id: 1, title: "Naruto", genreIds: [1, 2], authorId: 1 } },
//   genres: { 1: { id: 1, name: "Action" }, 2: { id: 2, name: "Anime" } },
//   authors: { 1: { id: 1, name: "Kishimoto" } }
// }
```

**Benefits:**
- ✅ Easy to update (update one place, all references update)
- ✅ Efficient caching (lookup by ID O(1))
- ✅ No duplicate data
- ✅ Great for global state (Redux, Context)

### Your App's Data Transformation:

```typescript
// src/api/jikan.ts → src/api/dataTypes.ts
// Raw API → Normalized App Model

const rawAnime = {
  mal_id: 1,
  title: "Naruto",
  images: { jpg: { image_url: "..." } },
  genres: [{ mal_id: 1, name: "Action" }],
};

// ↓ transform()

const anime: Anime = {
  id: 1,
  title: "Naruto",
  imageUrl: "...",
  genres: ["Action"],  // Simplified for UI
};
```

### When to Use Each:

| Scenario | Flatten | Normalize |
|----------|---------|-----------|
| **UI rendering** | ❌ | ✅ |
| **Logging** | ✅ | ❌ |
| **Analytics** | ✅ | ❌ |
| **CSV export** | ✅ | ❌ |
| **Global app state** | ❌ | ✅ |
| **API caching** | ❌ | ✅ |
| **Redux / RTK Query** | ❌ | ✅ |

### Interview Answer:
> "I never flatten data for UI rendering because it destroys the semantic structure. Instead, I normalize API responses into domain-specific models. For example, my app transforms Jikan's nested response into a flat `Anime` interface with just the fields I need. This makes rendering straightforward and enables efficient caching - I can look up any anime by ID in O(1) time. Flattening is only useful for logging or analytics where you need a single-level object."

---

## Common Coding Challenges to Practice

- Array/string manipulation
- Flatten objects/arrays
- **Dedup list** (you have this - see above)
- **debounce** (you have this - see above)
- **throttle** (you use IntersectionObserver instead - see above)
- LRU cache implementation
- React component from description

---

## Behavioral Questions (STAR Method)

### Common Questions:
- "Tell me about yourself"
- "Why do you want to join our startup?"
- "What was your most challenging project?"
- "How do you handle disagreements with team members?"
- "Where do you see yourself in 2 years?"

### STAR Format:
- **S**ituation: Set the context
- **T**ask: What was required
- **A**ction: What YOU did
- **R**esult: Positive outcome

---

## Questions to Ask Them

1. "What's the current tech stack?"
2. "What's the biggest technical challenge the team is facing?"
3. "How does the engineering team work together?"
4. "What's the product vision for the next year?"
5. "What's the team culture like?"

---

## Time Management (1 Hour Interview)

- **5-10 min**: Intro/behavioral
- **30-40 min**: Technical/ coding challenge
- **10-15 min**: Questions from you

---

## Pro Tips for Startup Interviews

1. **Show initiative**: Mention any side projects or learning
2. **Be practical**: Startups value "get it done" over perfection
3. **Ask questions**: Shows engagement and curiosity
4. **Think out loud**: They want to see your problem-solving process
5. **Be honest**: It's okay to say "I don't know, but here's how I'd find out"

---

## Quick Resources to Review

- [React Docs - Hooks](https://react.dev/reference/react)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [JavaScript.info](https://javascript.info/)
- [React Router Docs](https://reactrouter.com/)
- [Vite Docs](https://vitejs.dev/)
---

## Folder Structure After Deployment

```
anime-explorer-app/
├── src/
│   ├── api/           # API calls
│   ├── components/    # React components
│   ├── context/       # State management
│   ├── types/         # TypeScript definitions
│   └── styles/        # CSS
├── dist/              # Production build (deployed)
├── .github/workflows/ # CI/CD
├── vercel.json        # Vercel config
└── package.json
```

---

