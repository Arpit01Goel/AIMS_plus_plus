# AIMS++ Next.js Boilerplate

This repository contains a ready-to-extend Next.js 16 project configured with the App Router, TypeScript, Tailwind CSS v4, ESLint, and the default import alias `@/*`.

## Prerequisites
- Node.js 18.18 or newer (Next.js requirement)
- npm 10 or newer (bundled with modern Node.js releases)

## Getting Started
1. Install dependencies: `npm install`
2. Launch the dev server: `npm run dev`
3. Visit http://localhost:3000 to inspect the starter page

## Available Scripts
- `npm run dev` – start the Next.js dev server with Turbopack
- `npm run lint` – run ESLint across the project
- `npm run build` – create an optimized production build
- `npm run start` – serve the production build locally

## Tech Stack
- Next.js 16 App Router + TypeScript
- React 19 with the default Server Components setup
- Tailwind CSS v4 with the new `@tailwindcss/postcss` pipeline
- ESLint 9 + `eslint-config-next` for zero-config linting

## Project Structure Highlights
- `src/app/layout.tsx` – global metadata, font loading, and shared layout shell
- `src/app/page.tsx` – default landing page with hero/content sections
- `src/app/globals.css` – Tailwind layer declarations and base styles
- `tailwind.config.ts` – shared design tokens and content paths
- `tsconfig.json` – path alias `@/*` for cleaner imports

## Next Steps
1. Replace the placeholder copy and sections in `src/app/page.tsx`
2. Add API routes under `src/app/api` if server-side endpoints are needed
3. Integrate CI to run `npm run lint` and `npm run build` before deployment
