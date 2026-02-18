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
    <div className="w-full max-w-sm mx-auto space-y-2 md:space-y-3">
      {/* Action Buttons Row */}
      <div className={`${darkMode ? 'bg-gray-800 shadow-lg shadow-black/20' : 'bg-gradient-to-br from-cyan-50 via-white to-blue-50 border border-cyan-100 shadow-lg shadow-cyan-200/40'} rounded-2xl p-2 md:p-3`}>
        <div className="flex justify-center gap-2 md:gap-3">
          {/* Undo Button */}
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`
              flex flex-col items-center gap-1 w-12 md:w-14
              transition-all duration-200 active:scale-95
              ${canUndo ? (darkMode ? 'text-gray-300 hover:text-[#3B5BDB]' : 'text-gray-600 hover:text-[#3B5BDB]') : (darkMode ? 'text-gray-600 cursor-not-allowed' : 'text-gray-300 cursor-not-allowed')}
            `}
          >
            <i className={`ri-arrow-go-back-line text-[26px] md:text-[28px] ${canUndo ? (darkMode ? 'text-gray-300' : 'text-gray-700') : (darkMode ? 'text-gray-600' : 'text-gray-300')}`}></i>
            <span className={`text-[15px] md:text-base font-medium ${canUndo ? (darkMode ? 'text-gray-300' : 'text-gray-700') : (darkMode ? 'text-gray-600' : 'text-gray-300')}`}>Undo</span>
          </button>

          {/* Redo Button */}
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={`
              flex flex-col items-center gap-1 w-12 md:w-14
              transition-all duration-200 active:scale-95
              ${canRedo ? (darkMode ? 'text-gray-300 hover:text-[#3B5BDB]' : 'text-gray-600 hover:text-[#3B5BDB]') : (darkMode ? 'text-gray-600 cursor-not-allowed' : 'text-gray-300 cursor-not-allowed')}
            `}
          >
            <i className={`ri-arrow-go-forward-line text-[26px] md:text-[28px] ${canRedo ? (darkMode ? 'text-gray-300' : 'text-gray-700') : (darkMode ? 'text-gray-600' : 'text-gray-300')}`}></i>
            <span className={`text-[15px] md:text-base font-medium ${canRedo ? (darkMode ? 'text-gray-300' : 'text-gray-700') : (darkMode ? 'text-gray-600' : 'text-gray-300')}`}>Redo</span>
          </button>

          {/* Erase/Clear Button */}
          <button
            onClick={onClear}
            className={`flex flex-col items-center gap-1 w-12 md:w-14 ${darkMode ? 'text-gray-300 hover:text-[#3B5BDB]' : 'text-gray-700 hover:text-[#3B5BDB]'} transition-all duration-200 active:scale-95`}
          >
            <i className={`ri-eraser-line text-[26px] md:text-[28px] ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}></i>
            <span className={`text-[15px] md:text-base font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Erase</span>
          </button>

          {/* Pencil/Notes Button */}
          <button
            onClick={onNotesToggle}
            className={`
              flex flex-col items-center gap-1 w-12 md:w-14
              transition-all duration-200 active:scale-95
              ${notesMode ? 'text-[#3B5BDB]' : (darkMode ? 'text-gray-300 hover:text-[#3B5BDB]' : 'text-gray-700 hover:text-[#3B5BDB]')}
            `}
          >
            <i className={`ri-pencil-line text-[26px] md:text-[28px] ${notesMode ? 'text-[#3B5BDB]' : (darkMode ? 'text-gray-300' : 'text-gray-700')}`}></i>
            <span className={`text-[15px] md:text-base font-medium ${notesMode ? 'text-[#3B5BDB]' : (darkMode ? 'text-gray-300' : 'text-gray-700')}`}>Pencil</span>
          </button>

          {/* Hint Button */}
          <button
            onClick={onHint}
            disabled={hintsLeft === 0}
            className={`
              flex flex-col items-center gap-1 w-12 md:w-14
              transition-all duration-200 active:scale-95
              ${hintsLeft === 0 ? (darkMode ? 'text-gray-600 cursor-not-allowed' : 'text-gray-300 cursor-not-allowed') : (darkMode ? 'text-gray-300 hover:text-[#3B5BDB]' : 'text-gray-600 hover:text-[#3B5BDB]')}
            `}
          >
            <div className="relative">
              <i className={`ri-lightbulb-line text-[26px] md:text-[28px] ${hintsLeft === 0 ? (darkMode ? 'text-gray-600' : 'text-gray-300') : (darkMode ? 'text-gray-300' : 'text-gray-700')}`}></i>
              {hintsLeft > 0 && (
                <span className="absolute -top-1 -right-2 min-w-5 h-5 px-1 bg-[#3B5BDB] text-white text-[11px] font-semibold rounded-full flex items-center justify-center">
                  {hintsLeft}
                </span>
              )}
            </div>
            <span className={`text-[15px] md:text-base font-medium ${hintsLeft === 0 ? (darkMode ? 'text-gray-600' : 'text-gray-300') : (darkMode ? 'text-gray-300' : 'text-gray-700')}`}>Hint</span>
          </button>
        </div>
      </div>

      {/* Number Pad - Horizontal Row */}
      <div className={`${darkMode ? 'bg-gray-800 shadow-lg shadow-black/20' : 'bg-gradient-to-br from-cyan-50 via-white to-indigo-50 border border-cyan-100 shadow-lg shadow-cyan-200/40'} rounded-2xl p-2 md:p-3`}>
        <div className="grid grid-cols-9 gap-1.5 md:gap-2 w-full">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
            const count = numberCounts[num] || 0;
            const isDisabled = count >= 9;
            
            return (
              <button
                key={num}
                onClick={() => onNumberClick(num)}
                disabled={isDisabled}
                className={`
                  w-full aspect-square max-w-[46px] md:max-w-[44px] mx-auto rounded-xl flex items-center justify-center
                  transition-all duration-200 active:scale-95
                  ${isDisabled 
                    ? (darkMode ? 'bg-gray-700 cursor-not-allowed opacity-50' : 'bg-gray-100 cursor-not-allowed opacity-50') 
                    : (darkMode ? 'bg-gray-700 border border-gray-600 hover:bg-[#E7F0FF] hover:border-[#3B5BDB]/40' : 'bg-gradient-to-br from-white to-cyan-50 shadow-[0px_5px_14px_rgba(8,71,137,0.18)] border border-cyan-100 hover:from-cyan-100 hover:to-blue-50 hover:border-cyan-300')
                  }
                `}
              >
                <span 
                  className={`text-[32px] md:text-[30px] leading-none font-bold ${isDisabled ? 'text-gray-500' : 'text-[#0E4FA8]'}`}
                >
                  {num}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Secondary Actions Row */}
      <div className="flex justify-center gap-2.5">
        <button
          onClick={onPauseToggle}
          className={`px-3 py-1.5 md:px-3 md:py-1.5 ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200 border-gray-600' : 'bg-gradient-to-r from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 text-gray-800 border-slate-300'} rounded-md text-[15px] md:text-base font-semibold border transition-all duration-200`}
        >
          <i className={`${isPaused ? 'ri-play-line' : 'ri-pause-line'} mr-1`}></i>
          {isPaused ? 'Resume' : 'Pause'}
        </button>

        <button
          onClick={onRestart}
          className={`px-3 py-1.5 md:px-3 md:py-1.5 ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200 border-gray-600' : 'bg-gradient-to-r from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 text-gray-800 border-slate-300'} rounded-md text-[15px] md:text-base font-semibold border transition-all duration-200`}
        >
          <i className="ri-restart-line mr-1"></i>
          Restart
        </button>

        <button
          onClick={onNewGame}
          className={`px-3 py-1.5 md:px-3 md:py-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white rounded-md text-[15px] md:text-base font-semibold shadow-md hover:shadow-lg transition-all duration-200`}
        >
          <i className="ri-refresh-line mr-1"></i>
          New
        </button>
      </div>
    </div>
  );
}
