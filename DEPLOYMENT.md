# Deployment

## Current setup

- **Repo:** `git@github.com:Fahad-Md-Kamal/fahad-md-kamal.github.io.git`
- **Source branch:** `main`
- **Vite base path:** `/` (set in `vite.config.ts`; this is a user site served from the domain root)
- **GitHub Pages source:** Settings → Pages → "Deploy from a branch" → `gh-pages` / `/ (root)`
- **Live URL:** https://fahad-md-kamal.github.io/

`.github/workflows/deploy.yml` runs on pushes to `main`, but Pages is set to deploy from the `gh-pages` branch, so the only thing that publishes the site is `npm run deploy`.

## Routine deploy

```bash
npm run build                     # compile check
git add <files> && git commit -m "Describe the change"
git push origin main              # saves source; does not publish
npm run deploy                    # builds dist/ and publishes it to gh-pages
```

The site updates within a minute or two. Hard-refresh (Ctrl+Shift+R) if you still see an old version.

## Common edits

- **Projects:** edit `src/data/projects.json`; put images in `public/images/projects/`.
- **Profile, experience, skills, education:** edit the matching file in `src/data/`.
- **New section:** add a component in `src/components/`, wire it into `src/App.tsx`, and add it to `navLinks` in `src/components/Header.tsx` if it needs a nav link.

## Troubleshooting

- **Blank page, `/src/main.tsx` in the page source:** Pages is serving the `main` branch instead of `gh-pages`. Fix the Pages source.
- **404s on `/assets/...`:** `base` in `vite.config.ts` must be `'/'`.
- **Pushed but the site didn't change:** pushing source doesn't publish; run `npm run deploy`.
- **Images not loading:** files must live under `public/images/...`.
