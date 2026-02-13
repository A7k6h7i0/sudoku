interface WinModalProps {
  isOpen: boolean;
  difficulty: string;
  time: string;
  mistakes: number;
  onNewGame: () => void;
  onClose: () => void;
}

export default function WinModal({
  isOpen,
  difficulty,
  time,
  mistakes,
  onNewGame,
  onClose,
}: WinModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 transform animate-scale-in">
        <div className="text-center space-y-6">
          <div className="text-6xl">🎉</div>
          
          <h2 className="text-3xl font-bold text-gray-900">
            Congratulations!
          </h2>
          
          <p className="text-lg text-gray-600">
            You solved JKV Sudoku!
          </p>

          <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-xl p-6 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 font-medium">Difficulty:</span>
              <span className="text-teal-600 font-bold capitalize text-lg">{difficulty}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600 font-medium">Time:</span>
              <span className="text-teal-600 font-bold text-lg">{time}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600 font-medium">Mistakes:</span>
              <span className="text-teal-600 font-bold text-lg">{mistakes}</span>
            </div>
          </div>

          <div className="space-y-3 pt-4">
            <button
              onClick={onNewGame}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <i className="ri-refresh-line text-xl"></i>
              <span>New Game</span>
            </button>
            
            <button
              onClick={onClose}
              className="w-full px-6 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold text-lg transition-all duration-200"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
