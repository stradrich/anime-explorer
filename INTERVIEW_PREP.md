# Frontend Interview Preparation Guide

## Quick Wins - Respond to the Email First


## Technical Preparation (Frontend Startup Focus)

### 1. Core React (High Priority)
- **React Hooks**: useState, useEffect, useContext, useRef, useMemo, useCallback
- **Component Patterns**: Compound components, HOCs, Render props, Custom hooks
- **State Management**: Context API, when to use it vs Redux/Zustand
- **Performance**: React.memo, lazy loading, code splitting, virtual DOM

### 2. TypeScript (Startup loves TS)
- Generics
- Type inference
- Utility types (Partial, Pick, Omit, Record)
- Type guards

### 3. JavaScript Fundamentals
- Closures, scope, hoisting
- Event loop, async/await, promises
- Array methods (map, filter, reduce)
- ES6+ features

### 4. CSS & Styling
- Flexbox, Grid
- Tailwind (I see this project uses Tailwind)
- CSS-in-JS concepts
- Responsive design

### 5. Common Coding Challenges Practice
- Array/string manipulation
- Flatten objects/arrays (you don't have this in your project)
- **Dedup list** (you DO have this - see below!)
- **debounce** (you have this for search - 250ms delay)
- **throttle** (you use IntersectionObserver instead - be ready to explain why)
- LRU cache implementation
- React component from description

---

## TypeScript Types Architecture (YOU HAVE THIS!)

### All Types in Your Project:

| File | Type/Interface | Purpose |
|------|----------------|---------|
| **src/api/dataTypes.ts** | `Anime` | App data shape (list view) |
| | `AnimeDetail` | App data shape (detail view) - extends Anime |
| **src/api/jikan.ts** | `RawGenre` | Raw Jikan API genre shape |
| **src/context/AnimeContext.tsx** | `AnimeContextType` | Context public API (data + functions + states) |

### Type Flow Diagram:

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

## React Hooks - What You Use & How You Plan

### React Hooks Categories:

| Category | Hooks | You Use It? |
|----------|-------|-------------|
| **State** | `useState` | ✅ Yes (13+ times) |
| **Effect** | `useEffect` | ✅ Yes (7+ times) |
| **Ref** | `useRef` | ✅ Yes (3+ times) |
| **Context** | `useContext` | ✅ Yes (in custom hooks) |
| **Router** | `useParams`, `useNavigate` | ✅ Yes |
| **Performance** | `useMemo`, `useCallback` | ❌ No |
| **Transition** | `useTransition`, `useDeferredValue` | ❌ No |

### Hooks You Use in Your Project:

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

## How to Plan Hooks (Thought Process)

### Step 1: Ask "What Changes?"

```typescript
// What needs to change/render on update?
- User search query? → useState + useEffect (debounce)
- Anime list data? → useState
- Scroll position? → useRef (doesn't trigger re-render)
- User favorites? → useState + useEffect (localStorage)
```

### Step 2: Pattern Matching for Features

| Feature | Hook Pattern |
|---------|-------------|
| **Search input** | `useState` (query) → `useEffect` (debounce) → API call |
| **API data** | `useState` (data) + `useEffect` (fetch on mount) |
| **Pagination** | `useState` (page) + `useRef` (fetched pages set) |
| **Favorites** | `useState` + `useEffect` (localStorage sync) |
| **Infinite scroll** | `useRef` (observer) + `useEffect` (setup/cleanup) |
| **Context global state** | Custom hook (`useAnime`, `useFavourites`) |

### Step 3: Anti-Patterns to Avoid

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

## Rules of Hooks (You Obey All!)

### ✅ Rule 1: Only Call Hooks at Top Level
```typescript
// ✅ CORRECT - Called at top level
export default function AnimeMainList() {
  const [mode, setMode] = useState<Mode>("default");
  const [visibleCount, setVisibleCount] = useState(ANIME_DISPLAY_COUNT);
  // ... more hooks at top level
}
```

### ✅ Rule 2: Only Call Hooks from React Functions
```typescript
// ✅ CORRECT - Called from React components
export const useAnime = () => {
  const context = useContext(AnimeContext);  // React hook
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

**Interview Answer:**
> "When building features, I ask: 'What triggers changes?' If data changes → useState. If side effects → useEffect. If URL → useParams. If global state → useContext. I create custom hooks when logic is reused across components. I follow all hook rules: top-level only, React functions only, and proper 'use' prefix for custom hooks."

---

## Your Project Features to Highlight

### Dedup List Implementation (YOU HAVE THIS!)

You have **TWO levels of deduplication**:

#### Level 1: Set-based deduplication in fetchNextPage
```typescript
// AnimeContext.tsx - Line 43-60 - Dedupe BEFORE adding to state
const fetchNextPage = async () => {
  const data = await fetchAllAnime(page);
  
  // Filter duplicates BEFORE adding to state
  setAllAnime((prev) => {
    const seen = new Set(prev.map((a) => a.id));
    const uniqueNew = data.filter((a) => !seen.has(a.id));
    return [...prev, ...uniqueNew];
  });
};
```

#### Level 2: Map-based deduplication in sourceAnimes
```typescript
// AnimeMainList.tsx - Line 134-138 - Map-based deduplication
const sourceAnimes =
  mode === "search" ? searchResults :
  mode === "genre" ? Array.from(new Map(animeList.map(a => [a.id, a])).values()) :
  mode === "top" ? topAnime :
  allAnime;
```

**Why Two Levels?**
| Level | Purpose |
|-------|---------|
| **fetchNextPage** | Handles duplicates in default "all anime" pagination |
| **sourceAnimes** | Handles duplicates specifically in **genre** mode (different API endpoint) |

**Interview Answer:**
> "I implemented deduplication at two levels. The context's fetchNextPage uses Set-based filtering to prevent duplicate anime during pagination. Additionally, the render layer uses Map-based deduplication for genre filtering, where the Jikan API may return the same anime across pages due to multi-genre assignments."

### Debounce Implementation (YOU HAVE THIS!)
```typescript
// AnimeMainList.tsx - 250ms search debounce
useEffect(() => {
  const handler = setTimeout(() => setDebouncedQuery(searchQuery), 250);
  return () => clearTimeout(handler);
}, [searchQuery]);
```

### Scroll Handling (YOU USE INTERSECTION OBSERVER - NO THROTTLE)
```typescript
// Using IntersectionObserver with rootMargin: "200px"
// Not throttled - fires once when element comes into view
const observer = new IntersectionObserver((entries) => {
  if (!entries[0].isIntersecting) return;
  // fetch next page...
}, { rootMargin: "200px" });
```

### Key Differences (Interview Answer):
- **Debounce**: Waits until user STOPS typing → perfect for search inputs
- **Throttle**: Limits how OFTEN something executes → typically for scroll events
- **IntersectionObserver**: Native browser API → more efficient than scroll event listeners

---

## INTERSECTION OBSERVER vs THROTTLE

| Aspect | IntersectionObserver | Throttle |
|--------|---------------------|----------|
| **What it does** | Detects when element enters/leaves viewport | Limits how often a function runs |
| **How it works** | Browser-native, efficient callback when visibility changes | Forces minimum time gap between executions |
| **Performance** | ✅ Excellent - runs only when state changes | ⚠️ Still fires repeatedly on scroll |
| **Best for** | Infinite scroll, lazy loading images | Scroll animations, frequent API calls |
| **Your implementation** | Uses `rootMargin: "200px"` to pre-fetch before element visible | N/A - Observer is better choice |

### When to Use Each:

**IntersectionObserver** ✅ (What you're using):
```typescript
// Fires ONCE when element enters viewport - very efficient!
const observer = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting) loadMore();
}, { rootMargin: "200px" });
```

**Throttle** (Alternative for scroll events):
```typescript
// Fires at most every 300ms during scroll
window.addEventListener('scroll', throttle(handleScroll, 300));
```

### Interview Answer:
> "For infinite scroll, I chose IntersectionObserver because it's more performant - it only fires when the element actually enters the viewport, rather than continuously firing scroll events. Throttle would still run on every scroll tick, just less frequently."

---

## Lazy Loading - What You DON'T Have

### ❌ React.lazy + Suspense (Route-based code splitting)
Your project doesn't use component lazy loading.

**What you DO have instead:**
- **Infinite scroll** (loads more data on demand)
- **IntersectionObserver** (triggers data fetch when element enters viewport)

**If asked about lazy loading:**
> "Currently the app doesn't use React.lazy for code splitting, but I could implement it for route-based lazy loading. The infinite scroll pattern I'm using handles data lazy-loading instead of component lazy-loading. For a production app, I'd add React.lazy for the detailed page to reduce initial bundle size."

**Code example (what you could add):**
```typescript
import { lazy, Suspense } from 'react';
const AnimeDetailedPage = lazy(() => import('./components/AnimeDetailedPage'));

// Wrap in Suspense with fallback
<Suspense fallback={<LoadingSkeleton />}>
  <AnimeDetailedPage />
</Suspense>
```

---

## Caching Architecture (YOU HAVE THIS!)

Your app has **TWO types of caching** with different purposes:

### 1. In-Memory Cache (AnimeContext) - Session Only

```typescript
// AnimeContext.tsx - animeById Record
const [animeById, setAnimeById] = useState<Record<number, AnimeDetail>>({});

// Cache on fetch
const fetchAnimeById = async (id: number) => {
  if (animeById[id]) return;  // ✅ Check cache first
  const anime = await fetchAnimeByIdApi(id);
  setAnimeById((prev) => ({ ...prev, [id]: anime }));  // ✅ Store in cache
};
```

| Feature | How It Works |
|---------|--------------|
| **Storage** | In-memory (React state) |
| **Persistence** | Lost on page refresh |
| **Purpose** | Avoid redundant API calls during session |

### 2. Persistent Cache (FavouritesContext) - LocalStorage

```typescript
// FavouritesContext.tsx - Load from localStorage on init
const [favourites, setFavourites] = useState<number[]>(() => {
  const stored = localStorage.getItem("favourites");
  return stored ? JSON.parse(stored) : [];
});

// Save to localStorage on change
const toggleFavourite = (id: number) => {
  setFavourites((prev) => {
    const updated = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
    localStorage.setItem("favourites", JSON.stringify(updated));  // ✅ Persist
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

| Feature | How It Works |
|---------|--------------|
| **Storage** | localStorage (browser) |
| **Persistence** | Survives page refresh |
| **Cross-tab sync** | Uses `storage` event listener |
| **Purpose** | Keep favorites across sessions |

### Caching Flow Diagram:

```
┌─────────────────────────────────────────────────────────┐
│                    USER INTERACTION                     │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│              AnimeContext (In-Memory Cache)             │
│  animeById: Record<number, AnimeDetail>                 │
│  - API responses cached here                            │
│  - Lost on refresh                                      │
└─────────────────────────────────────────────────────────┘
                           │
            ┌──────────────┴──────────────┐
            ▼                              ▼
┌─────────────────────┐        ┌─────────────────────┐
│  Cache hit?         │        │ FavouritesContext   │
│  → Use cached data  │        │ (localStorage)      │
│  → No API call      │        │ - Persists forever  │
└─────────────────────┘        │ - Syncs across tabs │
            │                  └─────────────────────┘
            ▼
┌─────────────────────────────────────────────────────────┐
│                    API CALL (if needed)                 │
│         Jikan API → safeFetch → transform → cache       │
└─────────────────────────────────────────────────────────┘
```

**Interview Answer:**
> "The app has two caching strategies. First, AnimeContext caches API responses in a Record by ID for the session, preventing redundant API calls. Second, FavouritesContext persists favorites to localStorage with cross-tab synchronization using the storage event listener. The in-memory cache improves performance during a session, while localStorage preserves data across sessions."


---

## Your Project (Anime Explorer) - Know This Inside Out

Since this is your project, be ready to discuss:
- **Architecture**: Why did you structure it this way?
- **Context API**: Why use it over other solutions?
- **API integration**: How do you handle errors, loading states?
- **Performance**: Any optimizations made?
- **Challenges faced**: How did you solve them?

### Sample Questions They'll Ask:
1. "Walk me through how this app works"
2. "Why did you choose Context API for state management?"
3. "How would you scale this app?"
4. "What's your favorite feature and why?"

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

## Questions to Ask Them (Show Genuine Interest)

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

---

## For Responding to the Email

Send your availability for **3 time slots** within the next 1-2 weeks. Be professional and concise!

Good luck! 🍀

