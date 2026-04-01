/**
 * App Controller
 * SVG generation, UI rendering, event binding, move-phase logic.
 */
const App = (() => {

  // =============================================================
  // SVG PIECES  — both use viewBox="0 0 100 100" for consistent sizing
  // =============================================================

  function bunnyHeadSVG() {
    return `<svg viewBox="0 0 100 100" width="100" height="100"
                 xmlns="http://www.w3.org/2000/svg" aria-label="Påskekanin">
      <!-- Left ear outer -->
      <ellipse cx="30" cy="19" rx="11" ry="19" fill="#FCCDD9"/>
      <!-- Right ear outer -->
      <ellipse cx="70" cy="19" rx="11" ry="19" fill="#FCCDD9"/>
      <!-- Left ear inner -->
      <ellipse cx="30" cy="19" rx="6"  ry="13" fill="#F48FB1"/>
      <!-- Right ear inner -->
      <ellipse cx="70" cy="19" rx="6"  ry="13" fill="#F48FB1"/>
      <!-- Head -->
      <ellipse cx="50" cy="68" rx="30" ry="27" fill="#FCCDD9"/>
      <!-- Cheek blush -->
      <ellipse cx="24" cy="73" rx="8.5" ry="6.5" fill="#FF94B7" opacity="0.45"/>
      <ellipse cx="76" cy="73" rx="8.5" ry="6.5" fill="#FF94B7" opacity="0.45"/>
      <!-- Eyes -->
      <circle cx="38" cy="62" r="4.5" fill="#3E2723"/>
      <circle cx="62" cy="62" r="4.5" fill="#3E2723"/>
      <!-- Eye shine -->
      <circle cx="40" cy="60" r="1.8" fill="#FFFFFF"/>
      <circle cx="64" cy="60" r="1.8" fill="#FFFFFF"/>
      <!-- Nose -->
      <ellipse cx="50" cy="74" rx="5"   ry="3.5" fill="#E91E63"/>
      <!-- Mouth -->
      <path d="M44 79 Q50 85 56 79"
            stroke="#C2185B" stroke-width="2.2" fill="none" stroke-linecap="round"/>
      <!-- Whiskers left -->
      <line x1="13" y1="72" x2="40" y2="74" stroke="#D81B60" stroke-width="1.1" opacity="0.5"/>
      <line x1="13" y1="78" x2="40" y2="77" stroke="#D81B60" stroke-width="1.1" opacity="0.5"/>
      <!-- Whiskers right -->
      <line x1="87" y1="72" x2="60" y2="74" stroke="#D81B60" stroke-width="1.1" opacity="0.5"/>
      <line x1="87" y1="78" x2="60" y2="77" stroke="#D81B60" stroke-width="1.1" opacity="0.5"/>
    </svg>`;
  }

  function easterEggSVG() {
    return `<svg viewBox="0 0 100 100" width="100" height="100"
                 xmlns="http://www.w3.org/2000/svg" aria-label="Påskeæg">
      <!-- Main egg -->
      <path d="M50 4 C70 4 86 26 86 52 C86 74 70 96 50 96 C30 96 14 74 14 52 C14 26 30 4 50 4Z"
            fill="#FDD835"/>
      <!-- Pink center band -->
      <path d="M16 52 C16 52 30 43 50 43 C70 43 84 52 84 52 C84 52 70 61 50 61 C30 61 16 52 16 52Z"
            fill="#F06292"/>
      <!-- Wavy ribbon above band -->
      <path d="M18 44 Q28 39 38 42 Q47 45 50 42 Q53 39 62 42 Q72 45 82 40"
            stroke="#CE93D8" stroke-width="2.3" fill="none" stroke-linecap="round"/>
      <!-- Wavy ribbon below band -->
      <path d="M18 60 Q28 65 38 62 Q47 59 50 62 Q53 65 62 62 Q72 59 82 64"
            stroke="#CE93D8" stroke-width="2.3" fill="none" stroke-linecap="round"/>
      <!-- Top dots -->
      <circle cx="34" cy="24" r="5"   fill="#4FC3F7"/>
      <circle cx="50" cy="17" r="4.2" fill="#AED581"/>
      <circle cx="66" cy="24" r="5"   fill="#4FC3F7"/>
      <!-- Bottom dots -->
      <circle cx="34" cy="80" r="5"   fill="#AED581"/>
      <circle cx="50" cy="85" r="3.8" fill="#FF8A65"/>
      <circle cx="66" cy="80" r="5"   fill="#4FC3F7"/>
      <!-- Outline -->
      <path d="M50 4 C70 4 86 26 86 52 C86 74 70 96 50 96 C30 96 14 74 14 52 C14 26 30 4 50 4Z"
            fill="none" stroke="#F9A825" stroke-width="2.3"/>
    </svg>`;
  }

  // =============================================================
  // BOARD BACKGROUND SVG
  // =============================================================

  function flower(x, y, scale, petalColor) {
    return `<g transform="translate(${x},${y}) scale(${scale})">
      <circle cx="0"    cy="-9"   r="5.5" fill="${petalColor}" opacity="0.88"/>
      <circle cx="8.6"  cy="-2.8" r="5.5" fill="${petalColor}" opacity="0.88"/>
      <circle cx="5.3"  cy="7.3"  r="5.5" fill="${petalColor}" opacity="0.88"/>
      <circle cx="-5.3" cy="7.3"  r="5.5" fill="${petalColor}" opacity="0.88"/>
      <circle cx="-8.6" cy="-2.8" r="5.5" fill="${petalColor}" opacity="0.88"/>
      <circle cx="0" cy="0" r="5.5" fill="#FDD835"/>
      <circle cx="0" cy="0" r="3"   fill="#F9A825"/>
    </g>`;
  }

  function boardSVG() {
    return `<svg class="board-bg" viewBox="0 0 360 360" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <radialGradient id="grassG" cx="50%" cy="50%" r="72%">
          <stop offset="0%"   stop-color="#8BC34A"/>
          <stop offset="100%" stop-color="#558B2F"/>
        </radialGradient>
      </defs>
      <rect width="360" height="360" fill="url(#grassG)" rx="16"/>
      <g stroke="#7CB342" stroke-width="1.2" opacity="0.35" stroke-linecap="round">
        <path d="M18 18 Q20  7 23 18"/>  <path d="M38 12 Q40  2 42 12"/>
        <path d="M78 24 Q80 13 83 24"/>  <path d="M198 16 Q201  5 204 16"/>
        <path d="M278 20 Q281  8 284 20"/> <path d="M332 14 Q334  4 337 14"/>
        <path d="M145 342 Q148 331 151 342"/> <path d="M248 337 Q251 326 254 337"/>
        <path d="M302 344 Q305 333 308 344"/> <path d="M48 346 Q51 335 54 346"/>
        <path d="M15 200 Q17 189 20 200"/> <path d="M342 200 Q344 189 347 200"/>
        <path d="M22 285 Q24 274 27 285"/> <path d="M338 285 Q340 274 343 285"/>
      </g>
      <!-- Flowers -->
      ${flower(20, 20, 0.72, '#FFFFFF')} ${flower(92, 26, 0.62, '#F8BBD0')} ${flower(22, 92, 0.68, '#CE93D8')}
      ${flower(148, 22, 0.68, '#FFF176')} ${flower(210, 18, 0.62, '#FFFFFF')} ${flower(172, 90, 0.60, '#F8BBD0')}
      ${flower(256, 20, 0.68, '#CE93D8')} ${flower(332, 26, 0.72, '#FFFFFF')} ${flower(314, 88, 0.62, '#FFF176')}
      ${flower(18, 148, 0.68, '#F8BBD0')} ${flower(90, 144, 0.62, '#FFF176')} ${flower(20, 212, 0.68, '#FFFFFF')}
      ${flower(136, 136, 0.58, '#CE93D8')} ${flower(220, 138, 0.58, '#FFFFFF')} ${flower(184, 220, 0.58, '#F8BBD0')}
      ${flower(258, 146, 0.62, '#FFF176')} ${flower(338, 150, 0.68, '#CE93D8')} ${flower(264, 214, 0.68, '#FFFFFF')}
      ${flower(20, 260, 0.68, '#FFF176')} ${flower(92, 264, 0.62, '#CE93D8')} ${flower(22, 336, 0.72, '#FFFFFF')}
      ${flower(146, 258, 0.68, '#F8BBD0')} ${flower(214, 262, 0.62, '#FFF176')} ${flower(176, 340, 0.68, '#CE93D8')}
      ${flower(260, 260, 0.62, '#FFFFFF')} ${flower(336, 264, 0.68, '#F8BBD0')} ${flower(306, 338, 0.72, '#FFF176')}
      <!-- Twig grid -->
      <path d="M118 4 C116 48 124 88 117 130 C110 172 122 212 116 254 C110 296 120 330 117 356"
            stroke="#5D4037" stroke-width="6" fill="none" stroke-linecap="round"/>
      <path d="M117 50 C107 44 103 37 107 30"   stroke="#5D4037" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M116 170 C127 162 131 154 127 146" stroke="#5D4037" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M116 280 C106 273 102 265 107 257" stroke="#5D4037" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M242 4 C244 48 236 88 243 130 C250 172 238 212 244 254 C250 296 240 330 243 356"
            stroke="#5D4037" stroke-width="6" fill="none" stroke-linecap="round"/>
      <path d="M243 62 C253 55 257 47 252 39"   stroke="#5D4037" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M244 182 C233 174 229 166 234 158" stroke="#5D4037" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M244 294 C255 287 259 279 254 271" stroke="#5D4037" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M4 118 C48 116 88 124 130 117 C172 110 212 122 254 116 C296 110 330 120 356 117"
            stroke="#5D4037" stroke-width="6" fill="none" stroke-linecap="round"/>
      <path d="M50 117 C44 107 37 103 30 107"   stroke="#5D4037" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M170 116 C162 127 154 131 146 127" stroke="#5D4037" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M280 116 C273 106 265 102 257 107" stroke="#5D4037" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M4 242 C48 244 88 236 130 243 C172 250 212 238 254 244 C296 250 330 240 356 243"
            stroke="#5D4037" stroke-width="6" fill="none" stroke-linecap="round"/>
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
  }

  // =============================================================
  // BOARD SETUP
  // =============================================================

  let boardReady = false;

  function setupBoard() {
    if (boardReady) return;
    boardReady = true;
    document.getElementById('board').insertAdjacentHTML('afterbegin', boardSVG());
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
    selectedIndex = null;
    document.querySelectorAll('.cell').forEach(cell => {
      cell.innerHTML = '';
      cell.classList.remove('played', 'win-cell', 'piece-selected', 'drop-target');
    });
    setMoveHint('');
  }

  // =============================================================
  // PIECE RENDERING
  // =============================================================

  function pieceHTML(player) {
    return `<div class="piece">${player === 'X' ? bunnyHeadSVG() : easterEggSVG()}</div>`;
  }

  function renderPiece(index, player) {
    const cell = document.querySelector(`.cell[data-index="${index}"]`);
    if (!cell) return;
    cell.classList.add('played');
    cell.innerHTML = pieceHTML(player);
  }

  function movePieceDOM(fromIndex, toIndex, player) {
    const fromCell = document.querySelector(`.cell[data-index="${fromIndex}"]`);
    if (fromCell) {
      fromCell.innerHTML = '';
      fromCell.classList.remove('played', 'piece-selected');
    }
    renderPiece(toIndex, player);
  }

  function markWinCells(winLine) {
    winLine.forEach(i => {
      document.querySelector(`.cell[data-index="${i}"]`)?.classList.add('win-cell');
    });
  }

  // =============================================================
  // MOVE PHASE — UI STATE
  // =============================================================

  let selectedIndex = null;

  function selectPiece(index) {
    clearSelection();
    selectedIndex = index;
    document.querySelector(`.cell[data-index="${index}"]`)?.classList.add('piece-selected');
    // Highlight empty cells as drop targets
    const state = Game.getState();
    state.board.forEach((val, i) => {
      if (val === null) {
        document.querySelector(`.cell[data-index="${i}"]`)?.classList.add('drop-target');
      }
    });
    setMoveHint('Vælg et tomt felt at flytte til');
  }

  function clearSelection() {
    selectedIndex = null;
    document.querySelectorAll('.cell.piece-selected').forEach(c => c.classList.remove('piece-selected'));
    document.querySelectorAll('.cell.drop-target').forEach(c => c.classList.remove('drop-target'));
  }

  function setMoveHint(text) {
    const el = document.getElementById('move-hint');
    if (el) el.textContent = text;
  }

  // =============================================================
  // TURN INDICATOR
  // =============================================================

  function updateTurnIndicator(state) {
    document.getElementById('turn-piece').innerHTML =
      state.currentPlayer === 'X' ? bunnyHeadSVG() : easterEggSVG();
    document.getElementById('turn-name').textContent = state.players[state.currentPlayer];

    if (state.phase === 'move' && selectedIndex === null) {
      setMoveHint('Vælg en af dine brikker');
    } else if (state.phase === 'place') {
      setMoveHint('');
    }
  }

  // =============================================================
  // CELL CLICK HANDLER
  // =============================================================

  function onCellClick(e) {
    const index = parseInt(e.currentTarget.dataset.index, 10);
    const state  = Game.getState();
    if (state.winner !== null) return;

    if (state.phase === 'place') {
      // ── Placement phase ──────────────────────────────────────
      const player = state.currentPlayer;
      if (!Game.makeMove(index)) return;

      renderPiece(index, player);
      const after = Game.getState();

      if (after.winner) {
        if (after.winLine) markWinCells(after.winLine);
        setTimeout(() => showResult(after), after.isDraw ? 400 : 700);
      } else {
        updateTurnIndicator(after);
        if (after.phase === 'move') {
          setMoveHint('Vælg en af dine brikker');
        }
      }

    } else {
      // ── Move phase ────────────────────────────────────────────
      const board = state.board;

      if (selectedIndex === null) {
        // No piece selected yet — pick one of the current player's pieces
        if (board[index] === state.currentPlayer) {
          selectPiece(index);
        }
      } else if (index === selectedIndex) {
        // Tap same piece → deselect
        clearSelection();
        setMoveHint('Vælg en af dine brikker');
      } else if (board[index] === state.currentPlayer) {
        // Tap another own piece → change selection
        selectPiece(index);
      } else if (board[index] === null) {
        // Tap empty cell → execute move
        const from   = selectedIndex;
        const player = state.currentPlayer;
        clearSelection();

        if (Game.movePiece(from, index)) {
          movePieceDOM(from, index, player);
          const after = Game.getState();

          if (after.winner) {
            if (after.winLine) markWinCells(after.winLine);
            setTimeout(() => showResult(after), after.isDraw ? 400 : 700);
          } else {
            updateTurnIndicator(after);
          }
        }
      }
      // Tap opponent's piece → do nothing
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
      decoEl.innerHTML       = '<span style="font-size:88px">🌸</span>';
      titleEl.textContent    = 'Uafgjort!';
      subtitleEl.textContent = 'En fjer i hatten til begge!';
    } else {
      const name = state.players[state.winner];
      if (state.winner === 'X') {
        decoEl.innerHTML       = pieceHTML('X');
        titleEl.textContent    = `${name} vandt!`;
        subtitleEl.textContent = '🐰 Påskekaninen triumferer!';
      } else {
        decoEl.innerHTML       = pieceHTML('O');
        titleEl.textContent    = `${name} vandt!`;
        subtitleEl.textContent = '🥚 Påskeægget er bedst!';
      }
    }

    showScreen('result');
  }

  // =============================================================
  // START SCREEN DECORATIONS
  // =============================================================

  function decorateStartScreen() {
    document.getElementById('header-deco').innerHTML =
      '<span style="font-size:52px">🌷</span>' +
      '<span style="font-size:62px">🐣</span>' +
      '<span style="font-size:52px">🌷</span>';

    const sub = document.getElementById('subtitle-pieces');
    sub.innerHTML =
      `<span class="mini-piece">${bunnyHeadSVG()}</span>` +
      `<span style="font-size:20px;color:#888;padding:0 6px;font-weight:900">vs</span>` +
      `<span class="mini-piece">${easterEggSVG()}</span>`;

    document.getElementById('bunny-icon-label').innerHTML = bunnyHeadSVG();
    document.getElementById('egg-icon-label').innerHTML   = easterEggSVG();
  }

  // =============================================================
  // INIT
  // =============================================================

  function init() {
    setupBoard();
    decorateStartScreen();

    document.getElementById('start-btn').addEventListener('click', () => {
      const p1 = document.getElementById('player1-name').value.trim() || 'Spiller 1';
      const p2 = document.getElementById('player2-name').value.trim() || 'Spiller 2';
      Game.init(p1, p2);
      resetBoard();
      updateTurnIndicator(Game.getState());
      showScreen('game');
    });

    document.getElementById('back-btn').addEventListener('click', () => {
      clearSelection();
      showScreen('start');
    });

    document.getElementById('play-again-btn').addEventListener('click', () => {
      Game.reset();
      resetBoard();
      updateTurnIndicator(Game.getState());
      showScreen('game');
    });

    document.getElementById('new-game-btn').addEventListener('click', () => {
      showScreen('start');
    });

    showScreen('start');
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', App.init);
