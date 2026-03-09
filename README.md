# Kazicloud

Professional job platform built with a production-grade monorepo architecture.

## Architecture

- **Monorepo**: Turborepo with pnpm workspaces
- **Frontend**: Next.js 16 (App Router, TypeScript, strict mode)
- **Backend**: Convex (shared across all apps)
- **Design System**: Minimal, professional, trust-focused

## Structure

```
kazicloudplatform/
├── apps/
│   ├── web/          # Public job platform (port 3000)
│   └── admin/        # Admin dashboard (port 3001)
├── convex/           # Shared backend (Convex)
│   ├── schema.ts
│   ├── jobs.ts
│   ├── applications.ts
│   └── users.ts
└── packages/@repo/
    ├── ui/           # Shared UI components
    ├── types/        # Shared TypeScript types
    ├── lib/          # Shared utilities
    └── config/       # Shared configs (ESLint, TypeScript)
```

## Getting Started

### Prerequisites

- Node.js >= 18
- pnpm >= 9

### Installation

```bash
pnpm install
```

### Development

Run all apps:
```bash
pnpm dev
```

Run Convex backend:
```bash
pnpm dev:backend
```

Run specific app:
```bash
cd apps/web && pnpm dev
cd apps/admin && pnpm dev
```

### Build

```bash
pnpm build
```

### Lint & Type Check

```bash
pnpm lint
pnpm type-check
```

## Design System

### Color Palette

- **Brand Orange**: `#DC842C` (accent only - CTAs, highlights)
- **Brand Dark**: `#77838F` (secondary brand)
- **Neutral Background**: `#FFFFFF`
- **Neutral Secondary**: `#F7F9FC`
- **Text Primary**: `#0F172A`
- **Text Secondary**: `#475569`
- **Text Muted**: `#94A3B8`
- **Borders**: `#E2E8F0`

### Design Principles

- Calm, professional, neutral-first
- Strong typography hierarchy
- Content-first layouts
- No gradients, glassmorphism, or excessive shadows
- Trust and clarity over visual flair

## Tech Stack

- **Framework**: Next.js 16
- **Language**: TypeScript (strict mode)
- **Backend**: Convex
- **Styling**: Tailwind CSS
- **Monorepo**: Turborepo
- **Package Manager**: pnpm

## Apps

### Web (`apps/web`)
Public-facing platform for job seekers and employers.
- Job listings and search
- Job applications
- User dashboards

### Admin (`apps/admin`)
Internal dashboard for admins and recruiters.
- Job moderation
- Application review
- User management
- Analytics

## Shared Packages

### `@repo/ui`
Reusable UI components with minimal styling.

### `@repo/types`
Shared TypeScript types and interfaces.

### `@repo/lib`
Shared utilities and helper functions.

### `@repo/config`
Shared ESLint, Prettier, and TypeScript configurations.

## Environment Variables

Create `.env.local` files in each app:

**apps/web/.env.local**
```
NEXT_PUBLIC_CONVEX_URL=your_convex_url
```

**apps/admin/.env.local**
```
NEXT_PUBLIC_CONVEX_URL=your_convex_url
```

## Convex Setup

1. Install Convex CLI: `npx convex dev`
2. Follow the prompts to create a project
3. Copy the deployment URL to your `.env.local` files

## Quality Standards

- TypeScript strict mode enabled
- ESLint with zero warnings
- Prettier for consistent formatting
- Type-safe Convex queries and mutations
- Role-based access control at backend level
- Clear separation of concerns

## Future Roadmap

- Authentication & authorization
- Advanced search & filtering
- ATS integration
- AI-powered matching
- Analytics dashboard
- Email notifications
- File uploads (resumes, documents)
