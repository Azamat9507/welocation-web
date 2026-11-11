# welocation-web

Web client for WeLocation (위로케이션), a guide to cafés, beaches, lakes, rivers and viewpoints in Korea.
Data comes from the `welocation-api` Spring Boot service, which syncs places from the Korea Tourism
Organization TourAPI.

## Run

```bash
cp .env.example .env.local   # API_ORIGIN, defaults to http://localhost:8080
npm install
npm run dev                  # http://localhost:3000
```

The API must be running. Pages fetch on the server; only the Next server talks to `API_ORIGIN`, so the
browser only talks to this origin.

## Pages

- `/` spot list with category, region and tag filters kept in the URL, 20 per page
- `/spots/[id]` spot detail: photo, address, tags, rating and reviews
- `/ranking` this week's top 10 spots by likes given since Monday 00:00 KST (`GET /api/spots/ranking/weekly`),
  fetched on every request so a new like shows up on the next load
- `/nearby` spots near the browser's location, nearest first, with 1/3/10/30 km radius and category chips
  (`GET /api/spots/nearby`); coordinates are rounded to 3 decimals in the URL and never stored
- `/guide` AI guide (login required): a question goes to `POST /api/guide` through a Server Action; the answer is shown as plain text with the picked spots linked to `/spots/[id]`

Photos are 한국관광공사 공공누리 images, shown unaltered with the source credited.

Next.js 16 (App Router, Cache Components), TypeScript, Tailwind CSS 4.
