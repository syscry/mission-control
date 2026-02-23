# OpenClaw Mission Control

A custom dashboard for tracking and managing OpenClaw operations with real-time collaboration features.

**Live Demo:** https://syscry.github.io/mission-control

## Features

- **Tasks Board** — Kanban board for task management between you and OpenClaw
- **Content Pipeline** — Track content creation from idea to filming
- **Calendar** — View scheduled tasks and cron jobs
- **Memory** — Browse and search through all memories
- **Team** — Organization chart with agent roles and responsibilities
- **Office** — Visual floorplan showing agent activity

## Tech Stack

- Next.js 14 (App Router)
- Convex (real-time database)
- Tailwind CSS
- shadcn/ui components

## Local Development

```bash
npm install
npx convex dev      # Start Convex backend
npm run dev         # Start Next.js dev server
```

Visit http://localhost:3000

## GitHub Pages vs Full Deployment

This repository is configured for **GitHub Pages** (static export) which shows a demo/landing view.

For full functionality with real-time features:
- Deploy to **Vercel** (recommended) — automatic Convex integration
- Or run locally with `npx convex dev`

## Deployment

### GitHub Pages (Static Demo)
Pushes to `master` branch automatically deploy via GitHub Actions.

### Vercel (Full Features)
```bash
vercel --prod
```

## License

MIT
