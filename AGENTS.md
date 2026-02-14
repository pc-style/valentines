# AGENTS.md -- Valentine Anniversary Website

## Build & Dev
- **Install**: `bun install`
- **Dev**: `bun run dev` (Vite dev server, proxies /api to localhost:3001)
- **Build**: `bun run build` (runs `tsc -b && vite build`, output in `dist/`)
- **Lint**: `bun run lint` (ESLint with typescript-eslint, react-hooks, react-refresh)
- **Deploy**: Vercel (auto-detects Vite + serverless functions in /api)
- No test framework configured.

## Architecture
- **Stack**: React 19, TypeScript (strict), Tailwind CSS v4, Vite 7, Motion (framer-motion)
- **Backend**: Vercel Serverless Functions (`api/` directory), Vercel Postgres, Vercel Blob
- **Auth**: WebAuthn passkeys via @simplewebauthn/server + @simplewebauthn/browser
- **Entry**: `index.html` -> `src/main.tsx` -> `src/App.tsx` (single-page, all sections in App.tsx)
- **Sections**: HeroSection, PolaroidSection, TransitionSection, FilmReelSection, FinaleSection
- **Data**: Dynamic from API (`GET /api/photos`), fallback to `src/data/photos.ts`
- **Hooks**: `src/hooks/usePhotos.ts` (photo fetching), `src/hooks/useAuth.ts` (WebAuthn auth)
- **Components**: `src/components/AdminPanel.tsx` (login, upload, edit)
- **Styles**: `src/index.css` -- Tailwind + custom `@theme` tokens (colors, fonts), CSS keyframe animations
- **Images**: Vercel Blob storage (new uploads) + `public/photos/` (legacy static)
- **Path alias**: `@/*` maps to `src/*` (configured in tsconfig + vite)

## API Endpoints (api/ directory)
- `GET /api/photos` -- public, returns all photos with metadata
- `POST /api/photos/upload` -- authenticated, upload photo (raw body + query params)
- `PATCH /api/photos/[id]` -- authenticated, edit photo description/date
- `POST /api/photos/programmatic-add` -- key-based auth (x-username + x-api-key headers)
- `POST /api/webauthn/register/options` -- get passkey registration options
- `POST /api/webauthn/register/verify` -- verify passkey registration
- `POST /api/webauthn/authenticate/options` -- get passkey login options
- `POST /api/webauthn/authenticate/verify` -- verify passkey login
- `GET /api/auth/me` -- check current session
- `POST /api/auth/logout` -- clear session
- `POST /api/migrate` -- run DB migrations (requires REGISTRATION_KEY)
- `POST /api/seed` -- seed initial 33 photos (requires REGISTRATION_KEY)

## Database (Vercel Postgres)
- **Tables**: users, passkeys, sessions, photos
- **Hardcoded users**: "adas" and "roksanka" (max 2 users, max 3 passkeys each)

## Environment Variables
- `POSTGRES_URL` -- Vercel Postgres connection string
- `BLOB_READ_WRITE_TOKEN` -- Vercel Blob storage token
- `REGISTRATION_KEY` -- Shared key for passkey registration + programmatic API
- `WEBAUTHN_RP_ID` -- WebAuthn relying party ID (e.g., domain)
- `WEBAUTHN_RP_NAME` -- WebAuthn relying party name
- `WEBAUTHN_ORIGIN` -- WebAuthn expected origin

## Code Style
- ESM (`"type": "module"`), functional React components, no class components
- Imports: named imports from `motion/react`; type imports use `import type`
- Custom hooks use `use` prefix (e.g., `useIsMobile`); helper functions at file top
- Tailwind utility classes in JSX; custom design tokens via `--color-*` CSS variables
- TypeScript strict mode: no `any`, no unused locals/params, `verbatimModuleSyntax`
- API files prefixed with `_` are private helpers (not exposed as endpoints)
