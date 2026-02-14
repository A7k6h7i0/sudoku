interface ControlPanelProps {
  notesMode: boolean;
  hintsLeft: number;
  isPaused: boolean;
  canUndo: boolean;
  canRedo: boolean;
  numberCounts: Record<number, number>;
  onNumberClick: (num: number) => void;
  onNotesToggle: () => void;
  onHint: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  onNewGame: () => void;
  onRestart: () => void;
  onPauseToggle: () => void;
  darkMode?: boolean;
}

export default function ControlPanel({
  notesMode,
  hintsLeft,
  isPaused,
  canUndo,
  canRedo,
  numberCounts,
  onNumberClick,
  onNotesToggle,
  onHint,
  onUndo,
  onRedo,
  onClear,
  onNewGame,
  onRestart,
  onPauseToggle,
  darkMode,
}: ControlPanelProps) {
  return (
    <div className="w-full max-w-lg mx-auto space-y-1 md:space-y-2">
      {/* Action Buttons Row */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-[#F3F4F6]'} rounded-lg p-1.5 md:p-2`}>
        <div className="flex justify-center gap-1.5 md:gap-3">
          {/* Undo Button */}
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`
              flex flex-col items-center gap-0.5 w-10 md:w-14
              transition-all duration-200 active:scale-95
              ${canUndo ? (darkMode ? 'text-gray-300 hover:text-[#3B5BDB]' : 'text-gray-600 hover:text-[#3B5BDB]') : (darkMode ? 'text-gray-600 cursor-not-allowed' : 'text-gray-300 cursor-not-allowed')}
            `}
          >
            <i className={`ri-arrow-go-back-line text-xl md:text-xl ${canUndo ? (darkMode ? 'text-gray-300' : 'text-gray-600') : (darkMode ? 'text-gray-600' : 'text-gray-300')}`}></i>
            <span className={`text-xs ${canUndo ? (darkMode ? 'text-gray-300' : 'text-gray-600') : (darkMode ? 'text-gray-600' : 'text-gray-300')}`}>Undo</span>
          </button>

          {/* Redo Button */}
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={`
              flex flex-col items-center gap-0.5 w-10 md:w-14
              transition-all duration-200 active:scale-95
              ${canRedo ? (darkMode ? 'text-gray-300 hover:text-[#3B5BDB]' : 'text-gray-600 hover:text-[#3B5BDB]') : (darkMode ? 'text-gray-600 cursor-not-allowed' : 'text-gray-300 cursor-not-allowed')}
            `}
          >
            <i className={`ri-arrow-go-forward-line text-xl md:text-xl ${canRedo ? (darkMode ? 'text-gray-300' : 'text-gray-600') : (darkMode ? 'text-gray-600' : 'text-gray-300')}`}></i>
            <span className={`text-xs ${canRedo ? (darkMode ? 'text-gray-300' : 'text-gray-600') : (darkMode ? 'text-gray-600' : 'text-gray-300')}`}>Redo</span>
          </button>

          {/* Erase/Clear Button */}
          <button
            onClick={onClear}
            className={`flex flex-col items-center gap-0.5 w-10 md:w-14 ${darkMode ? 'text-gray-300 hover:text-[#3B5BDB]' : 'text-gray-600 hover:text-[#3B5BDB]'} transition-all duration-200 active:scale-95`}
          >
            <i className={`ri-eraser-line text-xl md:text-xl ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}></i>
            <span className={`text-xs ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Erase</span>
          </button>

          {/* Pencil/Notes Button */}
          <button
            onClick={onNotesToggle}
            className={`
              flex flex-col items-center gap-0.5 w-10 md:w-14
              transition-all duration-200 active:scale-95
              ${notesMode ? 'text-[#3B5BDB]' : (darkMode ? 'text-gray-300 hover:text-[#3B5BDB]' : 'text-gray-600 hover:text-[#3B5BDB]')}
            `}
          >
            <i className={`ri-pencil-line text-xl md:text-xl ${notesMode ? 'text-[#3B5BDB]' : (darkMode ? 'text-gray-300' : 'text-gray-600')}`}></i>
            <span className={`text-xs ${notesMode ? 'text-[#3B5BDB]' : (darkMode ? 'text-gray-300' : 'text-gray-600')}`}>Pencil</span>
          </button>

          {/* Hint Button */}
          <button
            onClick={onHint}
            disabled={hintsLeft === 0}
            className={`
              flex flex-col items-center gap-0.5 w-10 md:w-14
              transition-all duration-200 active:scale-95
              ${hintsLeft === 0 ? (darkMode ? 'text-gray-600 cursor-not-allowed' : 'text-gray-300 cursor-not-allowed') : (darkMode ? 'text-gray-300 hover:text-[#3B5BDB]' : 'text-gray-600 hover:text-[#3B5BDB]')}
            `}
          >
            <div className="relative">
              <i className={`ri-lightbulb-line text-xl md:text-xl ${hintsLeft === 0 ? (darkMode ? 'text-gray-600' : 'text-gray-300') : (darkMode ? 'text-gray-300' : 'text-gray-600')}`}></i>
              {hintsLeft > 0 && (
                <span className="absolute -top-1 -right-2 w-4 h-4 bg-[#3B5BDB] text-white text-[10px] rounded-full flex items-center justify-center">
                  {hintsLeft}
                </span>
              )}
            </div>
            <span className={`text-xs ${hintsLeft === 0 ? (darkMode ? 'text-gray-600' : 'text-gray-300') : (darkMode ? 'text-gray-300' : 'text-gray-600')}`}>Hint</span>
          </button>
        </div>
      </div>

      {/* Number Pad - Horizontal Row */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-[#F3F4F6]'} rounded-lg p-1.5 md:p-2`}>
        <div className="grid grid-cols-9 gap-1 md:gap-2 w-full">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
            const count = numberCounts[num] || 0;
            const isDisabled = count >= 9;
            
            return (
              <button
                key={num}
                onClick={() => onNumberClick(num)}
                disabled={isDisabled}
                className={`
                  w-full aspect-square max-w-[36px] md:max-w-[40px] mx-auto rounded-lg flex flex-col items-center justify-center
                  transition-all duration-200 active:scale-95
                  ${isDisabled 
                    ? (darkMode ? 'bg-gray-700 cursor-not-allowed opacity-50' : 'bg-gray-100 cursor-not-allowed opacity-50') 
                    : (darkMode ? 'bg-gray-700 border border-gray-600 hover:bg-[#E7F0FF] hover:border-[#3B5BDB]/30' : 'bg-white shadow-[0px_2px_6px_rgba(0,0,0,0.08)] border border-gray-200 hover:bg-[#E7F0FF] hover:border-[#3B5BDB]/30')
                  }
                `}
              >
                <span 
                  className={`text-base md:text-lg font-semibold ${isDisabled ? 'text-gray-500' : 'text-[#3B5BDB]'}`}
                >
                  {num}
                </span>
                {!isDisabled && count > 0 && (
                  <span className="text-[8px] text-gray-400">{count}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Secondary Actions Row */}
      <div className="flex justify-center gap-2">
        <button
          onClick={onPauseToggle}
          className={`px-2.5 py-1 md:px-3 md:py-1.5 ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300 border-gray-600' : 'bg-gray-100 hover:bg-gray-200 text-gray-600 border-gray-200'} rounded-sm text-xs font-medium border transition-all duration-200`}
        >
          <i className={`${isPaused ? 'ri-play-line' : 'ri-pause-line'} mr-1`}></i>
          {isPaused ? 'Resume' : 'Pause'}
        </button>

        <button
          onClick={onRestart}
          className={`px-2.5 py-1 md:px-3 md:py-1.5 ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300 border-gray-600' : 'bg-gray-100 hover:bg-gray-200 text-gray-600 border-gray-200'} rounded-sm text-xs font-medium border transition-all duration-200`}
        >
          <i className="ri-restart-line mr-1"></i>
          Restart
        </button>

        <button
          onClick={onNewGame}
          className={`px-2.5 py-1 md:px-3 md:py-1.5 bg-[#3B5BDB] hover:bg-[#2E4AC4] text-white rounded-sm text-xs font-medium shadow-md hover:shadow-lg transition-all duration-200`}
        >
          <i className="ri-refresh-line mr-1"></i>
          New
        </button>
      </div>
    </div>
  );
}
