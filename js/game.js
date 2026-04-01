/**
 * Game Logic Module
 * X = Påskekanin (bunny), O = Påskeæg (egg)
 */
const Game = (() => {
  let board        = Array(9).fill(null);
  let currentPlayer = 'X';
  let players      = { X: 'Spiller 1', O: 'Spiller 2' };
  let winner       = null;
  let winLine      = null;
  let moveCount    = 0;

  const WIN_LINES = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],  // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8],  // cols
    [0, 4, 8], [2, 4, 6],             // diags
  ];

  function init(p1Name, p2Name) {
    players = { X: p1Name || 'Spiller 1', O: p2Name || 'Spiller 2' };
    _reset();
  }

  function reset() {
    _reset();
  }

  function _reset() {
    board         = Array(9).fill(null);
    currentPlayer = 'X';
    winner        = null;
    winLine       = null;
    moveCount     = 0;
  }

  function makeMove(index) {
    if (board[index] !== null || winner !== null) return false;
    const player  = currentPlayer;
    board[index]  = player;
    moveCount++;

    const line = _checkWin(player);
    if (line) {
      winner  = player;
      winLine = line;
    } else if (moveCount === 9) {
      winner = 'draw';
    } else {
      currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    }
    return true;
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

  function getState() {
    return {
      board:         [...board],
      currentPlayer,
      players:       { ...players },
      winner,
      winLine:       winLine ? [...winLine] : null,
      isDraw:        winner === 'draw',
    };
  }

  return { init, reset, makeMove, getState };
})();
