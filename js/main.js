import { MinesweeperGame } from './game.js';
import { Timer } from './timer.js';
import { getBestTime, setBestTime, getDarkMode, setDarkMode } from './storage.js';

const boardEl = document.getElementById('board');
const mineCountEl = document.getElementById('mine-count');
const timerEl = document.getElementById('timer');
const newGameBtn = document.getElementById('new-game-btn');
const difficultySelect = document.getElementById('difficulty-select');
const darkModeToggle = document.getElementById('dark-mode-toggle');
const bestTimeEl = document.getElementById('best-time');
const modal = document.getElementById('result-modal');
const modalTitle = document.getElementById('modal-title');
const modalMessage = document.getElementById('modal-message');
const modalCloseBtn = document.getElementById('modal-close-btn');

let game;
let timer;
let cellEls = [];

function formatTime(seconds) {
  return String(Math.min(seconds, 999)).padStart(3, '0');
}

function init(difficultyKey) {
  game = new MinesweeperGame(difficultyKey);
  timer = new Timer((seconds) => {
    timerEl.textContent = formatTime(seconds);
  });
  renderBoard();
  updateMineCount();
  timerEl.textContent = formatTime(0);
  updateBestTime();
  newGameBtn.textContent = '🙂';
  hideModal();
}

function renderBoard() {
  boardEl.innerHTML = '';
  boardEl.style.setProperty('--cols', game.cols);
  cellEls = [];

  for (let r = 0; r < game.rows; r++) {
    const rowEls = [];
    for (let c = 0; c < game.cols; c++) {
      const cellEl = document.createElement('button');
      cellEl.type = 'button';
      cellEl.className = 'cell';
      cellEl.dataset.row = String(r);
      cellEl.dataset.col = String(c);
      cellEl.addEventListener('click', () => onLeftClick(r, c));
      cellEl.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        onRightClick(r, c);
      });
      boardEl.appendChild(cellEl);
      rowEls.push(cellEl);
    }
    cellEls.push(rowEls);
  }
}

function onLeftClick(row, col) {
  if (game.gameOver) return;
  if (!game.firstClickDone) timer.start();

  const result = game.openCell(row, col);
  result.changed.forEach(({ row: r, col: c }) => renderCell(r, c));

  if (result.gameOver) {
    timer.stop();
    finishGame(result.won);
  }
}

function onRightClick(row, col) {
  if (game.gameOver) return;
  if (game.toggleFlag(row, col)) {
    renderCell(row, col);
    updateMineCount();
  }
}

function renderCell(row, col) {
  const cell = game.board[row][col];
  const el = cellEls[row][col];
  el.className = 'cell';

  if (cell.flagged && !cell.revealed) {
    el.classList.add('flagged');
    el.textContent = '🚩';
    return;
  }

  if (!cell.revealed) {
    el.textContent = '';
    return;
  }

  el.classList.add('revealed');

  if (cell.mine) {
    el.classList.add('mine');
    if (cell.exploded) el.classList.add('exploded');
    el.textContent = '💣';
    return;
  }

  if (cell.adjacent > 0) {
    el.classList.add(`n${cell.adjacent}`);
    el.textContent = String(cell.adjacent);
  } else {
    el.textContent = '';
  }
}

function renderFullBoard() {
  for (let r = 0; r < game.rows; r++) {
    for (let c = 0; c < game.cols; c++) {
      renderCell(r, c);
      const cell = game.board[r][c];
      if (game.gameOver && !game.won && cell.flagged && !cell.mine) {
        cellEls[r][c].classList.add('wrong-flag');
        cellEls[r][c].textContent = '❌';
      }
    }
  }
}

function updateMineCount() {
  mineCountEl.textContent = String(Math.max(game.remainingMines, 0)).padStart(3, '0');
}

function updateBestTime() {
  const best = getBestTime(game.difficultyKey);
  bestTimeEl.textContent = best !== null ? `최고 기록: ${best}초` : '최고 기록: -';
}

function finishGame(won) {
  renderFullBoard();
  newGameBtn.textContent = won ? '😎' : '😵';

  if (won) {
    const seconds = timer.seconds;
    const best = getBestTime(game.difficultyKey);
    const isNewRecord = best === null || seconds < best;
    if (isNewRecord) setBestTime(game.difficultyKey, seconds);
    updateBestTime();
    showModal('승리!', isNewRecord ? `신기록입니다! ${seconds}초` : `클리어! ${seconds}초`);
  } else {
    showModal('패배', '지뢰를 밟았습니다.');
  }
}

function showModal(title, message) {
  modalTitle.textContent = title;
  modalMessage.textContent = message;
  modal.classList.remove('hidden');
}

function hideModal() {
  modal.classList.add('hidden');
}

function initDarkMode() {
  const isDark = getDarkMode();
  document.body.classList.toggle('dark', isDark);
  darkModeToggle.textContent = isDark ? '☀️' : '🌙';
}

difficultySelect.addEventListener('change', () => {
  init(difficultySelect.value);
});

newGameBtn.addEventListener('click', () => {
  init(game.difficultyKey);
});

modalCloseBtn.addEventListener('click', () => {
  hideModal();
});

darkModeToggle.addEventListener('click', () => {
  const isDark = !document.body.classList.contains('dark');
  document.body.classList.toggle('dark', isDark);
  setDarkMode(isDark);
  darkModeToggle.textContent = isDark ? '☀️' : '🌙';
});

initDarkMode();
init(difficultySelect.value);
