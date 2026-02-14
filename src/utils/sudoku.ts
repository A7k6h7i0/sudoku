// Sudoku Engine - Generator and Solver

export interface Cell {
  value: number | null;
  given: boolean;
  notes: Set<number>;
  conflict: boolean;
}

export type Grid = Cell[][];

// Check if placing a value at position is valid
export function isValidPlacement(
  grid: Grid,
  row: number,
  col: number,
  value: number
): boolean {
  // Check row
  for (let c = 0; c < 9; c++) {
    if (c !== col && grid[row][c].value === value) {
      return false;
    }
  }

  // Check column
  for (let r = 0; r < 9; r++) {
    if (r !== row && grid[r][col].value === value) {
      return false;
    }
  }

  // Check 3x3 box
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if ((r !== row || c !== col) && grid[r][c].value === value) {
        return false;
      }
    }
  }

  return true;
}

// Solve sudoku using backtracking
export function solveSudoku(grid: number[][]): boolean {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid[row][col] === 0) {
        for (let num = 1; num <= 9; num++) {
          if (isValidNumber(grid, row, col, num)) {
            grid[row][col] = num;
            if (solveSudoku(grid)) {
              return true;
            }
            grid[row][col] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
}

function isValidNumber(
  grid: number[][],
  row: number,
  col: number,
  num: number
): boolean {
  // Check row
  for (let c = 0; c < 9; c++) {
    if (grid[row][c] === num) return false;
  }

  // Check column
  for (let r = 0; r < 9; r++) {
    if (grid[r][col] === num) return false;
  }

  // Check 3x3 box
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if (grid[r][c] === num) return false;
    }
  }

  return true;
}

// Count solutions (for uniqueness check)
function countSolutions(grid: number[][], limit: number = 2): number {
  let count = 0;

  function solve(): boolean {
    if (count >= limit) return true;

    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (grid[row][col] === 0) {
          for (let num = 1; num <= 9; num++) {
            if (isValidNumber(grid, row, col, num)) {
              grid[row][col] = num;
              if (solve()) return true;
              grid[row][col] = 0;
            }
          }
          return false;
        }
      }
    }
    count++;
    return false;
  }

  solve();
  return count;
}

// Generate a fully solved valid grid
export function generateSolvedGrid(): number[][] {
  const grid: number[][] = Array(9)
    .fill(0)
    .map(() => Array(9).fill(0));

  // Fill diagonal 3x3 boxes first (they don't affect each other)
  for (let box = 0; box < 9; box += 3) {
    fillBox(grid, box, box);
  }

  // Solve the rest
  solveSudoku(grid);
  return grid;
}

function fillBox(grid: number[][], row: number, col: number): void {
  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  shuffleArray(numbers);

  let idx = 0;
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      grid[row + r][col + c] = numbers[idx++];
    }
  }
}

function shuffleArray<T>(array: T[]): void {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// Generate puzzle with unique solution
export function generatePuzzle(difficulty: 'easy' | 'medium' | 'hard'): {
  puzzleGrid: number[][];
  solutionGrid: number[][];
} {
  // Ultra-easy: leave exactly one empty cell per row (9 empties total).
  if (difficulty === 'easy') {
    for (let attempt = 0; attempt < 50; attempt++) {
      const solutionGrid = generateSolvedGrid();
      const puzzleGrid = solutionGrid.map((row) => [...row]);

      for (let r = 0; r < 9; r++) {
        const col = Math.floor(Math.random() * 9);
        puzzleGrid[r][col] = 0;
      }

      // Keep uniqueness (should almost always pass with only 9 blanks, but verify).
      const testGrid = puzzleGrid.map((r) => [...r]);
      const solutions = countSolutions(testGrid, 2);
      if (solutions === 1) {
        return { puzzleGrid, solutionGrid };
      }
    }

    // Fallback without uniqueness enforcement (very unlikely to hit).
    const solutionGrid = generateSolvedGrid();
    const puzzleGrid = solutionGrid.map((row) => [...row]);
    for (let r = 0; r < 9; r++) {
      const col = Math.floor(Math.random() * 9);
      puzzleGrid[r][col] = 0;
    }
    return { puzzleGrid, solutionGrid };
  }

  // Determine number of cells to remove
  // Fewer removals => easier. Keep "easy" noticeably easier while still leaving
  // enough blanks for play.
  const cellsToRemove = difficulty === 'medium' ? 42 : 57;

  // Requirement: every row and every column must have at least 2 empty cells.
  const minEmptyPerRowCol = 2;

  const meetsRowColMinimums = (grid: number[][]): boolean => {
    for (let r = 0; r < 9; r++) {
      let empties = 0;
      for (let c = 0; c < 9; c++) {
        if (grid[r][c] === 0) empties++;
      }
      if (empties < minEmptyPerRowCol) return false;
    }
    for (let c = 0; c < 9; c++) {
      let empties = 0;
      for (let r = 0; r < 9; r++) {
        if (grid[r][c] === 0) empties++;
      }
      if (empties < minEmptyPerRowCol) return false;
    }
    return true;
  };

  for (let attempt = 0; attempt < 25; attempt++) {
    const solutionGrid = generateSolvedGrid();
    const puzzleGrid = solutionGrid.map((row) => [...row]);

    const positions: [number, number][] = [];
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        positions.push([r, c]);
      }
    }
    shuffleArray(positions);

    const removedInRow = Array(9).fill(0);
    const removedInCol = Array(9).fill(0);
    const canRemove = (row: number, col: number): boolean => puzzleGrid[row][col] !== 0;

    const tryRemove = (row: number, col: number): boolean => {
      if (!canRemove(row, col)) return false;

      const backup = puzzleGrid[row][col];
      puzzleGrid[row][col] = 0;

      // Check uniqueness
      const testGrid = puzzleGrid.map((r) => [...r]);
      const solutions = countSolutions(testGrid, 2);

      if (solutions === 1) {
        removedInRow[row]++;
        removedInCol[col]++;
        return true;
      }

      puzzleGrid[row][col] = backup;
      return false;
    };

    let removed = 0;

    // Phase 1: satisfy per-row minimum empties
    for (let row = 0; row < 9 && removed < cellsToRemove; row++) {
      let guard = 0;
      while (removedInRow[row] < minEmptyPerRowCol && removed < cellsToRemove && guard < 200) {
        guard++;
        const cols = Array.from({ length: 9 }, (_, c) => c);
        shuffleArray(cols);
        let didRemove = false;
        for (const col of cols) {
          if (tryRemove(row, col)) {
            removed++;
            didRemove = true;
            break;
          }
        }
        if (!didRemove) break;
      }
    }

    // Phase 2: satisfy per-column minimum empties
    for (let col = 0; col < 9 && removed < cellsToRemove; col++) {
      let guard = 0;
      while (removedInCol[col] < minEmptyPerRowCol && removed < cellsToRemove && guard < 200) {
        guard++;
        const rows = Array.from({ length: 9 }, (_, r) => r);
        shuffleArray(rows);
        let didRemove = false;
        for (const row of rows) {
          if (tryRemove(row, col)) {
            removed++;
            didRemove = true;
            break;
          }
        }
        if (!didRemove) break;
      }
    }

    // Phase 3: remove remaining cells randomly
    for (const [row, col] of positions) {
      if (removed >= cellsToRemove) break;
      if (tryRemove(row, col)) removed++;
    }

    if (meetsRowColMinimums(puzzleGrid)) {
      return { puzzleGrid, solutionGrid };
    }
  }

  // Fallback (should be rare): return a normal unique puzzle without the row/col constraint.
  const solutionGrid = generateSolvedGrid();
  const puzzleGrid = solutionGrid.map((row) => [...row]);
  const positions: [number, number][] = [];
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      positions.push([r, c]);
    }
  }
  shuffleArray(positions);

  let removed = 0;
  for (const [row, col] of positions) {
    if (removed >= cellsToRemove) break;

    const backup = puzzleGrid[row][col];
    puzzleGrid[row][col] = 0;

    const testGrid = puzzleGrid.map((r) => [...r]);
    const solutions = countSolutions(testGrid, 2);

    if (solutions === 1) {
      removed++;
    } else {
      puzzleGrid[row][col] = backup;
    }
  }

  return { puzzleGrid, solutionGrid };
}

// Convert number grid to Cell grid
export function createCellGrid(puzzleGrid: number[][]): Grid {
  return puzzleGrid.map((row) =>
    row.map((value) => ({
      value: value === 0 ? null : value,
      given: value !== 0,
      notes: new Set<number>(),
      conflict: false,
    }))
  );
}

// Check if puzzle is solved
export function isPuzzleSolved(grid: Grid, solution: number[][]): boolean {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (grid[r][c].value !== solution[r][c]) {
        return false;
      }
    }
  }
  return true;
}

// Get conflicts for a cell
export function getConflicts(
  grid: Grid,
  row: number,
  col: number
): [number, number][] {
  const conflicts: [number, number][] = [];
  const value = grid[row][col].value;

  if (!value) return conflicts;

  // Check row
  for (let c = 0; c < 9; c++) {
    if (c !== col && grid[row][c].value === value) {
      conflicts.push([row, c]);
    }
  }

  // Check column
  for (let r = 0; r < 9; r++) {
    if (r !== row && grid[r][col].value === value) {
      conflicts.push([r, col]);
    }
  }

  // Check 3x3 box
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if ((r !== row || c !== col) && grid[r][c].value === value) {
        conflicts.push([r, c]);
      }
    }
  }

  return conflicts;
}
