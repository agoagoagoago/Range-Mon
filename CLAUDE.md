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
- Settlement history table (last 4 contracts)
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

### 2026-02-19
- **Added Exit Admin button**: Users can now exit admin mode back to the public dashboard. Added `.exit-admin-btn` CSS class, `deactivateAdmin()` function, and modified `activateAdmin()` to insert the exit button in the header next to the admin badge.
