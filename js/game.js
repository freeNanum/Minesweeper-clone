import { createEmptyBoard, placeMines } from './board.js';

export const DIFFICULTIES = {
  beginner: { label: '초급', rows: 9, cols: 9, mines: 10 },
  intermediate: { label: '중급', rows: 16, cols: 16, mines: 40 },
  expert: { label: '고급', rows: 16, cols: 30, mines: 99 },
};

export class MinesweeperGame {
  constructor(difficultyKey) {
    this.setDifficulty(difficultyKey);
  }

  setDifficulty(difficultyKey) {
    const { rows, cols, mines } = DIFFICULTIES[difficultyKey];
    this.difficultyKey = difficultyKey;
    this.rows = rows;
    this.cols = cols;
    this.mineCount = mines;
    this.reset();
  }

  reset() {
    this.board = createEmptyBoard(this.rows, this.cols);
    this.firstClickDone = false;
    this.gameOver = false;
    this.won = false;
    this.flagCount = 0;
    this.revealedSafeCount = 0;
  }

  get remainingMines() {
    return this.mineCount - this.flagCount;
  }

  openCell(row, col) {
    const cell = this.board[row][col];
    if (this.gameOver || cell.flagged || cell.revealed) {
      return { changed: [], gameOver: this.gameOver };
    }

    if (!this.firstClickDone) {
      placeMines(this.board, this.rows, this.cols, this.mineCount, row, col);
      this.firstClickDone = true;
    }

    if (cell.mine) {
      this.gameOver = true;
      this.won = false;
      const changed = this.revealAllMines(row, col);
      return { changed, gameOver: true, won: false };
    }

    const changed = this.floodReveal(row, col);

    if (this.revealedSafeCount === this.rows * this.cols - this.mineCount) {
      this.gameOver = true;
      this.won = true;
      return { changed, gameOver: true, won: true };
    }

    return { changed, gameOver: false };
  }

  floodReveal(row, col) {
    const changed = [];
    const stack = [[row, col]];
    const visited = new Set();

    while (stack.length) {
      const [r, c] = stack.pop();
      const key = `${r},${c}`;
      if (visited.has(key)) continue;
      visited.add(key);

      const cell = this.board[r][c];
      if (cell.revealed || cell.flagged) continue;

      cell.revealed = true;
      this.revealedSafeCount++;
      changed.push({ row: r, col: c });

      if (cell.adjacent === 0) {
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < this.rows && nc >= 0 && nc < this.cols) {
              const neighbor = this.board[nr][nc];
              if (!neighbor.revealed && !neighbor.flagged && !neighbor.mine) {
                stack.push([nr, nc]);
              }
            }
          }
        }
      }
    }

    return changed;
  }

  revealAllMines(explodedRow, explodedCol) {
    const changed = [];
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const cell = this.board[r][c];
        if (cell.mine && !cell.revealed) {
          cell.revealed = true;
          cell.exploded = r === explodedRow && c === explodedCol;
          changed.push({ row: r, col: c });
        }
      }
    }
    return changed;
  }

  toggleFlag(row, col) {
    const cell = this.board[row][col];
    if (this.gameOver || cell.revealed) return false;
    cell.flagged = !cell.flagged;
    this.flagCount += cell.flagged ? 1 : -1;
    return true;
  }
}
