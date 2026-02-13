import { useState, useEffect, useCallback, useRef } from 'react';
import Header from '../../components/feature/Header';
import SudokuBoard from '../../components/feature/SudokuBoard';
import ControlPanel from '../../components/feature/ControlPanel';
import WinModal from '../../components/feature/WinModal';
import Timer from '../../components/feature/Timer';
import {
  generatePuzzle,
  createCellGrid,
  isPuzzleSolved,
  getConflicts,
  isValidPlacement,
  Grid,
  Cell,
} from '../../utils/sudoku';

interface GameState {
  grid: Grid;
  solution: number[][];
  initialGrid: Grid;
  selectedCell: [number, number] | null;
  notesMode: boolean;
  showMistakes: boolean;
  hintsLeft: number;
  mistakes: number;
  history: Grid[];
  historyIndex: number;
  time: number;
  isPaused: boolean;
  isWon: boolean;
}

type SerializedCell = Omit<Cell, 'notes'> & { notes: number[] };
type SerializedGrid = SerializedCell[][];

interface SavedGame {
  grid: unknown;
  solution: number[][];
  initialGrid: unknown;
  difficulty: 'easy' | 'medium' | 'hard';
  time: number;
  mistakes: number;
  hintsLeft: number;
  history: unknown;
  historyIndex: number;
}

const getMaxHints = (diff: 'easy' | 'medium' | 'hard'): number => {
  return diff === 'easy' ? 5 : diff === 'medium' ? 3 : 1;
};

const cloneGrid = (grid: Grid): Grid =>
  grid.map((row) =>
    row.map((cell) => ({
      value: cell.value,
      given: cell.given,
      notes: new Set(cell.notes),
      conflict: cell.conflict,
    }))
  );

const serializeGrid = (grid: Grid): SerializedGrid =>
  grid.map((row) =>
    row.map((cell) => ({
      value: cell.value,
      given: cell.given,
      notes: Array.from(cell.notes),
      conflict: cell.conflict,
    }))
  );

const hydrateGrid = (grid: unknown): Grid => {
  const rows = Array.isArray(grid) ? grid : [];
  return rows.map((row) => {
    const cells = Array.isArray(row) ? row : [];
    return cells.map((cell) => {
      const raw = cell as Partial<SerializedCell> & { notes?: unknown };
      const notesRaw = raw.notes;
      const notes =
        Array.isArray(notesRaw) && notesRaw.every((n) => typeof n === 'number')
          ? new Set(notesRaw)
          : new Set<number>();

      return {
        value: typeof raw.value === 'number' ? raw.value : null,
        given: Boolean(raw.given),
        notes,
        conflict: Boolean(raw.conflict),
      };
    });
  });
};

export default function HomePage() {
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [gameState, setGameState] = useState<GameState | null>(null);

  const saveGame = useCallback((state: GameState, diff: 'easy' | 'medium' | 'hard') => {
    const savedGame: SavedGame = {
      grid: serializeGrid(state.grid),
      solution: state.solution,
      initialGrid: serializeGrid(state.initialGrid),
      difficulty: diff,
      time: state.time,
      mistakes: state.mistakes,
      hintsLeft: state.hintsLeft,
      history: state.history.map(serializeGrid),
      historyIndex: state.historyIndex,
    };
    localStorage.setItem('jkv-sudoku-save', JSON.stringify(savedGame));
  }, []);

  const initializeGame = useCallback((diff: 'easy' | 'medium' | 'hard') => {
    const { puzzleGrid, solutionGrid } = generatePuzzle(diff);
    const grid = createCellGrid(puzzleGrid);
    const initialGrid = cloneGrid(grid);

    const newState: GameState = {
      grid,
      solution: solutionGrid,
      initialGrid,
      selectedCell: null,
      notesMode: false,
      showMistakes: true,
      hintsLeft: getMaxHints(diff),
      mistakes: 0,
      history: [cloneGrid(grid)],
      historyIndex: 0,
      time: 0,
      isPaused: false,
      isWon: false,
    };

    setGameState(newState);
    saveGame(newState, diff);
  }, [saveGame]);

  const loadGame = useCallback((): boolean => {
    const saved = localStorage.getItem('jkv-sudoku-save');
    if (!saved) return false;

    try {
      const savedGame: SavedGame = JSON.parse(saved);
      
      const grid = hydrateGrid(savedGame.grid);
      const initialGrid = hydrateGrid(savedGame.initialGrid);
      const history = Array.isArray(savedGame.history)
        ? savedGame.history.map(hydrateGrid)
        : [cloneGrid(grid)];

      setDifficulty(savedGame.difficulty);
      setGameState({
        grid,
        solution: savedGame.solution,
        initialGrid,
        selectedCell: null,
        notesMode: false,
        showMistakes: true,
        hintsLeft: savedGame.hintsLeft,
        mistakes: savedGame.mistakes,
        history,
        historyIndex: savedGame.historyIndex,
        time: savedGame.time,
        isPaused: false,
        isWon: false,
      });

      return true;
    } catch (error) {
      console.error('Failed to load saved game:', error);
      return false;
    }
  }, []);

  const didInitRef = useRef(false);

  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;

    const loaded = loadGame();
    if (!loaded) {
      initializeGame(difficulty);
    }
  }, [difficulty, initializeGame, loadGame]);

  const isTicking = Boolean(gameState) && !gameState.isPaused && !gameState.isWon;

  useEffect(() => {
    if (!isTicking) return;

    const timer = setInterval(() => {
      setGameState((prev) => {
        if (!prev) return prev;
        const newState = { ...prev, time: prev.time + 1 };
        saveGame(newState, difficulty);
        return newState;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [difficulty, isTicking, saveGame]);

  const addToHistory = useCallback((newGrid: Grid) => {
    setGameState((prev) => {
      if (!prev) return prev;
      const newHistory = prev.history.slice(0, prev.historyIndex + 1);
      newHistory.push(cloneGrid(newGrid));
      return {
        ...prev,
        grid: newGrid,
        history: newHistory,
        historyIndex: newHistory.length - 1,
      };
    });
  }, []);

  const updateConflicts = useCallback((grid: Grid): Grid => {
    const newGrid = cloneGrid(grid);

    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        newGrid[r][c].conflict = false;
      }
    }

    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (newGrid[r][c].value && !isValidPlacement(newGrid, r, c, newGrid[r][c].value)) {
          newGrid[r][c].conflict = true;
          const conflicts = getConflicts(newGrid, r, c);
          conflicts.forEach(([cr, cc]) => {
            newGrid[cr][cc].conflict = true;
          });
        }
      }
    }

    return newGrid;
  }, []);

  const handleNumberInput = useCallback((num: number) => {
    if (!gameState || !gameState.selectedCell) return;

    const [row, col] = gameState.selectedCell;
    const cell = gameState.grid[row][col];

    if (cell.given) return;

    const newGrid = cloneGrid(gameState.grid);

    if (gameState.notesMode) {
      if (newGrid[row][col].notes.has(num)) {
        newGrid[row][col].notes.delete(num);
      } else {
        newGrid[row][col].notes.add(num);
      }
    } else {
      newGrid[row][col].value = num;
      newGrid[row][col].notes.clear();

      // Clear notes in same row, column, and box
      for (let c = 0; c < 9; c++) {
        newGrid[row][c].notes.delete(num);
      }
      for (let r = 0; r < 9; r++) {
        newGrid[r][col].notes.delete(num);
      }
      const boxRow = Math.floor(row / 3) * 3;
      const boxCol = Math.floor(col / 3) * 3;
      for (let r = boxRow; r < boxRow + 3; r++) {
        for (let c = boxCol; c < boxCol + 3; c++) {
          newGrid[r][c].notes.delete(num);
        }
      }

      if (gameState.solution[row][col] !== num) {
        setGameState((prev) => prev ? { ...prev, mistakes: prev.mistakes + 1 } : prev);
      }
    }

    const updatedGrid = updateConflicts(newGrid);
    addToHistory(updatedGrid);

    if (isPuzzleSolved(updatedGrid, gameState.solution)) {
      setGameState((prev) => prev ? { ...prev, isWon: true, grid: updatedGrid } : prev);
    }
  }, [addToHistory, gameState, updateConflicts]);

  const handleClearCell = useCallback(() => {
    if (!gameState || !gameState.selectedCell) return;

    const [row, col] = gameState.selectedCell;
    const cell = gameState.grid[row][col];

    if (cell.given) return;

    const newGrid = cloneGrid(gameState.grid);
    
    newGrid[row][col].value = null;
    newGrid[row][col].notes.clear();

    const updatedGrid = updateConflicts(newGrid);
    addToHistory(updatedGrid);
  }, [addToHistory, gameState, updateConflicts]);

  const handleClearAll = () => {
    if (!gameState || gameState.isPaused || gameState.isWon) return;

    const newGrid = cloneGrid(gameState.grid);
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (!newGrid[r][c].given) {
          newGrid[r][c].value = null;
          newGrid[r][c].notes.clear();
        }
      }
    }

    const updatedGrid = updateConflicts(newGrid);
    addToHistory(updatedGrid);
    setGameState((prev) => (prev ? { ...prev, isWon: false } : prev));
  };

  useEffect(() => {
    if (!gameState) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState.isPaused || gameState.isWon) return;

      const { selectedCell } = gameState;
      if (!selectedCell) return;

      const [row, col] = selectedCell;

      // Number input
      if (e.key >= '1' && e.key <= '9') {
        e.preventDefault();
        handleNumberInput(parseInt(e.key));
      }

      // Clear cell
      if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault();
        handleClearCell();
      }

      // Notes mode toggle
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setGameState((prev) => (prev ? { ...prev, notesMode: !prev.notesMode } : prev));
      }

      // Arrow key navigation
      if (e.key.startsWith('Arrow')) {
        e.preventDefault();
        let newRow = row;
        let newCol = col;

        if (e.key === 'ArrowUp') newRow = Math.max(0, row - 1);
        if (e.key === 'ArrowDown') newRow = Math.min(8, row + 1);
        if (e.key === 'ArrowLeft') newCol = Math.max(0, col - 1);
        if (e.key === 'ArrowRight') newCol = Math.min(8, col + 1);

        setGameState((prev) => prev ? { ...prev, selectedCell: [newRow, newCol] } : prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, handleClearCell, handleNumberInput]);

  const handleHint = () => {
    if (!gameState || !gameState.selectedCell || gameState.hintsLeft === 0) return;

    const [row, col] = gameState.selectedCell;
    const cell = gameState.grid[row][col];

    if (cell.given || cell.value === gameState.solution[row][col]) return;

    const newGrid = cloneGrid(gameState.grid);
    
    newGrid[row][col].value = gameState.solution[row][col];
    newGrid[row][col].notes.clear();

    const updatedGrid = updateConflicts(newGrid);
    addToHistory(updatedGrid);

    setGameState((prev) => prev ? { ...prev, hintsLeft: prev.hintsLeft - 1 } : prev);

    if (isPuzzleSolved(updatedGrid, gameState.solution)) {
      setGameState((prev) => prev ? { ...prev, isWon: true, grid: updatedGrid } : prev);
    }
  };

  const handleUndo = () => {
    if (!gameState || gameState.historyIndex === 0) return;

    const newIndex = gameState.historyIndex - 1;
    const newGrid = cloneGrid(gameState.history[newIndex]);

    setGameState((prev) => prev ? {
      ...prev,
      grid: newGrid,
      historyIndex: newIndex,
    } : prev);
  };

  const handleRedo = () => {
    if (!gameState || gameState.historyIndex >= gameState.history.length - 1) return;

    const newIndex = gameState.historyIndex + 1;
    const newGrid = cloneGrid(gameState.history[newIndex]);

    setGameState((prev) => prev ? {
      ...prev,
      grid: newGrid,
      historyIndex: newIndex,
    } : prev);
  };

  const handleRestart = () => {
    if (!gameState) return;

    const newGrid = cloneGrid(gameState.initialGrid);
    setGameState({
      ...gameState,
      grid: newGrid,
      selectedCell: null,
      mistakes: 0,
      hintsLeft: getMaxHints(difficulty),
      history: [newGrid],
      historyIndex: 0,
      time: 0,
      isWon: false,
    });
  };

  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-cyan-50">
        <div className="text-2xl font-semibold text-teal-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50">
      <Header
        difficulty={difficulty}
        onDifficultyChange={setDifficulty}
        onNewGame={() => initializeGame(difficulty)}
      />

      <main className="container mx-auto px-4 py-6 md:py-8">
	        <div className="max-w-6xl mx-auto">
	          <Timer time={gameState.time} isPaused={gameState.isPaused} />

	          {gameState.notesMode && !gameState.isPaused && !gameState.isWon ? (
	            <div className="max-w-md mx-auto mt-3 mb-4 px-4 py-2 rounded-lg bg-teal-100 text-teal-800 text-sm font-medium flex items-center justify-between">
	              <span className="flex items-center gap-2">
	                <i className="ri-pencil-line"></i>
	                Notes mode is ON (press N to toggle)
	              </span>
	              <button
	                className="text-teal-800/80 hover:text-teal-900 underline"
	                onClick={() =>
	                  setGameState((prev) => (prev ? { ...prev, notesMode: false } : prev))
	                }
	              >
	                Turn off
	              </button>
	            </div>
	          ) : null}

	          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            <div>
              <SudokuBoard
                grid={gameState.grid}
                selectedCell={gameState.selectedCell}
                showMistakes={gameState.showMistakes}
                onCellClick={(row, col) => {
                  if (!gameState.isPaused && !gameState.isWon) {
                    setGameState((prev) => prev ? { ...prev, selectedCell: [row, col] } : prev);
                  }
                }}
              />
            </div>

            <div>
              <ControlPanel
                notesMode={gameState.notesMode}
                showMistakes={gameState.showMistakes}
                hintsLeft={gameState.hintsLeft}
                isPaused={gameState.isPaused}
                canUndo={gameState.historyIndex > 0}
                canRedo={gameState.historyIndex < gameState.history.length - 1}
                onNumberClick={handleNumberInput}
                onNotesToggle={() =>
                  setGameState((prev) => prev ? { ...prev, notesMode: !prev.notesMode } : prev)
                }
                onShowMistakesToggle={() =>
                  setGameState((prev) => prev ? { ...prev, showMistakes: !prev.showMistakes } : prev)
                }
	                onHint={handleHint}
	                onUndo={handleUndo}
	                onRedo={handleRedo}
	                onClear={handleClearAll}
	                onNewGame={() => initializeGame(difficulty)}
	                onRestart={handleRestart}
	                onPauseToggle={() =>
	                  setGameState((prev) => prev ? { ...prev, isPaused: !prev.isPaused } : prev)
	                }
              />
            </div>
          </div>
        </div>
      </main>

      <WinModal
        isOpen={gameState.isWon}
        difficulty={difficulty}
        time={formatTime(gameState.time)}
        mistakes={gameState.mistakes}
        onNewGame={() => {
          initializeGame(difficulty);
        }}
        onClose={() => setGameState((prev) => prev ? { ...prev, isWon: false } : prev)}
      />
    </div>
  );
}
