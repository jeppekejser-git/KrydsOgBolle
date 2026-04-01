/**
 * App Controller
 * Handles all SVG generation, UI rendering, and event binding.
 */
const App = (() => {

  // =============================================================
  // SVG PIECES
  // =============================================================

  function bunnyHeadSVG() {
    return `<svg viewBox="0 0 100 112" xmlns="http://www.w3.org/2000/svg" aria-label="Påskekanin">
      <!-- Left ear outer -->
      <ellipse cx="31" cy="24" rx="12.5" ry="24" fill="#FCCDD9"/>
      <!-- Right ear outer -->
      <ellipse cx="69" cy="24" rx="12.5" ry="24" fill="#FCCDD9"/>
      <!-- Left ear inner -->
      <ellipse cx="31" cy="24" rx="6.5"  ry="16" fill="#F48FB1"/>
      <!-- Right ear inner -->
      <ellipse cx="69" cy="24" rx="6.5"  ry="16" fill="#F48FB1"/>
      <!-- Head -->
      <ellipse cx="50" cy="76" rx="33" ry="30" fill="#FCCDD9"/>
      <!-- Cheek blush -->
      <ellipse cx="24" cy="80" rx="9.5" ry="7"   fill="#FF94B7" opacity="0.45"/>
      <ellipse cx="76" cy="80" rx="9.5" ry="7"   fill="#FF94B7" opacity="0.45"/>
      <!-- Eyes -->
      <circle cx="37" cy="70" r="5"   fill="#3E2723"/>
      <circle cx="63" cy="70" r="5"   fill="#3E2723"/>
      <!-- Eye shine -->
      <circle cx="39" cy="68" r="2"   fill="#FFFFFF"/>
      <circle cx="65" cy="68" r="2"   fill="#FFFFFF"/>
      <!-- Nose -->
      <ellipse cx="50" cy="83" rx="5.5" ry="3.8" fill="#E91E63"/>
      <!-- Mouth -->
      <path d="M44 88 Q50 94 56 88"
            stroke="#C2185B" stroke-width="2.2" fill="none" stroke-linecap="round"/>
      <!-- Whiskers left -->
      <line x1="14" y1="81" x2="40" y2="83" stroke="#D81B60" stroke-width="1.2" opacity="0.5"/>
      <line x1="14" y1="87" x2="40" y2="86" stroke="#D81B60" stroke-width="1.2" opacity="0.5"/>
      <!-- Whiskers right -->
      <line x1="86" y1="81" x2="60" y2="83" stroke="#D81B60" stroke-width="1.2" opacity="0.5"/>
      <line x1="86" y1="87" x2="60" y2="86" stroke="#D81B60" stroke-width="1.2" opacity="0.5"/>
    </svg>`;
  }

  function easterEggSVG() {
    return `<svg viewBox="0 0 90 108" xmlns="http://www.w3.org/2000/svg" aria-label="Påskeæg">
      <!-- Main egg -->
      <path d="M45 5 C67 5 83 29 83 57 C83 82 66 103 45 103 C24 103 7 82 7 57 C7 29 23 5 45 5Z"
            fill="#FDD835"/>
      <!-- Pink center band -->
      <path d="M9 57 C9 57 25 47 45 47 C65 47 81 57 81 57 C81 57 65 67 45 67 C25 67 9 57 9 57Z"
            fill="#F06292"/>
      <!-- Wavy ribbon above band -->
      <path d="M12 49 Q22 44 33 47 Q43 50 45 47 Q47 44 57 47 Q68 50 78 45"
            stroke="#CE93D8" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <!-- Wavy ribbon below band -->
      <path d="M12 65 Q22 70 33 67 Q43 64 45 67 Q47 70 57 67 Q68 64 78 69"
            stroke="#CE93D8" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <!-- Top dots -->
      <circle cx="31" cy="28" r="5.5" fill="#4FC3F7"/>
      <circle cx="45" cy="20" r="4.5" fill="#AED581"/>
      <circle cx="59" cy="28" r="5.5" fill="#4FC3F7"/>
      <!-- Bottom dots -->
      <circle cx="31" cy="86" r="5.5" fill="#AED581"/>
      <circle cx="45" cy="90" r="4"   fill="#FF8A65"/>
      <circle cx="59" cy="86" r="5.5" fill="#4FC3F7"/>
      <!-- Outline -->
      <path d="M45 5 C67 5 83 29 83 57 C83 82 66 103 45 103 C24 103 7 82 7 57 C7 29 23 5 45 5Z"
            fill="none" stroke="#F9A825" stroke-width="2.5"/>
    </svg>`;
  }

  // =============================================================
  // BOARD BACKGROUND SVG (grass + flowers + twig grid)
  // =============================================================

  function flower(x, y, scale, petalColor) {
    return `<g transform="translate(${x},${y}) scale(${scale})">
      <circle cx="0"    cy="-9"  r="5.5" fill="${petalColor}" opacity="0.88"/>
      <circle cx="8.6"  cy="-2.8" r="5.5" fill="${petalColor}" opacity="0.88"/>
      <circle cx="5.3"  cy="7.3"  r="5.5" fill="${petalColor}" opacity="0.88"/>
      <circle cx="-5.3" cy="7.3"  r="5.5" fill="${petalColor}" opacity="0.88"/>
      <circle cx="-8.6" cy="-2.8" r="5.5" fill="${petalColor}" opacity="0.88"/>
      <circle cx="0" cy="0" r="5.5" fill="#FDD835"/>
      <circle cx="0" cy="0" r="3"   fill="#F9A825"/>
    </g>`;
  }

  function boardSVG() {
    // Grid lines are at x=120, x=240, y=120, y=240 in a 360×360 space.
    // Twig paths are slightly wavy cubic beziers to look organic.
    return `<svg class="board-bg" viewBox="0 0 360 360" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <radialGradient id="grassG" cx="50%" cy="50%" r="72%">
          <stop offset="0%"   stop-color="#8BC34A"/>
          <stop offset="100%" stop-color="#558B2F"/>
        </radialGradient>
      </defs>

      <!-- Grass -->
      <rect width="360" height="360" fill="url(#grassG)" rx="16"/>

      <!-- Subtle grass blades -->
      <g stroke="#7CB342" stroke-width="1.2" opacity="0.35" stroke-linecap="round">
        <path d="M18 18 Q20  7 23 18"/>  <path d="M38 12 Q40  2 42 12"/>
        <path d="M78 24 Q80 13 83 24"/>  <path d="M198 16 Q201  5 204 16"/>
        <path d="M278 20 Q281  8 284 20"/> <path d="M332 14 Q334  4 337 14"/>
        <path d="M145 342 Q148 331 151 342"/> <path d="M248 337 Q251 326 254 337"/>
        <path d="M302 344 Q305 333 308 344"/> <path d="M48 346 Q51 335 54 346"/>
        <path d="M15 200 Q17 189 20 200"/> <path d="M342 200 Q344 189 347 200"/>
        <path d="M22 285 Q24 274 27 285"/> <path d="M338 285 Q340 274 343 285"/>
      </g>

      <!-- ── FLOWERS ────────────────────────── -->
      <!-- Cell 0 (top-left, center ~60,60) -->
      ${flower(20, 20, 0.72, '#FFFFFF')}
      ${flower(92, 26, 0.62, '#F8BBD0')}
      ${flower(22, 92, 0.68, '#CE93D8')}

      <!-- Cell 1 (top-center, center ~180,60) -->
      ${flower(148, 22, 0.68, '#FFF176')}
      ${flower(210, 18, 0.62, '#FFFFFF')}
      ${flower(172, 90, 0.60, '#F8BBD0')}

      <!-- Cell 2 (top-right, center ~300,60) -->
      ${flower(256, 20, 0.68, '#CE93D8')}
      ${flower(332, 26, 0.72, '#FFFFFF')}
      ${flower(314, 88, 0.62, '#FFF176')}

      <!-- Cell 3 (mid-left, center ~60,180) -->
      ${flower(18, 148, 0.68, '#F8BBD0')}
      ${flower(90, 144, 0.62, '#FFF176')}
      ${flower(20, 212, 0.68, '#FFFFFF')}

      <!-- Cell 4 (center, center ~180,180) -->
      ${flower(136, 136, 0.58, '#CE93D8')}
      ${flower(220, 138, 0.58, '#FFFFFF')}
      ${flower(184, 220, 0.58, '#F8BBD0')}

      <!-- Cell 5 (mid-right, center ~300,180) -->
      ${flower(258, 146, 0.62, '#FFF176')}
      ${flower(338, 150, 0.68, '#CE93D8')}
      ${flower(264, 214, 0.68, '#FFFFFF')}

      <!-- Cell 6 (bottom-left, center ~60,300) -->
      ${flower(20, 260, 0.68, '#FFF176')}
      ${flower(92, 264, 0.62, '#CE93D8')}
      ${flower(22, 336, 0.72, '#FFFFFF')}

      <!-- Cell 7 (bottom-center, center ~180,300) -->
      ${flower(146, 258, 0.68, '#F8BBD0')}
      ${flower(214, 262, 0.62, '#FFF176')}
      ${flower(176, 340, 0.68, '#CE93D8')}

      <!-- Cell 8 (bottom-right, center ~300,300) -->
      ${flower(260, 260, 0.62, '#FFFFFF')}
      ${flower(336, 264, 0.68, '#F8BBD0')}
      ${flower(306, 338, 0.72, '#FFF176')}

      <!-- ── TWIG GRID ──────────────────────── -->
      <!-- Vertical twig 1 (x≈120) -->
      <path d="M118 4 C116 48 124 88 117 130 C110 172 122 212 116 254 C110 296 120 330 117 356"
            stroke="#5D4037" stroke-width="6" fill="none" stroke-linecap="round"/>
      <!-- V1 knots / branches -->
      <path d="M117 50 C107 44 103 37 107 30"   stroke="#5D4037" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M116 170 C127 162 131 154 127 146" stroke="#5D4037" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M116 280 C106 273 102 265 107 257" stroke="#5D4037" stroke-width="3" fill="none" stroke-linecap="round"/>

      <!-- Vertical twig 2 (x≈240) -->
      <path d="M242 4 C244 48 236 88 243 130 C250 172 238 212 244 254 C250 296 240 330 243 356"
            stroke="#5D4037" stroke-width="6" fill="none" stroke-linecap="round"/>
      <!-- V2 knots -->
      <path d="M243 62 C253 55 257 47 252 39"   stroke="#5D4037" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M244 182 C233 174 229 166 234 158" stroke="#5D4037" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M244 294 C255 287 259 279 254 271" stroke="#5D4037" stroke-width="3" fill="none" stroke-linecap="round"/>

      <!-- Horizontal twig 1 (y≈120) -->
      <path d="M4 118 C48 116 88 124 130 117 C172 110 212 122 254 116 C296 110 330 120 356 117"
            stroke="#5D4037" stroke-width="6" fill="none" stroke-linecap="round"/>
      <!-- H1 knots -->
      <path d="M50 117 C44 107 37 103 30 107"   stroke="#5D4037" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M170 116 C162 127 154 131 146 127" stroke="#5D4037" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M280 116 C273 106 265 102 257 107" stroke="#5D4037" stroke-width="3" fill="none" stroke-linecap="round"/>

      <!-- Horizontal twig 2 (y≈240) -->
      <path d="M4 242 C48 244 88 236 130 243 C172 250 212 238 254 244 C296 250 330 240 356 243"
            stroke="#5D4037" stroke-width="6" fill="none" stroke-linecap="round"/>
      <!-- H2 knots -->
      <path d="M64 243 C57 253 50 257 43 252"   stroke="#5D4037" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M182 244 C174 233 166 229 158 234" stroke="#5D4037" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M294 244 C287 255 279 259 271 254" stroke="#5D4037" stroke-width="3" fill="none" stroke-linecap="round"/>
    </svg>`;
  }

  // =============================================================
  // SCREEN MANAGEMENT
  // =============================================================

  const SCREENS = {
    start:  document.getElementById('start-screen'),
    game:   document.getElementById('game-screen'),
    result: document.getElementById('result-screen'),
  };

  function showScreen(name) {
    Object.entries(SCREENS).forEach(([key, el]) => {
      el.classList.toggle('active', key === name);
    });
    if (name === 'start') {
      // Re-focus first input when returning to start
      setTimeout(() => {
        const inp = document.getElementById('player1-name');
        if (inp) inp.blur();
      }, 50);
    }
  }

  // =============================================================
  // BOARD
  // =============================================================

  let boardReady = false;

  function setupBoard() {
    if (boardReady) return;
    boardReady = true;

    const boardEl = document.getElementById('board');
    // Insert SVG background before cells-grid
    boardEl.insertAdjacentHTML('afterbegin', boardSVG());

    // Generate 9 cells
    const grid = document.getElementById('cells-grid');
    grid.innerHTML = '';
    for (let i = 0; i < 9; i++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.dataset.index = i;
      cell.addEventListener('click', onCellClick);
      grid.appendChild(cell);
    }
  }

  function resetBoard() {
    document.querySelectorAll('.cell').forEach(cell => {
      cell.innerHTML = '';
      cell.classList.remove('played', 'win-cell');
    });
  }

  function renderPiece(index, player) {
    const cell = document.querySelector(`.cell[data-index="${index}"]`);
    if (!cell) return;
    cell.classList.add('played');
    cell.innerHTML = player === 'X' ? bunnyHeadSVG() : easterEggSVG();
  }

  function markWinCells(winLine) {
    winLine.forEach(i => {
      const cell = document.querySelector(`.cell[data-index="${i}"]`);
      if (cell) cell.classList.add('win-cell');
    });
  }

  // =============================================================
  // TURN INDICATOR
  // =============================================================

  function updateTurnIndicator(state) {
    document.getElementById('turn-piece').innerHTML =
      state.currentPlayer === 'X' ? bunnyHeadSVG() : easterEggSVG();
    document.getElementById('turn-name').textContent =
      state.players[state.currentPlayer];
  }

  // =============================================================
  // CELL CLICK HANDLER
  // =============================================================

  function onCellClick(e) {
    const index = parseInt(e.currentTarget.dataset.index, 10);
    const before = Game.getState();
    if (before.winner !== null) return;

    const movedPlayer = before.currentPlayer;
    const moved = Game.makeMove(index);
    if (!moved) return;

    renderPiece(index, movedPlayer);
    const after = Game.getState();

    if (after.winner) {
      if (after.winLine) markWinCells(after.winLine);
      setTimeout(() => showResult(after), after.isDraw ? 400 : 700);
    } else {
      updateTurnIndicator(after);
    }
  }

  // =============================================================
  // RESULT SCREEN
  // =============================================================

  function showResult(state) {
    const decoEl     = document.getElementById('result-deco');
    const titleEl    = document.getElementById('result-title');
    const subtitleEl = document.getElementById('result-subtitle');

    if (state.isDraw) {
      decoEl.innerHTML = '<span style="font-size:88px">🌸</span>';
      titleEl.textContent   = 'Uafgjort!';
      subtitleEl.textContent = 'En fjer i hatten til begge!';
    } else {
      const name = state.players[state.winner];
      if (state.winner === 'X') {
        decoEl.innerHTML   = bunnyHeadSVG();
        titleEl.textContent   = `${name} vandt!`;
        subtitleEl.textContent = '🐰 Påskekaninen triumferer!';
      } else {
        decoEl.innerHTML   = easterEggSVG();
        titleEl.textContent   = `${name} vandt!`;
        subtitleEl.textContent = '🥚 Påskeægget er bedst!';
      }
    }

    showScreen('result');
  }

  // =============================================================
  // START SCREEN DECORATIONS
  // =============================================================

  function decorateStartScreen() {
    // Header decoration
    document.getElementById('header-deco').innerHTML =
      '<span style="font-size:52px">🌷</span>' +
      '<span style="font-size:62px">🐣</span>' +
      '<span style="font-size:52px">🌷</span>';

    // Mini pieces next to subtitle
    const sub = document.getElementById('subtitle-pieces');
    sub.innerHTML =
      `<span class="mini-piece">${bunnyHeadSVG()}</span>` +
      `<span style="font-size:20px;letter-spacing:0;color:#888;padding:0 6px;font-weight:900">vs</span>` +
      `<span class="mini-piece">${easterEggSVG()}</span>`;

    // Pieces in player labels
    document.getElementById('bunny-icon-label').innerHTML = bunnyHeadSVG();
    document.getElementById('egg-icon-label').innerHTML   = easterEggSVG();
  }

  // =============================================================
  // INIT
  // =============================================================

  function init() {
    setupBoard();
    decorateStartScreen();

    // Start button
    document.getElementById('start-btn').addEventListener('click', () => {
      const p1 = document.getElementById('player1-name').value.trim() || 'Spiller 1';
      const p2 = document.getElementById('player2-name').value.trim() || 'Spiller 2';
      Game.init(p1, p2);
      resetBoard();
      updateTurnIndicator(Game.getState());
      showScreen('game');
    });

    // Back to start
    document.getElementById('back-btn').addEventListener('click', () => {
      showScreen('start');
    });

    // Play again (same players, same assignment)
    document.getElementById('play-again-btn').addEventListener('click', () => {
      Game.reset();
      resetBoard();
      updateTurnIndicator(Game.getState());
      showScreen('game');
    });

    // New game (back to name entry)
    document.getElementById('new-game-btn').addEventListener('click', () => {
      showScreen('start');
    });

    // Show start screen
    showScreen('start');
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', App.init);
