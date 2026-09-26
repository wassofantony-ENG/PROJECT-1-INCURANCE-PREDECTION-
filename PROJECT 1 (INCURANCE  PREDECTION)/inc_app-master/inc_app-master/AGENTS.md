<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Project-specific guidance

- This repository is a small Next.js 16 app using the App Router, TypeScript, Tailwind CSS v4, `next/font`, and `lucide-react` icons.
- Primary source directories:
  - `app/` for pages, layouts, and route handlers
  - `components/` for reusable UI components
  - `lib/` for shared utilities such as `lib/auth.ts`
  - `types/` for TypeScript type definitions
  - `public/` for static assets

## Page structure

| Route | File | Description |
|-------|------|-------------|
| `/` | `app/page.tsx` | Landing page — composes Header, HeroSection, FeaturesSection, PricingSection, CtaSection, Footer |
| `/login` | `app/login/page.tsx` | Login form with API error display |
| `/register` | `app/register/page.tsx` | Registration form with API error display |
| `/dashboard` | `app/dashboard/page.tsx` | Dashboard home with stat cards and recent activity |
| `/dashboard` | `app/dashboard/layout.tsx` | Shared dashboard layout — auth guard, fetches user info, renders sidebar + modal |
| `/dashboard/clients` | `app/dashboard/clients/page.tsx` | Clients table with loading/error/empty states |

## Components (`components/`)

| Component | File | Description |
|-----------|------|-------------|
| `Header` | `components/header.tsx` | Site navigation with logo, nav links, sign in / get started buttons |
| `HeroSection` | `components/hero-section.tsx` | Hero with gradient text, CTA buttons, stats bar |
| `FeaturesSection` | `components/features-section.tsx` | 6-card features grid |
| `FeatureCard` | `components/feature-card.tsx` | Single feature card with icon, title, description |
| `PricingSection` | `components/pricing-section.tsx` | 3-tier pricing table (Free, Pro featured, Enterprise) |
| `CtaSection` | `components/cta-section.tsx` | Call-to-action card with trial link |
| `Footer` | `components/footer.tsx` | Site footer with branding |
| `AuthCard` | `components/auth-card.tsx` | Shared card wrapper for login/register forms |
| `Orb` | `components/orb.tsx` | Decorative background blur element |
| `DashboardSidebar` | `components/dashboard-sidebar.tsx` | Dashboard sidebar with user info, avatar, nav (Home, Clients dropdown), sign out |
| `AddClientForm` | `components/add-client-form.tsx` | Modal form for creating a new client using PredictionForm fields |
| `DashboardCharts` | `components/charts/dashboard-charts.tsx` | Dashboard charts grid — bar, pie, scatter charts using recharts |
| `ThemeProvider` | `components/theme-provider.tsx` | Dark/light mode context with localStorage persistence |

## Auth flow

- `lib/auth.ts` — `logIn()` and `register()` functions POST to `http://127.0.0.1:8000/users/login` and `http://127.0.0.1:8000/users/register`.
- On success: stores `authToken` in localStorage and redirects to `/dashboard`.
- On error: parses the response body (`detail` or `message`) and throws it as the error message.
- `lib/getUserInfo.ts` — `getUserInfo()` fetches `GET /users/check?id={id}` using the Bearer token.
- `lib/getUserInfo.ts` — `getUserIdFromToken()` decodes the JWT (`jwt-decode` library) and extracts the user ID from `sub` / `id` / `user_id` claim.
- Login & register pages display the error in a red banner above the form and disable the submit button while loading.
- Authentication check on `/dashboard` routes (via layout) and landing page: reads `authToken` from localStorage; redirects to `/login` or `/dashboard` respectively.
- The dashboard layout guards all `/dashboard/*` routes — if no token, redirects to `/login`.

## API clients flow

- `lib/getClients.ts` — `getClients(token, skip, limit)` fetches `GET {NEXT_PUBLIC_API_URL}/clients/?skip={skip}&limit={limit}`.
- `components/add-client-form.tsx` — POSTs `{NEXT_PUBLIC_API_URL}/clients/` with the `PredictionForm` body to create a client, then reloads the page.
- API base URL is configured via `NEXT_PUBLIC_API_URL` environment variable.

## Types

| File | Types |
|------|-------|
| `types/auth.ts` | `LoginForm`, `RegisterForm`, `TokenBody`, `UserInfo` |
| `types/client.ts` | `Client` (full client record with id, user_id, email, customers_name, age, gender, bmi, bloodpressure, diabetic, children, smoker, region, AI_Prediction, isDone, final_cost), `PredictionForm` (subset for creation) |

## Styling

- Global styles in `app/global.css` — imports Tailwind CSS v4 and defines custom `@keyframes` for `fade-in` and `gradient` animations registered via `@theme inline`.
- All components use Tailwind utility classes. No CSS modules or styled-jsx.
- Use `animate-fade-in` and `animate-gradient` Tailwind classes for entrance and gradient text animations.
- **Theme system**: Dark/light mode via `ThemeProvider` (`components/theme-provider.tsx`). Theme is persisted to localStorage and syncs to `<html class="dark">`. An inline script in `app/layout.tsx` prevents flash of wrong theme.
- **Never use hardcoded color classes** like `bg-slate-950`, `text-slate-400`, `border-slate-800`. Always use CSS variable-based classes:
  - `bg-background` / `text-foreground` / `border-border` for page chrome
  - `bg-card` / `text-card-foreground` for card surfaces
  - `bg-muted` / `text-muted-foreground` for muted elements
  - `bg-sidebar` / `text-sidebar-foreground` / `border-sidebar-border` for sidebar
  - `bg-primary` / `text-primary-foreground` for primary buttons
  - Accent colors (e.g. `text-sky-500`, `bg-emerald-500/10`) are fine since they work in both themes.
- Light mode values live in `:root`, dark mode values in `.dark` block in `global.css`.

## Dependencies

| Package | Purpose |
|---------|---------|
| `next` | Framework |
| `react` / `react-dom` | UI library |
| `tailwindcss` / `@tailwindcss/postcss` | Styling |
| `lucide-react` | Icons |
| `recharts` | Charts (bar, pie, scatter) |
| `jwt-decode` | Client-side JWT payload decoding |
| `typescript` | Type checking |
| `eslint` / `eslint-config-next` | Linting |

## Development and build commands

- `npm run dev` to start local development
- `npm run build` to compile for production
- `npm run start` to run the production server
- `npm run lint` to check code with ESLint

## Local API and auth intent

- The app is intended to become a service with a local API during development, login, and a user dashboard.
- For local APIs, use App Router route handlers in `app/api/.../route.ts`.
- For auth/dashboard flows, prefer server-rendered routes and guard pages at the layout or route level using Next.js idioms.
- Do not assume external auth providers are installed; keep auth logic compatible with the current minimal dependency set.
- Backend base URL defaults to `http://127.0.0.1:8000` in auth lib; clients lib uses `NEXT_PUBLIC_API_URL` env var.

## When editing code

- Preserve the existing app router structure.
- Avoid introducing conflicting frameworks or runtime patterns.
- Keep changes minimal and consistent with a Next.js 16 app using TypeScript and Tailwind.
- If adding documentation, link to existing files instead of duplicating large explanations.
- **Always separate UI into reusable components** — extract any non-trivial TSX block into its own file under `components/`. Pages should only compose and wire up data; presentation lives in components.
- **Never use `any` type** — define interfaces for all props, state, and function parameters.
- **Charts with recharts**: place chart components in `components/charts/`. Override recharts default styles (white tooltip background, outlines) in `app/global.css` — do NOT use inline `<style>` blocks inside components. Format tooltip values conditionally: use `formatCurrency()` only when `dataKey === "avg_cost"`, show raw numbers for `dataKey === "count"`.
- **Tailwind v4 gradients**: use `bg-linear-to-r` (not `bg-gradient-to-r`). Use `bg-[length:200%_auto]` (not `bg-size-[200%_auto]`).
- **Flash prevention for theme**: add an inline `<script>` in `app/layout.tsx` before React hydrates to read localStorage and set `.dark` class on `<html>`.
- **Synchronous calling**:never write a UseState inside useEffect in a Synchronous way.