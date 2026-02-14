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
  const randInt = (min: number, max: number): number =>
    Math.floor(Math.random() * (max - min + 1)) + min;

  const getRowEmptyTargets = (): number[] => {
    if (difficulty === 'easy') {
      // Easy: 1 empty per row, and in 2–3 random rows add one extra empty (=> 2 empties).
      const targets = Array(9).fill(1);
      const extraRows = randInt(2, 3);
      const rows = Array.from({ length: 9 }, (_, r) => r);
      shuffleArray(rows);
      for (let i = 0; i < extraRows; i++) targets[rows[i]] = 2;
      return targets;
    }

    if (difficulty === 'medium') {
      // Medium: 3–4 empty boxes in each row.
      return Array.from({ length: 9 }, () => randInt(3, 4));
    }

    // Hard: 4–6 empty boxes in each row.
    return Array.from({ length: 9 }, () => randInt(4, 6));
  };

  const countRowEmpties = (grid: number[][], row: number): number => {
    let empties = 0;
    for (let c = 0; c < 9; c++) if (grid[row][c] === 0) empties++;
    return empties;
  };

  const buildPuzzle = (
    solutionGrid: number[][],
    rowTargets: number[],
    enforceUniqueness: boolean
  ): number[][] | null => {
    const puzzleGrid = solutionGrid.map((row) => [...row]);

    const canRemove = (row: number, col: number): boolean => puzzleGrid[row][col] !== 0;
    const tryRemove = (row: number, col: number): boolean => {
      if (!canRemove(row, col)) return false;

      const backup = puzzleGrid[row][col];
      puzzleGrid[row][col] = 0;

      if (!enforceUniqueness) return true;

      const testGrid = puzzleGrid.map((r) => [...r]);
      const solutions = countSolutions(testGrid, 2);
      if (solutions === 1) return true;

      puzzleGrid[row][col] = backup;
      return false;
    };

    const rows = Array.from({ length: 9 }, (_, r) => r);
    shuffleArray(rows);

    for (const row of rows) {
      const target = rowTargets[row] ?? 0;
      let guard = 0;
      while (countRowEmpties(puzzleGrid, row) < target && guard < 500) {
        guard++;
        const cols = Array.from({ length: 9 }, (_, c) => c);
        shuffleArray(cols);

        let removed = false;
        for (const col of cols) {
          if (tryRemove(row, col)) {
            removed = true;
            break;
          }
        }

        if (!removed) return null;
      }

      if (countRowEmpties(puzzleGrid, row) !== target) return null;
    }

    return puzzleGrid;
  };

  for (let attempt = 0; attempt < 80; attempt++) {
    const solutionGrid = generateSolvedGrid();
    const rowTargets = getRowEmptyTargets();
    const puzzleGrid = buildPuzzle(solutionGrid, rowTargets, true);
    if (puzzleGrid) return { puzzleGrid, solutionGrid };
  }

  // Fallback: still meet the per-row empty requirements, but skip uniqueness enforcement.
  const solutionGrid = generateSolvedGrid();
  const rowTargets = getRowEmptyTargets();
  const puzzleGrid = buildPuzzle(solutionGrid, rowTargets, false);
  return {
    puzzleGrid: puzzleGrid ?? solutionGrid.map((row) => [...row]),
    solutionGrid,
  };
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
