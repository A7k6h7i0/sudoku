interface ControlPanelProps {
  notesMode: boolean;
  showMistakes: boolean;
  hintsLeft: number;
  isPaused: boolean;
  canUndo: boolean;
  canRedo: boolean;
  onNumberClick: (num: number) => void;
  onNotesToggle: () => void;
  onShowMistakesToggle: () => void;
  onHint: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  onNewGame: () => void;
  onRestart: () => void;
  onPauseToggle: () => void;
}

export default function ControlPanel({
  notesMode,
  showMistakes,
  hintsLeft,
  isPaused,
  canUndo,
  canRedo,
  onNumberClick,
  onNotesToggle,
  onShowMistakesToggle,
  onHint,
  onUndo,
  onRedo,
  onClear,
  onNewGame,
  onRestart,
  onPauseToggle,
}: ControlPanelProps) {
  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      {/* Number Pad */}
      <div className="bg-white rounded-lg shadow-lg p-4">
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => onNumberClick(num)}
              className="aspect-square bg-gradient-to-br from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white text-2xl font-bold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 active:scale-95"
            >
              {num}
            </button>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="bg-white rounded-lg shadow-lg p-4 space-y-3">
        <div className="grid grid-cols-2 gap-2">
	          <button
	            onClick={onNotesToggle}
	            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
	              notesMode
	                ? 'bg-teal-500 text-white shadow-md'
	                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
	            }`}
	          >
	            <i className="ri-pencil-line text-lg"></i>
	            <span>Notes (N)</span>
	          </button>

          <button
            onClick={onShowMistakesToggle}
            className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
              showMistakes
                ? 'bg-red-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <i className="ri-error-warning-line text-lg"></i>
            <span>Mistakes</span>
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="flex items-center justify-center gap-1 px-3 py-3 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 text-gray-700 rounded-lg font-medium transition-all duration-200"
          >
            <i className="ri-arrow-go-back-line text-lg"></i>
            <span className="text-sm">Undo</span>
          </button>

          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="flex items-center justify-center gap-1 px-3 py-3 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 text-gray-700 rounded-lg font-medium transition-all duration-200"
          >
            <i className="ri-arrow-go-forward-line text-lg"></i>
            <span className="text-sm">Redo</span>
          </button>

	          <button
	            onClick={onClear}
	            className="flex items-center justify-center gap-1 px-3 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-all duration-200"
	          >
	            <i className="ri-eraser-line text-lg"></i>
	            <span className="text-sm">Clear All</span>
	          </button>
	        </div>

        <button
          onClick={onHint}
          disabled={hintsLeft === 0}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-400 to-orange-400 hover:from-amber-500 hover:to-orange-500 disabled:from-gray-300 disabled:to-gray-300 disabled:text-gray-500 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200"
        >
          <i className="ri-lightbulb-line text-lg"></i>
          <span>Hint ({hintsLeft} left)</span>
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onPauseToggle}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium shadow-md transition-all duration-200"
          >
            <i className={`${isPaused ? 'ri-play-line' : 'ri-pause-line'} text-lg`}></i>
            <span>{isPaused ? 'Resume' : 'Pause'}</span>
          </button>

          <button
            onClick={onRestart}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg font-medium shadow-md transition-all duration-200"
          >
            <i className="ri-restart-line text-lg"></i>
            <span>Restart</span>
          </button>
        </div>

        <button
          onClick={onNewGame}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200"
        >
          <i className="ri-refresh-line text-lg"></i>
          <span>New Game</span>
        </button>
      </div>
    </div>
  );
}
