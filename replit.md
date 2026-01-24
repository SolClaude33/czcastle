# Castle Clash Duel

## Overview

Castle Clash Duel is a browser-based strategy game with a leaderboard system. The project features a Phaser.js game embedded in a static HTML page, a React-based landing page and leaderboard interface, and an Express backend with PostgreSQL database for score persistence.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React SPA**: Built with Vite, using wouter for routing and React Query for server state management
- **UI Components**: Shadcn/ui component library with Radix UI primitives, styled with Tailwind CSS
- **Game Engine**: Phaser 3 game runs in a separate static HTML file (`/game.html`) outside the React app
- **Animations**: Framer Motion for page transitions and UI animations
- **Path Aliases**: `@/` maps to `client/src/`, `@shared/` maps to `shared/`

### Backend Architecture
- **Express 5**: REST API server with JSON body parsing
- **TypeScript**: Full-stack TypeScript with shared types between client and server
- **API Design**: Route definitions in `shared/routes.ts` with Zod schemas for validation
- **Storage Pattern**: `IStorage` interface in `server/storage.ts` abstracts database operations

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM
- **Schema**: Defined in `shared/schema.ts`, includes a `scores` table with username, score, and timestamp
- **Migrations**: Drizzle Kit for schema management (`db:push` command)
- **Validation**: `drizzle-zod` generates Zod schemas from database tables

### Build System
- **Development**: Vite dev server with HMR proxied through Express
- **Production**: Vite builds to `dist/public`, esbuild bundles server to `dist/index.cjs`
- **Scripts**: `dev` for development, `build` for production, `db:push` for database migrations

## External Dependencies

### Database
- PostgreSQL via `pg` driver with connection pooling
- `DATABASE_URL` environment variable required

### UI/Component Libraries
- Shadcn/ui with Radix UI primitives (dialog, dropdown, toast, etc.)
- Tailwind CSS with custom color scheme using CSS variables
- Lucide React for icons

### Game Assets
- Phaser 3 loaded from CDN
- Tiny Swords asset pack in `client/public/assets/tinyswords/`
- **Image Size Limit**: Background images must be kept under ~1920x1080 or ~2.5MB to avoid WebGL rendering artifacts (green diagonal lines). Use imagemagick to resize: `convert image.png -resize 1920x1080 image_small.png`

### State Management
- TanStack React Query for server state
- React Hook Form with Zod resolver for form handling