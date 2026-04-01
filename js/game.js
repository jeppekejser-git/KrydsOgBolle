/**
 * Game Logic Module
 *
 * Phase 1 — "place":  Each player places up to 3 pieces.
 * Phase 2 — "move":   Both players have 3 pieces on the board.
 *                      On your turn you pick one of your pieces and
 *                      move it to any empty cell.
 *
 * X = Påskekanin (bunny), O = Påskeæg (egg)
 */
const Game = (() => {
  let board          = Array(9).fill(null);
  let currentPlayer  = 'X';
  let players        = { X: 'Spiller 1', O: 'Spiller 2' };
  let piecesPlaced   = { X: 0, O: 0 };
  let phase          = 'place';   // 'place' | 'move'
  let winner         = null;
  let winLine        = null;
  let movePhaseMoves = 0;         // prevent infinite games
  const MAX_MOVE_PHASE = 60;

  const WIN_LINES = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6],
  ];

  // ── Public API ──────────────────────────────────────────────

  function init(p1Name, p2Name) {
    players = { X: p1Name || 'Spiller 1', O: p2Name || 'Spiller 2' };
    _reset();
  }

  function reset() { _reset(); }

  /** Place a piece (phase === 'place' only). Returns false if illegal. */
  function makeMove(index) {
    if (phase !== 'place') return false;
    if (board[index] !== null || winner !== null) return false;

    const player = currentPlayer;
    board[index] = player;
    piecesPlaced[player]++;

    const line = _checkWin(player);
    if (line) {
      winner  = player;
      winLine = line;
      return true;
    }

    // Both players placed all 3 → enter move phase
    if (piecesPlaced.X === 3 && piecesPlaced.O === 3) {
      phase = 'move';
    }

    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    return true;
  }

  /**
   * Move an existing piece (phase === 'move' only).
   * Returns false if illegal (wrong owner, target occupied, same cell).
   */
  function movePiece(fromIndex, toIndex) {
    if (phase !== 'move') return false;
    if (winner !== null) return false;
    if (fromIndex === toIndex) return false;
    if (board[fromIndex] !== currentPlayer) return false;
    if (board[toIndex] !== null) return false;

    board[fromIndex] = null;
    board[toIndex]   = currentPlayer;
    movePhaseMoves++;

    const line = _checkWin(currentPlayer);
    if (line) {
      winner  = currentPlayer;
      winLine = line;
      return true;
    }

    if (movePhaseMoves >= MAX_MOVE_PHASE) {
      winner = 'draw';
      return true;
    }

    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    return true;
  }

  function getState() {
    return {
      board:         [...board],
      currentPlayer,
      players:       { ...players },
      piecesPlaced:  { ...piecesPlaced },
      phase,
      winner,
      winLine:       winLine ? [...winLine] : null,
      isDraw:        winner === 'draw',
    };
  }

  // ── Private ─────────────────────────────────────────────────

  function _reset() {
    board          = Array(9).fill(null);
    currentPlayer  = 'X';
    piecesPlaced   = { X: 0, O: 0 };
    phase          = 'place';
    winner         = null;
    winLine        = null;
    movePhaseMoves = 0;
  }

  function _checkWin(player) {
    for (const line of WIN_LINES) {
      const [a, b, c] = line;
      if (board[a] === player && board[b] === player && board[c] === player) {
        return line;
      }
    }
    return null;
  }

  return { init, reset, makeMove, movePiece, getState };
})();
