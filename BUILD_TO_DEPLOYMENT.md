# Build to Deployment Checklist

## Phase 1: Project Foundation
- [ ] Initialize project with Vite + React + TypeScript
- [ ] Set up TypeScript config (tsconfig.json)
- [ ] Configure linting (ESLint + Prettier)
- [ ] Set up Tailwind CSS
- [ ] Configure path aliases (@/ components, @/api, etc.)

## Phase 2: Core Architecture
- [ ] Set up React Router (routes structure)
- [ ] Create Context providers (AnimeContext, FavouritesContext)
- [ ] Define TypeScript interfaces (Anime, AnimeDetail, etc.)
- [ ] Set up global styles (globals.css)

## Phase 3: API Layer
- [ ] Create API client (axios or fetch wrapper)
- [ ] Implement safeFetch with retry logic
- [ ] Create data transformation functions
- [ ] Set up API error handling

## Phase 4: Component Foundation
- [ ] Layout component (navigation, footer, etc.)
- [ ] Base UI components (Button, Input, Card, etc.)
- [ ] Loading skeleton component
- [ ] Error boundary

## Phase 5: Feature Components
- [ ] AnimeMainList (home page with search/filter)
- [ ] AnimeCard (display individual anime)
- [ ] AnimeDetailedPage (full details view)
- [ ] FavouritePage (saved favorites)

## Phase 6: State & Logic
- [ ] Connect components to Context
- [ ] Implement search with debounce
- [ ] Implement infinite scroll with IntersectionObserver
- [ ] Implement favorites with localStorage

## Phase 7: Testing
- [ ] Unit tests (React components)
- [ ] Integration tests (API calls)
- [ ] E2E tests (Cypress/Playwright)
- [ ] Type checking (tsc --noEmit)

## Phase 8: Build & Optimize
- [ ] Run production build (npm run build)
- [ ] Analyze bundle size
- [ ] Optimize images/assets
- [ ] Configure environment variables
- [ ] Set up Vite preview locally

## Phase 9: CI/CD Pipeline
- [ ] Set up GitHub Actions / GitLab CI
- [ ] Auto-run tests on push
- [ ] Auto-lint on pull requests
- [ ] Deploy on merge to main

## Phase 10: Deployment
- [ ] Choose hosting platform:
  - **Vercel** (easiest for Vite apps)
  - **Netlify**
  - **AWS Amplify**
  - **Firebase Hosting**
- [ ] Configure build command: `npm run build`
- [ ] Configure output directory: `dist`
- [ ] Set up custom domain (optional)
- [ ] Configure environment variables in deployment platform

## Phase 11: Post-Deployment
- [ ] Set up monitoring (Sentry, LogRocket)
- [ ] Configure analytics
- [ ] Set up error reporting
- [ ] Create status page

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

## Deployment Platforms Comparison

| Platform | Pros | Cons |
|----------|------|------|
| **Vercel** | Zero-config, fast, great DX | Less control |
| **Netlify** | Easy, good form handling | Can get pricey |
| **Firebase** | Great for auth/db | Google-centric |
| **AWS** | Full control | Complex setup |

**For this project:** Vercel is the best choice - it auto-detects Vite apps and requires zero config.


