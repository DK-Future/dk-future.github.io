# DK-Future website

Source for the website of **DK-Future** — *Probabilistic Geospatial Machine Learning
for Predicting Future Danish Land Use under Compound Climate Impact* (Villum Synergy,
Aalborg University, 2026–2028).

It is a plain static site: no build step, no framework. Just open `index.html`.

## Structure

```
index.html            Front page (project · research · team · events · contact)
workshop-2026-08.html Workshop page (programme · registration · venue · organisers)
assets/
  style.css         All styling (colors are CSS variables at the top)
  main.js           Reveal animations + renders the people grids
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

## Workshop pages

One page per workshop, named `workshop-<year>-<month>.html` so future events don't
collide — `workshop-2026-08.html` is the page behind the event card on the front
page. Everything that needs filling in is marked with a comment in the file:

- **Programme** — each row is one `<li class="agenda-item">`; add `is-break` for
  meals/coffee, `is-highlight` to tint an anchor session.
- **Speakers** — a separate Speakers section exists but is commented out, since
  the programme already names every confirmed speaker. To bring it back,
  uncomment the block and renumber the sections after it.
- **Registration** — either paste the Microsoft Forms share link into the
  "Open the registration form" button, or paste the form's embed `<iframe>`
  (Forms → Collect responses → Embed) in place of the `.form-placeholder` block
  and give it `class="ms-form"`. Until then, the email fallback handles sign-ups.
- **Organisers** — the grid's `data-people` attribute lists which people from
  `people.js` to show, in order.

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
