# Torob Khaneh (ترب خانه)

Demo for Torob's AI Product Engineer challenge: Persian natural-language apartment search for Tehran.
**Status: submitted on 2026-09-24. Live at https://torob-khaneh.vercel.app. Keep every public link alive.**

Read first: `docs/04-status-and-handoff.md` (full state, links, decisions, working rules), then `README.md`.

- App: `web/` (Next.js 15 static export, React 19, Tailwind 4, framer-motion, Radix, nuqs, Leaflet). `npm run dev` / `npm run build`.
- Data: `scripts/crawl/` (crawl → build-data → `web/src/data`, `web/public/data`).
- Demo video tooling: `video/` (playwright-core + ffmpeg); narration in `voice/` (local only).
- Deploy: Vercel project, root dir `web`; every push to `main` goes to production.

Working rules with Kiana:
- Show UI changes first; commit/push only after she approves.
- Verify in the browser via the Claude in Chrome extension; avoid Playwright MCP where possible.
- On external forms, fill in but let her press the final submit.
- Motion stays subtle. Docs in Persian, code comments in English.
