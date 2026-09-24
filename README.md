# ترب خانه · Torob for Homes (demo)

A demo for Torob's **AI Product Engineer** challenge ("build Torob for X"), where X = **apartments in Tehran**.
Real listings are crawled once, then normalized, deduplicated and enriched into JSON. The app is **frontend-only** (Next.js static export).

> Unofficial demo. Not affiliated with Torob or Divar. Listing ownership and photos belong to the source; no contact data is stored.

## What it does
- **Natural-language search** in Persian. For example «دوخوابه نزدیک مترو با ۲ میلیارد رهن و ۲۰ میلیون اجاره، پارکینگ داشته باشه» ("two-bedroom near the metro with a 2 billion deposit and 20 million rent, must have parking") becomes editable intent chips. Removing a chip removes that phrase from the query, and anything the parser didn't understand is shown honestly.
- **One home, many listings.** Duplicate ads, whether reposted by several agents or bumped repeatedly, are merged into one *home*, and the cheapest ad is highlighted (like Torob's seller list).
- **Equivalent rent.** Deposit (رهن) + rent are converted into one comparable monthly number (3%/month market rate), with a live converter slider on each home.
- **Deal signal.** Price per m² is compared against the neighborhood median, with a histogram on each home. Prices that are "too good to be true" (>35% below the median) are flagged, not rewarded.
- **Transparent ranking.** Six weighted factors: budget, deal, metro, features, freshness and trust. Every card says *why* it ranks where it does, and a sheet shows the weights.
- Map with price pins, filters as URL state (every search is shareable), compare up to 4 homes (shareable link), saved homes, "where can I afford?" neighborhood explorer, light/dark mode, RTL, and a mobile-first layout.

## Numbers (crawled 2026‑09‑23 / ۱ مهر ۱۴۰۵)
739 listings → 718 parsed (15 roommate/dorm ads and 6 without an area skipped) → **698 homes** (451 rent, 247 buy) in 20 neighborhoods · 141 metro stations (Wikidata) ·
**33% of ads say their photos are not of this property** · 53% agency ads · 50% bumped ads · 39 duplicate ads merged into 19 homes.

## Run
```bash
cd web
npm install
npm run dev                      # http://localhost:3000
npm run build                    # static export → web/out (729 pages)
node scripts/serve-static.mjs    # serve web/out on :4311
npx tsx scripts/intent.test.ts   # 20 parser cases
```

## Data pipeline (`scripts/crawl`, run locally, never in the browser)
```bash
node crawl.mjs        # polite crawl (1 req / 2s) of robots-allowed Divar API paths → .cache/
node build-data.mjs   # normalize → dedupe → enrich → web/src/data/*.json + web/public/data/homes-index.json
```
- **Normalize:** Persian digits, «دو» → 2, «‏۱٬۲۰۰٬۰۰۰٬۰۰۰ تومان» → number, «رایگان» → 0, «۳ از ۵» → floor 3/5, Jalali dates, feature extraction; phones, handles and signature lines are removed.
- **Dedupe:** same neighborhood, area ±2m², same rooms and floor, plus shared photo, text similarity >0.55, or close price + build year → union-find.
- **Enrich:** equivalent rent, neighborhood medians, nearest metro (haversine), trust flags, and a rule-based summary with pros and cons.

## Structure
```
docs/01-research-and-plan.md     user research, product strategy, phased plan
docs/02-demo-report.md           what was built, test report, demo video script
scripts/crawl/                   crawl + build-data pipeline
web/src/app/                     routes: / · /search · /home/[id] · /areas · /areas/[slug] · /compare · /saved · /about
web/src/features/                search (intent parser) · results (ranking, cards, map) · home · areas · compare
web/src/shared/                  UI kit, tokens, formatting, mock API layer, stores
```

## Stack
Next.js 15 (App Router, SSG / static export) · React 19 · TypeScript strict · Tailwind CSS 4 · Radix · CVA · Framer Motion ·
TanStack Query (mock API layer with realistic latency) · Zustand (persisted shortlist) · nuqs (URL state) · Leaflet + OpenStreetMap · Vazirmatn.
