# Range-Mon Project

## Overview
Emini S&P 500 (ES) Range Monitoring Dashboard — a single-file HTML application for futures traders. Located in `es_pivot_dashboard.html` (~2900+ lines).

## Tech Stack
- Single self-contained HTML file (no build tools, no frameworks)
- Vanilla JavaScript, CSS custom properties, HTML5 Canvas for charts
- Data stored in browser localStorage
- Google Fonts: JetBrains Mono, Instrument Sans

## Key Features
- CME market hours clock with holiday schedule
- Settlement data input (paste from CME website or upload CSV)
- Pivot point calculations
- Range comparison charts (canvas-based)
- Rolling 20-day average range tracking
- Range distribution histogram
- Settlement history table with contract month dropdown
- Admin mode (activated via `?admin` URL param or `Ctrl+Shift+A`)

## Architecture
- All CSS is in a `<style>` block in `<head>`
- All HTML is in `<body>`
- All JS is in a single `<script>` block at the end of `<body>`
- Logo is embedded as base64 data URI

## Admin Mode
- Activated via `?admin` query param or `Ctrl+Shift+A`
- Shows tab bar with "Data Input" and "Dashboard" tabs
- Admin badge and "Exit Admin" button appear in the header row
- `activateAdmin()` adds UI elements, `deactivateAdmin()` removes them and returns to public dashboard
- Exit Admin button is styled as a red pill button (`.exit-admin-btn`) in the header next to the admin badge

## Change Log

### 2026-02-24
- **Added Weekly ES Price chart**: Canvas line chart above Market News showing ~10 weekly ES closing prices from Yahoo Finance API (via `yahoo-proxy` worker, `interval=1wk&range=3mo`). Aligns x-axis dates with COT report dates from `sessionStorage`. Green/red line segments for up/down weeks, price labels on dots. Uses sessionStorage cache with 30-min TTL and stale-cache fallback.

### 2026-02-23
- **Added 10-week COT net position change**: COT Report now fetches 11 weeks (`$limit=11`) to compute 10 week-over-week net position deltas. Scrollable table shows all 10 weeks with green/red coloring. Canvas line chart below plots the trends for Dealer (blue), Asset Manager (amber), and Leveraged Funds (purple) with zero line, grid, and legend.

### 2026-02-22
- **Added Market News feed**: Finnhub-powered news card showing top 10 general market headlines with clickable links, source attribution, and relative timestamps. Server-side `GET /api/news` endpoint proxies Finnhub API (key stored as env var). Client uses sessionStorage cache with 1-hour TTL and stale-cache fallback, following the same IIFE pattern as COT Report.

### 2026-02-21
- **Secured GitHub PAT with server-side proxy**: Created `api/` Express service on Render that proxies GitHub commits. Browser no longer touches the PAT — sends a deploy password to `POST /api/deploy` instead. Added `POST /api/verify` endpoint for password validation.
- **Password-protected admin mode**: `activateAdmin()` now verifies deploy password server-side via `/api/verify` before granting access.
- **Password-protected Export CSV**: `downloadCSV()` requires deploy password verified server-side on every click. No sessionStorage caching for any passwords.
- **Prevented future date selection**: Trading Date input `max` attribute set to today's date on init.
- **Removed paste instructions**: Removed "Paste Settlement Row" heading and CME instructions from Data Input section.
- **Economic calendar shows next 7 days only**: Filters out past days, shows events from today through 7 days ahead.

### 2026-02-20
- **Added Feedback form**: Public feedback section (Name, Email, Comments) using Formspree for email delivery. AJAX submit with success message, matching card styling, responsive at 600px.
- **Made Settlement History table responsive**: Added `.history-table-wrap` scroll wrapper. At 768px, reduced cell padding/font-size. At 600px, hides Open/Last/Volume columns, compacts section padding and dropdown styling.
- **Added contract month dropdown to Settlement History**: Replaced fixed "last 4 contracts" view with a `<select>` dropdown listing all contracts (newest first) plus "All Contracts". Defaults to latest contract. Extracted `renderHistory()` as standalone function called on dropdown change.

### 2026-02-19
- **Added Exit Admin button**: Users can now exit admin mode back to the public dashboard. Added `.exit-admin-btn` CSS class, `deactivateAdmin()` function, and modified `activateAdmin()` to insert the exit button in the header next to the admin badge.
- **Added Economic Calendar card**: Live high-impact USD events from Fair Economy API. Shows events grouped by day (CT), with past events dimmed. Uses sessionStorage caching (30-min TTL) with stale-cache fallback on network failure. Independent lifecycle from main dashboard rendering.
