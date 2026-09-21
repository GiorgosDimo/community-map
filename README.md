# Community Map

**Live demo:** https://community-rg2t90bi6-georgosdimopoulos-2195.vercel.app/

A collaborative web app for pinning interesting spots and drawing routes near your workplace, home, school, or university — so colleagues and neighbours can discover and enjoy them together.

## Features

- **Welcome flow** — choose your location type (Home, Work, School, University) and pin it on the map
- **Spot markers** — drop, view, edit, and delete named places with descriptions
- **Routes** — draw walking or cycling routes using Valhalla-powered routing, with live distance and duration
- **Route click buffer** — wide invisible hit area makes selecting a route easy on touch screens
- **Session-based ownership** — edit and delete only your own spots and routes
- **Mobile-responsive** — works on phones and tablets

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 15](https://nextjs.org/) (App Router, `"use client"`) |
| UI components | [MUI v5](https://mui.com/) (Material UI) |
| Styling | MUI Emotion engine |
| Map | [Leaflet](https://leafletjs.com/) via [React-Leaflet v5](https://react-leaflet.js.org/) |
| Routing API | [Valhalla](https://valhalla.github.io/valhalla/) (valhalla1.openstreetmap.de) |
| State & data | [TanStack Query v5](https://tanstack.com/query) + `localStorage` |
| Language | TypeScript |
| Testing | [Vitest](https://vitest.dev/) |

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## How It Works

1. On first visit a welcome screen explains the app, then you pick a location type and click the map to pin it.
2. Use the hamburger menu to toggle the Spots/Routes layers and switch into add mode.
3. In **Add spot** mode, click the map to drop a pin and fill in a name and description.
4. In **Add route** mode, choose walking or cycling, click waypoints on the map (or on existing spots), then save with a name.
5. All data is stored locally in `localStorage` — no backend required.
