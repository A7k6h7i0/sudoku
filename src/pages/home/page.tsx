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
  // Settings
  darkMode: boolean;
  timerEnabled: boolean;
  soundEnabled: boolean;
  musicEnabled: boolean;
  lightningMode: boolean;
  autoNotes: boolean;
  highlightRowCol: boolean;
  autoRemoveNotes: boolean;
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
  darkMode: boolean;
  timerEnabled: boolean;
  soundEnabled?: boolean;
  musicEnabled?: boolean;
  lightningMode: boolean;
  autoNotes: boolean;
  highlightRowCol: boolean;
  autoRemoveNotes: boolean;
}

const getMaxHints = (diff: 'easy' | 'medium' | 'hard'): number => {
  return diff === 'easy' ? 7 : diff === 'medium' ? 3 : 1;
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

  const audioContextRef = useRef<AudioContext | null>(null);
  const musicNodesRef = useRef<{
    osc1: OscillatorNode;
    osc2: OscillatorNode;
    gain: GainNode;
  } | null>(null);

  const getAudioContext = (): AudioContext | null => {
    if (typeof window === 'undefined') return null;
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return null;

    if (!audioContextRef.current) {
      audioContextRef.current = new AudioCtx();
    }

    if (audioContextRef.current.state === 'suspended') {
      void audioContextRef.current.resume();
    }

    return audioContextRef.current;
  };

  const playSfx = useCallback((kind: 'place' | 'wrong' | 'win') => {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (kind === 'place') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(740, now);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.06, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.09);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (kind === 'wrong') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(180, now);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.08, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);
      osc.start(now);
      osc.stop(now + 0.15);
    } else {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.08, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);
      osc.start(now);
      osc.stop(now + 0.3);
    }

    osc.connect(gain);
    gain.connect(ctx.destination);
  }, []);

  const startMusic = useCallback(() => {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (musicNodesRef.current) return;

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.02, ctx.currentTime + 0.2);

    const osc1 = ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(220, ctx.currentTime);

    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(330, ctx.currentTime);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start();
    osc2.start();

    musicNodesRef.current = { osc1, osc2, gain };
  }, []);

  const stopMusic = useCallback(() => {
    const ctx = audioContextRef.current;
    const nodes = musicNodesRef.current;
    if (!ctx || !nodes) return;

    const now = ctx.currentTime;
    nodes.gain.gain.cancelScheduledValues(now);
    nodes.gain.gain.setValueAtTime(Math.max(nodes.gain.gain.value, 0.0001), now);
    nodes.gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);

    nodes.osc1.stop(now + 0.16);
    nodes.osc2.stop(now + 0.16);
    musicNodesRef.current = null;
  }, []);

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
      darkMode: state.darkMode,
      timerEnabled: state.timerEnabled,
      soundEnabled: state.soundEnabled,
      musicEnabled: state.musicEnabled,
      lightningMode: state.lightningMode,
      autoNotes: state.autoNotes,
      highlightRowCol: state.highlightRowCol,
      autoRemoveNotes: state.autoRemoveNotes,
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
	      darkMode: false,
	      timerEnabled: true,
	      soundEnabled: true,
	      musicEnabled: false,
	      lightningMode: false,
	      autoNotes: false,
	      highlightRowCol: true,
	      autoRemoveNotes: true,
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
	        darkMode: savedGame.darkMode ?? false,
	        timerEnabled: savedGame.timerEnabled ?? true,
	        soundEnabled: savedGame.soundEnabled ?? true,
	        musicEnabled: savedGame.musicEnabled ?? false,
	        lightningMode: savedGame.lightningMode ?? false,
	        autoNotes: savedGame.autoNotes ?? false,
	        highlightRowCol: savedGame.highlightRowCol ?? true,
	        autoRemoveNotes: savedGame.autoRemoveNotes ?? true,
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

  useEffect(() => {
    if (!gameState) return;
    if (!gameState.musicEnabled || gameState.isPaused || gameState.isWon) {
      stopMusic();
      return;
    }
    startMusic();
  }, [gameState, startMusic, stopMusic]);

  useEffect(() => {
    return () => {
      stopMusic();
    };
  }, [stopMusic]);

  const prevWonRef = useRef(false);
  useEffect(() => {
    if (!gameState) return;
    if (!prevWonRef.current && gameState.isWon && gameState.soundEnabled) {
      playSfx('win');
    }
    prevWonRef.current = gameState.isWon;
  }, [gameState, playSfx]);

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

      const isWrong = gameState.solution[row][col] !== num;
      if (isWrong) {
        setGameState((prev) => prev ? { ...prev, mistakes: prev.mistakes + 1 } : prev);
        if (gameState.soundEnabled) playSfx('wrong');
      } else if (gameState.soundEnabled) {
        playSfx('place');
      }
    }

    const updatedGrid = updateConflicts(newGrid);
    addToHistory(updatedGrid);

    if (isPuzzleSolved(updatedGrid, gameState.solution)) {
      setGameState((prev) => prev ? { ...prev, isWon: true, grid: updatedGrid } : prev);
    }
  }, [addToHistory, gameState, playSfx, updateConflicts]);

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
    if (gameState.soundEnabled) playSfx('place');

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

  const toggleDarkMode = () => {
    setGameState((prev) => prev ? { ...prev, darkMode: !prev.darkMode } : prev);
  };

  const toggleTimer = () => {
    setGameState((prev) => prev ? { ...prev, timerEnabled: !prev.timerEnabled } : prev);
  };

  const toggleSound = () => {
    setGameState((prev) => {
      if (!prev) return prev;
      const newState = { ...prev, soundEnabled: !prev.soundEnabled };
      saveGame(newState, difficulty);
      return newState;
    });
  };

  const toggleMusic = () => {
    setGameState((prev) => {
      if (!prev) return prev;
      const newState = { ...prev, musicEnabled: !prev.musicEnabled };
      saveGame(newState, difficulty);
      return newState;
    });
  };

  const toggleLightningMode = () => {
    setGameState((prev) => prev ? { ...prev, lightningMode: !prev.lightningMode } : prev);
  };

  const toggleAutoNotes = () => {
    setGameState((prev) => prev ? { ...prev, autoNotes: !prev.autoNotes } : prev);
  };

  const toggleHighlightRowCol = () => {
    setGameState((prev) => prev ? { ...prev, highlightRowCol: !prev.highlightRowCol } : prev);
  };

  const toggleAutoRemoveNotes = () => {
    setGameState((prev) => prev ? { ...prev, autoRemoveNotes: !prev.autoRemoveNotes } : prev);
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

  const getNumberCounts = (): Record<number, number> => {
    if (!gameState) return {};
    const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0 };
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const value = gameState.grid[r][c].value;
        if (value !== null) {
          counts[value] = (counts[value] || 0) + 1;
        }
      }
    }
    return counts;
  };

  if (!gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-cyan-50">
        <div className="text-2xl font-semibold text-teal-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${gameState.darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-teal-50 via-cyan-50 to-blue-50'}`}>
      <Header
        difficulty={difficulty}
        onDifficultyChange={setDifficulty}
        onNewGame={() => initializeGame(difficulty)}
        darkMode={gameState.darkMode}
      />

      <main className="container mx-auto px-2 py-1 md:px-1 md:py-2">
		        <div className="max-w-6xl mx-auto">
		          {gameState.notesMode && !gameState.isPaused && !gameState.isWon ? (
		            <div className={`max-w-md mx-auto mt-1 mb-2 px-3 py-1.5 md:mt-2 md:mb-3 md:px-4 md:py-2 rounded-lg ${gameState.darkMode ? 'bg-teal-900 text-teal-200' : 'bg-teal-100 text-teal-800'} text-sm font-medium flex items-center justify-between`}>
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

		          <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 lg:gap-1">
	            <div className="lg:col-span-2">
	              <div className="w-full max-w-xs sm:max-w-sm mx-auto mb-1 relative">
	                <Timer 
	                  time={gameState.time} 
	                  isPaused={gameState.isPaused} 
	                  mistakes={gameState.mistakes}
	                  showMistakes={gameState.showMistakes}
                  onShowMistakesToggle={() =>
                    setGameState((prev) => prev ? { ...prev, showMistakes: !prev.showMistakes } : prev)
                  }
	                  darkMode={gameState.darkMode}
	                  onDarkModeToggle={toggleDarkMode}
	                  timerEnabled={gameState.timerEnabled}
	                  onTimerToggle={toggleTimer}
                    soundEnabled={gameState.soundEnabled}
                    onSoundToggle={toggleSound}
                    musicEnabled={gameState.musicEnabled}
                    onMusicToggle={toggleMusic}
	                  lightningMode={gameState.lightningMode}
	                  onLightningModeToggle={toggleLightningMode}
	                  autoNotes={gameState.autoNotes}
	                  onAutoNotesToggle={toggleAutoNotes}
	                  highlightRowCol={gameState.highlightRowCol}
                  onHighlightRowColToggle={toggleHighlightRowCol}
	                  autoRemoveNotes={gameState.autoRemoveNotes}
	                  onAutoRemoveNotesToggle={toggleAutoRemoveNotes}
	                />
	              </div>
	              <SudokuBoard
	                grid={gameState.grid}
	                solution={gameState.solution}
	                selectedCell={gameState.selectedCell}
	                showMistakes={gameState.showMistakes}
                  highlightRowCol={gameState.highlightRowCol}
                  darkMode={gameState.darkMode}
	                onCellClick={(row, col) => {
	                  if (!gameState.isPaused && !gameState.isWon) {
	                    setGameState((prev) => prev ? { ...prev, selectedCell: [row, col] } : prev);
	                  }
	                }}
	              />
	            </div>

	            <div className="flex flex-col gap-2 md:gap-4">
	              <ControlPanel
	                notesMode={gameState.notesMode}
	                hintsLeft={gameState.hintsLeft}
	                isPaused={gameState.isPaused}
	                canUndo={gameState.historyIndex > 0}
	                canRedo={gameState.historyIndex < gameState.history.length - 1}
                numberCounts={getNumberCounts()}
                onNumberClick={handleNumberInput}
                onNotesToggle={() =>
                  setGameState((prev) => prev ? { ...prev, notesMode: !prev.notesMode } : prev)
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
                darkMode={gameState.darkMode}
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
