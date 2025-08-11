# AlcoolTest PWA (Next.js App Router)

Progetto completo pronto all'uso:
1. `npm install`
2. `npm run dev` → http://localhost:3000

## Cosa include
- `/app/layout.tsx` con `manifest`, `themeColor` e registrazione SW
- `/app/pwa-register.tsx` per registrare `public/sw.js`
- Pagina `/offline` per fallback
- `manifest.json` e icone base
- Service worker con:
  - network-first per navigazioni (fallback `/offline`)
  - cache-first per asset statici

## Build produzione
```
npm run build
npm start
```

## Aggiornare cache
Bump di `CACHE_NAME` in `public/sw.js`.

## Note
- Funziona su `localhost` senza HTTPS.
- Per cambiare brand/icone, sostituisci i PNG in `public/icons` e aggiorna `manifest.json`.
