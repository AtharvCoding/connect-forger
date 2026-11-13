import './styles.css';
import loidSprite from './assets/sprites/loid.png';
import type { Level } from './ai';
import type { AiRequest, AiResponse } from './ai.worker';
import { COLS, landingRow, newGame, other, play, type GameState, type Player, type Pos } from './game';
import { isMuted, setMuted, sfx } from './audio';

// ---------------------------------------------------------------- data

type Mode = 'ai' | 'local';
type Settings = { mode: Mode; human: Player; level: Level; first: 'anya' | 'loid' | 'random' };

const AGENTS = {
  1: { key: 'anya', name: 'Anya Forger', short: 'Anya', codename: 'Subject 007', alias: 'Telepath (unconfirmed)' },
  2: { key: 'loid', name: 'Loid Forger', short: 'Loid', codename: 'Twilight', alias: 'Psychiatrist (cover)' },
} as const;

const LINES = {
  1: { move: ['Waku waku!', 'Anya’s turn!', 'Heh.', 'Anya knows where to go.'], win: ['Anya won! Peanuts please!'], lose: ['Anya… is sad.'], draw: ['Nobody won?!'] },
  2: { move: ['Precisely as planned.', 'Hm.', 'Next phase.', 'Proceeding.'], win: ['Mission accomplished.'], lose: ['…An unexpected variable.'], draw: ['A stalemate. Acceptable.'] },
} as const;

const LEVELS: { id: Level; label: string; note: string }[] = [
  { id: 'easy', label: 'Easy', note: 'Rookie' },
  { id: 'medium', label: 'Medium', note: 'Field agent' },
  { id: 'hard', label: 'Hard', note: 'WISE elite' },
];

const SETTINGS_KEY = 'connect-forger:settings';
const loadSettings = (): Settings => {
  const fallback: Settings = { mode: 'ai', human: 1, level: 'medium', first: 'anya' };
  try {
    return { ...fallback, ...JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? '{}') };
  } catch {
    return fallback;
  }
};
const saveSettings = (s: Settings) => {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
};

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const wait = (ms: number) => new Promise((r) => setTimeout(r, reducedMotion.matches ? Math.min(ms, 150) : ms));
const pick = <T,>(xs: readonly T[]) => xs[Math.floor(Math.random() * xs.length)];
const $ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => root.querySelector(sel) as T;

// ---------------------------------------------------------------- AI worker

const worker = new Worker(new URL('./ai.worker.ts', import.meta.url), { type: 'module' });
let aiSeq = 0;
const pending = new Map<number, (col: number) => void>();
worker.onmessage = (e: MessageEvent<AiResponse>) => {
  pending.get(e.data.id)?.(e.data.col);
  pending.delete(e.data.id);
};
const askAi = (req: Omit<AiRequest, 'id'>) =>
  new Promise<number>((resolve) => {
    const id = ++aiSeq;
    pending.set(id, resolve);
    worker.postMessage({ ...req, id } satisfies AiRequest);
  });

// ---------------------------------------------------------------- state

let settings = loadSettings();
let game: GameState = newGame();
let round = 1;
let firstThisRound: Player = 1;
let score = { 1: 0, 2: 0, draws: 0 };
let busy = false; // animating or AI thinking
let cursor = 3; // keyboard / hover column
let session = 0; // bumps on every new game so stale AI replies are ignored

const isHuman = (p: Player) => settings.mode === 'local' || p === settings.human;
const roleLabel = (p: Player) =>
  settings.mode === 'local' ? `Player ${p}` : p === settings.human ? 'You' : `Computer · ${LEVELS.find((l) => l.id === settings.level)!.label}`;

// ---------------------------------------------------------------- markup

const app = $('#app');
app.innerHTML = /* html */ `
  <main class="screen menu" id="menu">
    <article class="folder">
      <div class="folder-tab">FILE No. 0417 &middot; EYES ONLY</div>
      <div class="stamp stamp-secret" aria-hidden="true">Top secret</div>
      <header class="brief-head">
        <p class="kicker">WISE &middot; Operation Strix &middot; Side mission</p>
        <h1 class="title">Connect <span>Forger</span></h1>
        <p class="lede">Drop your pieces. Line up four in a row: across, down or diagonal. First agent to do it wins.</p>
      </header>

      <div class="lineup" aria-hidden="true">
        <figure class="mugshot"><div class="photo"><div class="sprite anya"></div></div><figcaption>Anya</figcaption></figure>
        <span class="vs">VS</span>
        <figure class="mugshot"><div class="photo"><img class="sprite loid" src="${loidSprite}" alt="" /></div><figcaption>Loid</figcaption></figure>
      </div>

      <form class="options" id="options">
        <fieldset>
          <legend>Mission type</legend>
          <div class="seg">
            <label><input type="radio" name="mode" value="ai" /><span>Vs computer</span></label>
            <label><input type="radio" name="mode" value="local" /><span>2 players, 1 device</span></label>
          </div>
        </fieldset>
        <fieldset data-ai-only>
          <legend>Your agent</legend>
          <div class="seg">
            <label><input type="radio" name="human" value="1" /><span>Anya</span></label>
            <label><input type="radio" name="human" value="2" /><span>Loid</span></label>
          </div>
        </fieldset>
        <fieldset data-ai-only>
          <legend>Opponent clearance</legend>
          <div class="seg">
            ${LEVELS.map((l) => `<label><input type="radio" name="level" value="${l.id}" /><span>${l.label}<small>${l.note}</small></span></label>`).join('')}
          </div>
        </fieldset>
        <fieldset>
          <legend>First move</legend>
          <div class="seg">
            <label><input type="radio" name="first" value="anya" /><span>Anya</span></label>
            <label><input type="radio" name="first" value="loid" /><span>Loid</span></label>
            <label><input type="radio" name="first" value="random" /><span>Coin toss</span></label>
          </div>
        </fieldset>
        <button class="btn btn-primary" type="submit">Begin mission</button>
      </form>
    </article>
    <footer class="credits">
      Fan-made and non-commercial. SPY&times;FAMILY &copy; Tatsuya Endo / Shueisha.
      Pixel sprites: Anya by DarkusShadow, Loid by Hokky1 (DeviantArt).
    </footer>
  </main>

  <main class="screen game" id="game" hidden>
    <header class="topbar">
      <button class="icon-btn" id="back" type="button" aria-label="Back to briefing">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg><span>Briefing</span>
      </button>
      <div class="topbar-title">
        <strong>Connect Forger</strong>
        <span id="round-info"></span>
      </div>
      <button class="icon-btn" id="mute" type="button" aria-pressed="false" aria-label="Mute sound">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path class="spk" d="M4 9h4l5-4v14l-5-4H4z" /><path class="on" d="M16 9a4 4 0 010 6M18.5 6.5a8 8 0 010 11" /><path class="off" d="M16 9l5 6M21 9l-5 6" /></svg>
      </button>
    </header>

    <div class="arena">
      ${([1, 2] as const)
        .map(
          (p) => /* html */ `
        <section class="agent" data-p="${p}" aria-label="${AGENTS[p].name}">
          <div class="bubble" aria-hidden="true"></div>
          <div class="photo">
            ${p === 1 ? '<div class="sprite anya"></div>' : `<img class="sprite loid" src="${loidSprite}" alt="" />`}
            <div class="card-stamp" aria-hidden="true"></div>
          </div>
          <div class="agent-info">
            <p class="role"></p>
            <h2>${AGENTS[p].short}<span class="surname"> Forger</span></h2>
            <dl>
              <div><dt>Codename</dt><dd>${AGENTS[p].codename}</dd></div>
              <div><dt>Cover</dt><dd>${AGENTS[p].alias}</dd></div>
            </dl>
          </div>
          <div class="tally"><span class="chip"></span><b class="wins">0</b><small>wins</small></div>
        </section>`,
        )
        .join('')}

      <div class="table">
        <div class="preview" aria-hidden="true"><div class="ghost"></div></div>
        <div class="board" id="board">
          <div class="pieces"></div>
          <div class="face" aria-hidden="true"></div>
          <div class="hits" role="group" aria-label="Board columns">
            ${Array.from({ length: COLS }, (_, c) => `<button type="button" class="hit" data-col="${c}" aria-label="Column ${c + 1}"></button>`).join('')}
          </div>
          <div class="board-stamp" aria-hidden="true"></div>
        </div>
        <div class="dock">
          <p class="status" id="status" aria-live="polite"></p>
          <div class="result-actions" hidden>
            <button class="btn btn-primary" id="rematch" type="button">Rematch</button>
            <button class="btn" id="to-menu" type="button">Change mission</button>
          </div>
        </div>
      </div>
    </div>
    <p class="hint">Tap a column, or use <kbd>&larr;</kbd><kbd>&rarr;</kbd> and <kbd>Enter</kbd>. Keys <kbd>1</kbd>&ndash;<kbd>7</kbd> drop straight in.</p>
  </main>
`;

const menu = $('#menu');
const gameScreen = $('#game');
const form = $<HTMLFormElement>('#options');
const board = $('#board');
const piecesEl = $('.pieces', board);
const ghost = $('.ghost');
const statusEl = $('#status');
const resultActions = $('.result-actions');
const boardStamp = $('.board-stamp');
const cards = { 1: $(`.agent[data-p="1"]`), 2: $(`.agent[data-p="2"]`) };

// ---------------------------------------------------------------- menu

function syncForm() {
  for (const [name, value] of Object.entries(settings)) {
    const input = form.querySelector<HTMLInputElement>(`input[name="${name}"][value="${value}"]`);
    if (input) input.checked = true;
  }
  form.querySelectorAll<HTMLElement>('[data-ai-only]').forEach((el) => (el.hidden = settings.mode !== 'ai'));
}

form.addEventListener('change', () => {
  const fd = new FormData(form);
  settings = {
    mode: fd.get('mode') as Mode,
    human: Number(fd.get('human')) as Player,
    level: fd.get('level') as Level,
    first: fd.get('first') as Settings['first'],
  };
  saveSettings(settings);
  syncForm();
  sfx.click();
});

form.addEventListener('submit', (e) => {
  e.preventDefault();
  sfx.click();
  score = { 1: 0, 2: 0, draws: 0 };
  round = 1;
  firstThisRound = settings.first === 'anya' ? 1 : settings.first === 'loid' ? 2 : Math.random() < 0.5 ? 1 : 2;
  menu.hidden = true;
  gameScreen.hidden = false;
  startRound();
  $<HTMLButtonElement>(`.hit[data-col="${cursor}"]`).focus({ preventScroll: true });
});

function toMenu() {
  session++;
  busy = false;
  gameScreen.hidden = true;
  menu.hidden = false;
  syncForm();
}
$('#back').addEventListener('click', toMenu);
$('#to-menu').addEventListener('click', toMenu);

// ---------------------------------------------------------------- mute

const muteBtn = $('#mute');
const syncMute = () => {
  muteBtn.setAttribute('aria-pressed', String(isMuted()));
  muteBtn.setAttribute('aria-label', isMuted() ? 'Unmute sound' : 'Mute sound');
  muteBtn.classList.toggle('muted', isMuted());
};
muteBtn.addEventListener('click', () => {
  setMuted(!isMuted());
  syncMute();
  sfx.click();
});
syncMute();

// ---------------------------------------------------------------- round lifecycle

function startRound() {
  session++;
  game = newGame(firstThisRound);
  busy = false;
  piecesEl.replaceChildren();
  board.classList.remove('over');
  boardStamp.className = 'board-stamp';
  boardStamp.textContent = '';
  resultActions.hidden = true;
  for (const p of [1, 2] as const) {
    cards[p].classList.remove('won', 'lost');
    $('.card-stamp', cards[p]).textContent = '';
    $('.role', cards[p]).textContent = roleLabel(p);
    $('.wins', cards[p]).textContent = String(score[p]);
  }
  $('#round-info').textContent = `Round ${round} · Draws ${score.draws}`;
  updateTurnUI();
  void maybeAiTurn();
}

$('#rematch').addEventListener('click', () => {
  sfx.click();
  round++;
  firstThisRound = other(firstThisRound);
  startRound();
  $<HTMLButtonElement>(`.hit[data-col="${cursor}"]`).focus({ preventScroll: true });
});

function updateTurnUI(thinking = false) {
  const p = game.turn;
  for (const q of [1, 2] as const) cards[q].classList.toggle('active', game.outcome.kind === 'playing' && q === p);
  cards[p].classList.toggle('thinking', thinking);
  cards[other(p)].classList.remove('thinking');
  board.dataset.turn = String(p);
  board.classList.toggle('locked', busy || !isHuman(p));
  statusEl.textContent =
    game.outcome.kind !== 'playing'
      ? ''
      : thinking
        ? `${AGENTS[p].short} is calculating…`
        : settings.mode === 'ai'
          ? isHuman(p)
            ? `Your move, ${AGENTS[p].short}.`
            : `${AGENTS[p].short}’s move.`
          : `${AGENTS[p].short}’s move (Player ${p}).`;
  renderGhost();
}

function renderGhost() {
  const show = game.outcome.kind === 'playing' && !busy && isHuman(game.turn) && landingRow(game.board, cursor) >= 0;
  ghost.className = `ghost piece p${game.turn}`;
  ghost.style.setProperty('--col', String(cursor));
  ghost.hidden = !show;
  document.querySelectorAll('.hit').forEach((h, i) => h.classList.toggle('cursor', i === cursor));
}

// ---------------------------------------------------------------- moves

async function humanDrop(col: number) {
  if (busy || game.outcome.kind !== 'playing' || !isHuman(game.turn)) return;
  cursor = col;
  if (landingRow(game.board, col) < 0) {
    sfx.bump();
    const hit = $(`.hit[data-col="${col}"]`);
    hit.classList.remove('nope');
    void hit.offsetWidth;
    hit.classList.add('nope');
    return;
  }
  await commitMove(col);
}

async function commitMove(col: number) {
  const mover = game.turn;
  const result = play(game, col);
  if (!result) return;
  const mySession = session;
  busy = true;
  game = result.state;
  updateTurnUI();
  await animateDrop(result.pos, mover);
  if (mySession !== session) return;
  busy = false;
  if (game.outcome.kind === 'playing') {
    if (Math.random() < 0.28) say(mover, pick(LINES[mover].move));
    updateTurnUI();
    void maybeAiTurn();
  } else {
    finishRound();
  }
}

async function maybeAiTurn() {
  if (settings.mode !== 'ai' || game.outcome.kind !== 'playing' || isHuman(game.turn)) return;
  const mySession = session;
  busy = true;
  updateTurnUI(true);
  const [col] = await Promise.all([
    askAi({ board: game.board, player: game.turn, level: settings.level }),
    wait(500 + Math.random() * 400),
  ]);
  if (mySession !== session) return;
  cards[game.turn].classList.remove('thinking');
  await commitMove(col);
}

function pieceEl(p: Player, pos: Pos) {
  const el = document.createElement('div');
  el.className = `piece p${p}`;
  el.style.gridRow = String(pos.row + 1);
  el.style.gridColumn = String(pos.col + 1);
  el.dataset.r = String(pos.row);
  el.dataset.c = String(pos.col);
  return el;
}

async function animateDrop(pos: Pos, p: Player) {
  const el = pieceEl(p, pos);
  piecesEl.append(el);
  const from = `translateY(${-(pos.row + 1) * 100 - 8}%)`;
  if (!reducedMotion.matches) {
    const duration = 260 + pos.row * 55;
    const anim = el.animate(
      [
        { transform: from, easing: 'cubic-bezier(.55,0,1,.45)' },
        { transform: 'translateY(0)', offset: 0.72, easing: 'cubic-bezier(0,.55,.45,1)' },
        { transform: 'translateY(-14%)', offset: 0.86, easing: 'cubic-bezier(.55,0,1,.45)' },
        { transform: 'translateY(0)' },
      ],
      { duration },
    );
    setTimeout(() => sfx.drop(pos.row), duration * 0.72);
    // Background tabs can stall animation callbacks; never let that block the game.
    await Promise.race([anim.finished.catch(() => undefined), new Promise((r) => setTimeout(r, duration + 60))]);
  } else {
    sfx.drop(pos.row);
  }
}

function finishRound() {
  const o = game.outcome;
  board.classList.add('over');
  for (const q of [1, 2] as const) cards[q].classList.remove('active', 'thinking');
  if (o.kind === 'win') {
    score[o.winner]++;
    const loser = other(o.winner);
    const line = new Set(o.line.map((x) => `${x.row},${x.col}`));
    piecesEl.querySelectorAll<HTMLElement>('.piece').forEach((el) => el.classList.toggle('win', line.has(`${el.dataset.r},${el.dataset.c}`)));
    cards[o.winner].classList.add('won');
    cards[loser].classList.add('lost');
    $('.card-stamp', cards[o.winner]).textContent = 'Complete';
    $('.card-stamp', cards[loser]).textContent = 'Compromised';
    $('.wins', cards[o.winner]).textContent = String(score[o.winner]);
    say(o.winner, pick(LINES[o.winner].win));
    setTimeout(() => say(loser, pick(LINES[loser].lose)), 700);
    const humanLost = settings.mode === 'ai' && o.winner !== settings.human;
    humanLost ? sfx.lose() : sfx.win();
    statusEl.textContent =
      settings.mode === 'ai'
        ? o.winner === settings.human
          ? `Mission complete. ${AGENTS[o.winner].short} wins the round!`
          : `Mission failed. ${AGENTS[o.winner].short} outplayed you.`
        : `Mission complete. ${AGENTS[o.winner].name} wins the round!`;
    stamp(humanLost ? 'Mission failed' : 'Mission complete', humanLost ? 'fail' : 'win');
  } else {
    score.draws++;
    sfx.draw();
    say(1, pick(LINES[1].draw));
    setTimeout(() => say(2, pick(LINES[2].draw)), 600);
    statusEl.textContent = 'The board is full. Stalemate.';
    stamp('Stalemate', 'draw');
  }
  $('#round-info').textContent = `Round ${round} · Draws ${score.draws}`;
  board.classList.add('locked');
  ghost.hidden = true;
  resultActions.hidden = false;
  setTimeout(() => $<HTMLButtonElement>('#rematch').focus({ preventScroll: true }), 400);
}

function stamp(text: string, kind: 'win' | 'fail' | 'draw') {
  boardStamp.textContent = text;
  boardStamp.className = `board-stamp show ${kind}`;
}

const bubbleTimers = new Map<Player, number>();
function say(p: Player, text: string) {
  const b = $('.bubble', cards[p]);
  b.textContent = text;
  b.classList.remove('show');
  void b.offsetWidth;
  b.classList.add('show');
  clearTimeout(bubbleTimers.get(p));
  bubbleTimers.set(p, window.setTimeout(() => b.classList.remove('show'), 2600));
}

// ---------------------------------------------------------------- input

document.querySelectorAll<HTMLButtonElement>('.hit').forEach((hit) => {
  const col = Number(hit.dataset.col);
  hit.addEventListener('click', () => void humanDrop(col));
  hit.addEventListener('pointerenter', (e) => {
    if (e.pointerType === 'mouse') {
      cursor = col;
      renderGhost();
    }
  });
  hit.addEventListener('focus', () => {
    cursor = col;
    renderGhost();
  });
});

document.addEventListener('keydown', (e) => {
  if (gameScreen.hidden || e.metaKey || e.ctrlKey || e.altKey) return;
  const inBoard = (document.activeElement as HTMLElement | null)?.classList.contains('hit') ?? false;
  if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
    e.preventDefault();
    cursor = (cursor + (e.key === 'ArrowLeft' ? COLS - 1 : 1)) % COLS;
    $<HTMLButtonElement>(`.hit[data-col="${cursor}"]`).focus({ preventScroll: true });
    renderGhost();
  } else if ((e.key === 'ArrowDown' || ((e.key === 'Enter' || e.key === ' ') && !inBoard)) && resultActions.hidden) {
    // Enter/Space on a focused column button already fires its click.
    e.preventDefault();
    void humanDrop(cursor);
  } else if (/^[1-7]$/.test(e.key)) {
    void humanDrop(Number(e.key) - 1);
  } else if (e.key === 'Escape') {
    toMenu();
  }
});

// ---------------------------------------------------------------- go

syncForm();
