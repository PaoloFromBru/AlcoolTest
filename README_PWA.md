# Next.js PWA Starter (App Router)

Minimal files to turn your Next.js (13+ / 15.x) app into a PWA.

## What you get
- `manifest.json` wired via App Router metadata
- Service Worker (`public/sw.js`) with:
  - Network-first for navigations (fallback `/offline`)
  - Cache-first for static assets
- Offline page at `/offline`
- Client component to register SW

## Install
Copy these files into your project, keeping paths:
- `/app/layout.tsx`
- `/app/pwa-register.tsx`
- `/app/offline/page.tsx`
- `/public/manifest.json`
- `/public/sw.js`
- `/public/icons/icon-192.png`
- `/public/icons/icon-512.png`
- `/public/apple-touch-icon.png`

If you use Tailwind, ensure `app/globals.css` exists (or adjust imports).

## Notes
- Service worker is served from `/public/sw.js` and registered client-side.
- On Android/Chrome, you'll see the "Install app" prompt automatically after engagement.
- On iOS Safari, use "Aggiungi a Home" to install.
- To update the SW, bump the `CACHE_NAME` version.
