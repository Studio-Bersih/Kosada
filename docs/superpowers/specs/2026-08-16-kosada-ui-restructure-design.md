# Kosada UI Restructure — Design

**Date:** 2026-08-16 · **Status:** Awaiting review
**Scope:** `Kosada/` frontend only. No backend or database changes.
**Related:** [CHANGELOG.md](../../../../CHANGELOG.md) · [Kosada-Update-Notes.md](../../../../Kosada-Update-Notes.md) §6

---

## 1. Context

Features F1–F8 and the performance work are done. What remains is the presentation layer, which
the client deliberately sequenced last: *"redesign the system without changing the logic — just the
layout, color, asset… adding better UI… a dark and light mode switch with an earthy tone like
Claude that is very pleasant to look at."*

**The business logic does not change.** No endpoint, query, calculation or data shape is touched.
If a page computes a total today, it computes the same total afterwards.

Two problems make this more than a re-skin:

1. **There is no shared layout.** `+layout.svelte` only imports the stylesheet; each of the 9 app
   pages imports `<Header/>` itself. A sidebar has no single place to live.
2. **The toolchain is two years old** and the client chose to modernise it as part of this work —
   which turns out to be a four-package migration with one hard blocker.

---

## 2. Current state

| | |
|---|---|
| Routes | 15 — 1 login, **9 app pages**, **5 print pages** |
| Shell | None. `<Header/>` imported per-page; `+layout.svelte` imports CSS only |
| Theme | No daisyUI theme config at all; defaults to the stock `light` |
| Fonts | None — browser default sans |
| Buttons | Ad-hoc: ghost ×10, accent ×9, primary ×8, neutral ×6, secondary ×3, plus one-off `success`/`error`/`info`. No consistent meaning |
| Stack | Svelte 4.0 · SvelteKit 1.20 · Tailwind 3.3 · daisyUI 3.7 · Vite 4.4 · adapter-vercel 3.0 |
| Tests | None |

Assets: `logo.png` (229 KB), `loginScreen.jpg` (911 KB), `favicon.png`.

---

## 3. Approach

Three phases. **Each ends at a verifiable checkpoint**, so a failure is always attributable to one
kind of change.

```
Phase 0  Smoke tests          → known-good baseline of today's behaviour
Phase A  Toolchain upgrade    → same app, same look, new stack
Phase B  Redesign             → new look, no logic change
```

The alternative — migrating and restyling each page in one pass — was rejected. With both changing
at once, a broken page could be either the framework or the CSS, and there is no working state to
return to.

---

## 4. Phase 0 — Smoke tests

A framework migration across 15 routes with no test suite is not something `svelte-check` can
protect. Playwright (Chromium only) gives a real regression net.

**Coverage:** every one of the 15 routes renders and shows its key elements; the Dashboard filter
submits and paginates; the detail modal opens; `/member` searches; a print route renders its table;
the login form submits.

These tests are written and made green **against the current app**, before any dependency moves.
That is the point — they encode today's behaviour so Phase A can be checked against it.

**Constraint:** the tests must not depend on the live API. They run against the local Laravel; where
data is sparse, they assert on structure (the table exists, the pagination bar reports a count)
rather than specific rows.

---

## 5. Phase A — Toolchain upgrade

**The look does not change in this phase.** Any visual difference is a bug to fix, not progress.

| Package | From | To |
|---|---|---|
| svelte | 4.0 | 5.x |
| @sveltejs/kit | 1.20 | 2.x |
| @sveltejs/adapter-vercel | 3.0 | 6.x |
| tailwindcss | 3.3 | 4.x |
| daisyui | 3.7 | 5.x |
| vite | 4.4 | latest compatible |
| svelte-french-toast | 1.2 | **removed** → `svelte-sonner` |

Node 24.1.0 is installed, satisfying every requirement.

### 5.1 The toast blocker

`svelte-french-toast@1.2.0` declares `peerDependencies: { svelte: "^3.57.0 || ^4.0.0" }`. There is
no Svelte 5 release — only `2.0.0-alpha.0`. It is used in **10 files across 49 call sites** and is
how every page reports success and failure.

**Decision: replace with `svelte-sonner` behind a thin wrapper.**

A new `$lib/toast.ts` exposes `toast.success()`, `toast.error()` and `toast.promise()` with the same
signatures the 49 call sites already use. Only that one file knows which library is underneath, so
the call sites change by their import line alone — and a future swap costs one file, not 49.

The `2.0.0-alpha.0` route was rejected: an alpha dependency in a live lending system, for a
cosmetic benefit.

### 5.2 Migration notes

- **Svelte 5 legacy mode.** `export let`, `$:` and `on:click` all still compile. Existing pages are
  left as they are; only new components (sidebar, theme store, toast wrapper) use runes. A full
  runes rewrite would touch every line of every page on top of an already-large change, with no
  tests written yet to catch the fallout.
- **SvelteKit 2** changes `throw redirect(...)` to `redirect(...)` and reworks the cookies API.
  Kosada's loaders do neither — they only `fetch` and return — so exposure is low, but every
  `+page.server.ts` gets checked.
- **Tailwind 4** replaces `tailwind.config.js` with CSS-first configuration. `content` scanning is
  automatic. The config file is deleted and its contents move into `app.css`.
- **daisyUI 5** is configured via `@plugin "daisyui"` in CSS, and themes via
  `@plugin "daisyui/theme"`. This is where the custom themes land in Phase B.

### 5.3 Checkpoint

Phase A is done when: `npm run build` succeeds, `svelte-check` is clean, **all Phase 0 smoke tests
pass unchanged**, and the app looks the same as before.

---

## 6. Phase B — Redesign

### 6.1 App shell

Move the 9 app pages into a `(app)` route group with one layout. **URLs do not change.**

```
src/routes/
  +page.svelte                    login — no shell
  (app)/
    +layout.svelte                the sidebar, defined once
    dashboard/+page.svelte
    member/+page.svelte
    report/+page.svelte
    report/print/+page@.svelte    @ escapes the shell
    …
```

Print routes use SvelteKit's `+page@.svelte` naming to reset to the root layout, so a printed sheet
never carries the sidebar. This is why route groups were chosen over per-page imports: the shell is
defined once and opting out is explicit rather than remembered.

### 6.2 Theme

Two custom daisyUI themes, `kosada-light` and `kosada-dark`, toggled by `data-theme` on `<html>`.

| Token | Light | Dark |
|---|---|---|
| background | `#FAF9F5` | `#262624` |
| surface | `#FFFFFF` | `#30302E` |
| text | `#1F1E1D` | `#F5F4EF` |
| muted text | `#6B6862` | `#A8A29A` |
| accent | `#C96442` | `#D97757` |
| border | `#E5E2D9` | `#45443F` |

Shared: success `#5A7D5A` · warning `#C08A2E` · error `#B54A3A`.

**Behaviour:** follow the OS on first visit (`prefers-color-scheme`); once the user toggles, persist
that choice in `localStorage` and honour it thereafter. The stored preference is applied in
`app.html` before first paint, so the page never flashes light before switching to dark.

### 6.3 Sidebar

Grouped by job, because it puts the daily-use pages at the top and scales past nine items:

```
Dashboard · Transfer Harian
DATA      — Anggota Koperasi · Tambah Anggota · Tambah Kredit
LAPORAN   — Laporan · Data Macet
LAIN      — Surat Tugas · Ganti Password
```

- **Expanded by default** (~240 px), collapsing to a **~64 px icon rail** — never fully hidden, so
  navigation stays one click away while the tables gain ~180 px. Collapsed state persists in
  `localStorage`; the rail shows tooltips on hover.
- Footer holds the account name, the light/dark toggle, and Keluar.
- On phones the sidebar becomes an overlay drawer.
- The active route is highlighted — the current navbar gives no indication of where you are.

### 6.4 Typography

**Plus Jakarta Sans**, self-hosted via `@fontsource` — no external request, nothing to break if a
CDN is unreachable. Two weights (400/600) at roughly 45 KB. Chosen for its tabular figures: currency
columns must align digit-for-digit, which the default Windows stack does not guarantee.

Print sheets inherit the font and spacing but **stay strictly black-on-white** so printing remains
ink-cheap.

### 6.5 Tables

Compact rows · sticky headers · zebra striping · right-aligned currency in tabular figures ·
horizontal scroll on overflow. These are the heart of the app and the densest surface in it.

### 6.6 Buttons

| Role | Class | Use |
|---|---|---|
| Primary | terracotta fill | The one main action per screen |
| Ghost | text only | Secondary actions, Batalkan |
| Error | red | Destructive only |

Today `Hapus` is `btn-secondary` — a destructive action in a non-destructive colour. Every button is
reclassified into one of these three.

### 6.7 Loading and empty states

- **Loading:** skeleton rows in the table's own shape, so the layout does not jump when data lands.
- **Empty:** a muted icon, a sentence naming the cause, and the relevant next step. Critically this
  distinguishes *"nothing here yet"* from *"your filter matched nothing"* — staff currently cannot
  tell those apart, and both read `Tidak ada data.`

### 6.8 Login

A centered card on a warm sand background with the logo above it. Drops `loginScreen.jpg`
(**911 KB**) and the green gradient, which clashes with the earthy palette everywhere else.

### 6.9 Icons

Inline SVG, no dependency. Roughly 15 are needed — the 9 nav items plus detail, print, delete, edit,
search and collapse — kept in `$lib/icons/` as small components so they stay consistent in size and
stroke weight.

### 6.10 Housekeeping

- `lang="en"` → `lang="id"` — the app is entirely Indonesian.
- Add `initial-scale=1` to the viewport meta; without it iOS Safari can render zoomed.
- Per-page titles. Every tab currently reads *"Kosada - Internal System"*, which is unusable with
  nine pages open.

---

## 7. What is explicitly NOT in scope

- Any backend, endpoint, query or schema change.
- Any change to a calculation, total, or business rule.
- A full Svelte 5 runes rewrite of existing pages.
- Authentication — still deferred, see `Kosada-Auth-Proposal.md`.
- Further pagination work — already done.

---

## 8. Verification

| Phase | Passes when |
|---|---|
| 0 | Smoke tests green against the **current** app |
| A | Build succeeds · `svelte-check` clean · **all Phase 0 tests still green** · look unchanged |
| B | Build succeeds · `svelte-check` clean · all smoke tests green · both themes checked at desktop, tablet and phone widths · print sheets still black-on-white A4 |

Every phase is committed separately so any of them can be reverted independently.

---

## 9. Risks

| Risk | Handling |
|---|---|
| A dependency has no Svelte 5 support | Already found one (`svelte-french-toast`) and replaced it. Others surface at install; the wrapper pattern keeps a swap cheap |
| Tailwind 4's CSS-first config breaks the build | Config is small (`content` + the daisyUI plugin). If it resists, the fallback is daisyUI 4 on Tailwind 3, which still supports custom themes |
| Svelte 5 legacy mode misbehaves on an existing page | Smoke tests catch it; the offending page moves to runes individually |
| Route-group move breaks a URL | Route groups do not affect URLs by design; smoke tests assert every one of the 15 |
| Staff cannot find things after the redesign | Sidebar keeps every existing label; grouping only reorders. Nothing is renamed or removed |
