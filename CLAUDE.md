# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

**Development:**
- `npm run dev` - Start development server with Turbopack (runs on http://localhost:3000)
- `npm run build` - Build the application for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint to check code quality

## Project Architecture

This is a Next.js 15 application using the App Router architecture with the following structure:

**Core Structure:**
- `app/` - App Router directory containing pages and layouts
- `app/layout.js` - Root layout with Geist font configuration and global styling
- `app/page.js` - Home page component
- `app/globals.css` - Global styles with Tailwind CSS v4 and CSS custom properties

**Styling:**
- Uses Tailwind CSS v4 with PostCSS integration
- CSS custom properties for theming (light/dark mode support)
- Geist Sans and Geist Mono fonts from Google Fonts

**Configuration:**
- Next.js config is minimal (default configuration)
- ESLint extends `next/core-web-vitals`
- Path aliases: `@/*` maps to project root
- PostCSS configured with `@tailwindcss/postcss` plugin

**Key Features:**
- Automatic font optimization with `next/font/google`
- Built-in dark mode support via CSS custom properties
- Image optimization with `next/image`
- Responsive design with Tailwind CSS utilities

The project follows Next.js App Router conventions with React Server Components by default.