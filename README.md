# DK-Future website

Source for the website of **DK-Future** — *Probabilistic Geospatial Machine Learning
for Predicting Future Danish Land Use under Compound Climate Impact* (Villum Synergy,
Aalborg University, 2026–2028).

It is a plain static site: no build step, no framework. Just open `index.html`.

## Structure

```
index.html          The whole page (project · research · team · contact)
assets/
  style.css         All styling (colors are CSS variables at the top)
  main.js           Reveal animations + renders the team grid
  people.js         ← edit this to add/update team members
  favicon.svg       Site icon
CNAME               Custom domain (dkfuture.dk) for GitHub Pages
```

## How to update

- **Team members** — edit `assets/people.js`. Each person is one object; copy an
  existing one. Photos are optional (drop a file in `assets/img/` and set `photo`);
  without one, initials are shown.
- **Text / sections** — edit `index.html` directly.
- **Colors / fonts** — edit the variables in the `:root` block at the top of
  `assets/style.css`.

## Local preview

No tooling needed — double-click `index.html`, or serve it:

```sh
python3 -m http.server 8000   # then open http://localhost:8000
```

## Deploying (GitHub Pages)

1. Push this repo to GitHub.
2. Settings → Pages → Build from branch → `main` / root.
3. The `CNAME` file points the site at **dkfuture.dk**. In your domain registrar,
   add a `CNAME`/`ALIAS` record (or the four `A` records GitHub lists) pointing at
   GitHub Pages, then tick "Enforce HTTPS".

## Coming later

Publications and Events/Workshops pages. The header in `index.html` already has the
nav links commented out — uncomment them and add `publications.html` / `events.html`
when ready.
