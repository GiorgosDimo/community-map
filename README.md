# Community Map

**[Live Demo →](https://community-map-woad.vercel.app/)**

A collaborative web app for pinning interesting spots and drawing routes near your workplace, home, school, or university — so colleagues and neighbours can discover and enjoy them together.

## Features

- **Welcome flow** — choose your location type (Home, Work, School, University) and pin it on the map
- **Dynamic bounding box** — a bbox is drawn around your starting location; spots stay within that area
- **Spot markers** — drop, view, edit, and delete named places with descriptions
- **Routes** — draw walking or cycling routes using Valhalla-powered routing, with live distance and duration
- **Route click buffer** — wide invisible hit area makes selecting a route easy on touch screens
- **Persistent accounts** — pick a username once; your spots, routes, and home location follow you across devices
- **Multi-device** — link a second browser or device to your username without re-creating anything
- **Mobile-responsive** — works on phones and tablets

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org/) (App Router, `"use client"`) |
| UI components | [MUI v5](https://mui.com/) (Material UI) |
| Styling | MUI Emotion engine |
| Map | [Leaflet](https://leafletjs.com/) via [React-Leaflet v5](https://react-leaflet.js.org/) |
| Routing API | [Valhalla](https://valhalla.github.io/valhalla/) (valhalla1.openstreetmap.de) |
| Backend | [Supabase](https://supabase.com/) (PostgreSQL) via Next.js API routes |
| State & data | [TanStack Query v5](https://tanstack.com/query) |
| Language | TypeScript |
| Testing | [Vitest](https://vitest.dev/) |

## Getting Started

### Prerequisites

Create a [Supabase](https://supabase.com/) project and run [`schema.sql`](schema.sql) in the SQL editor. Then create a `.env.local` file:

```bash
SUPABASE_URL=https://<your-project>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

> The service role key is server-only — it is never sent to the browser.

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Deploying to Vercel

Add `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` as environment variables in your Vercel project settings, then redeploy.

## How It Works

1. On first visit you pick a username. It identifies you as the author of everything you create and is stored in the database.
2. On a new device, enter the same username — the app asks if you are connecting from a different device and links the new session. Your home location and all your data are restored automatically.
3. Pick a location type and click the map to pin your starting point. A bounding box is drawn around it.
4. Use the hamburger menu to toggle the Spots/Routes layers and switch into add mode.
5. In **Add spot** mode, click inside the bounding box to drop a pin and fill in a name and description.
6. In **Add route** mode, choose walking or cycling, click waypoints on the map (or on existing spots), then save with a name.
7. Spots and routes are visible to everyone; only you can edit or delete your own.

## Backend API

Built with Next.js Route Handlers and Supabase PostgreSQL. All text inputs are sanitised server-side before being written to the database.

| Endpoint | Description |
|---|---|
| `POST /api/auth/check-session` | Recognise a returning browser by its session token |
| `POST /api/auth/register` | Create a new account and link the session token |
| `POST /api/auth/add-session` | Link a new device to an existing username |
| `POST /api/auth/home` | Save home location to the account |
| `DELETE /api/auth/home` | Remove home location from the account |
| `GET /api/spots` | List all spots (public) |
| `POST /api/spots` | Create a spot (auth required) |
| `PUT /api/spots/:id` | Update a spot (owner only) |
| `DELETE /api/spots/:id` | Delete a spot (owner only) |
| `GET /api/routes` | List all routes (public) |
| `POST /api/routes` | Create a route (auth required) |
| `PUT /api/routes/:id` | Update a route (owner only) |
| `DELETE /api/routes/:id` | Delete a route (owner only) |
