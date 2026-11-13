# Connect Forger

A fan-made four-in-a-row game: **Anya vs Loid**, styled like a classified spy dossier.
Static site with no backend, hosted on GitHub Pages.

## Play modes
- **Vs computer**: pick your agent (Anya or Loid) and the difficulty: Easy, Medium or Hard.
- **2 players, 1 device**: take turns on the same screen.

Controls: tap or click a column, or use `←` `→` with `Enter`. Keys `1`–`7` drop a piece straight into that column. `Esc` returns to the briefing.

## Tech
| | |
|---|---|
| Build | Vite + TypeScript, no framework |
| Rules | `src/game.ts`: pure functions, shared by the UI and the AI |
| AI | `src/ai.ts`: negamax with alpha-beta pruning, run in a Web Worker (`src/ai.worker.ts`). Hard mode uses iterative deepening with a time budget of about 0.9 s |
| UI | `src/main.ts` + `src/styles.css`: DOM, CSS grid and the Web Animations API |
| Sound | `src/audio.ts`: sound effects synthesized with Web Audio, no audio files |
| Tests | Vitest (`tests/`) |
| Deploy | GitHub Actions → GitHub Pages (`.github/workflows/deploy.yml`) |

## Develop
```bash
npm install
npm run dev        # http://localhost:5173
npm test
npm run build      # outputs dist/
```

### Sprites
The original images are in `art/source/`. `npm run sprites` regenerates the game-ready files in
`src/assets/sprites/`:
- Loid is cut out of his white background at native pixel resolution.
- The front-facing walk row of Anya's sheet is used for her animation.
- A head crop of each character is made for the game pieces.

## Deploy to GitHub Pages
1. Create a GitHub repo (for example `connect-forger`) and push this folder to `main`.
2. In the repo, open **Settings → Pages → Build and deployment → Source** and choose **GitHub Actions**.
3. Every push to `main` runs the tests, builds the site and publishes it at
   `https://<your-username>.github.io/connect-forger/`.

## Roadmap
- v2: online play through peer-to-peer room links (PeerJS / WebRTC). The rules module is already move-based, so moves can be sent over the network without changes.

## Credits
Fan-made and non-commercial. SPY×FAMILY © Tatsuya Endo / Shueisha.
Pixel sprites: Anya by **DarkusShadow** and Loid by **Hokky1** (DeviantArt). Please credit the artists, and get
their permission before publishing.
