import { useState } from 'react';

interface HeaderProps {
  difficulty: 'easy' | 'medium' | 'hard';
  onDifficultyChange: (difficulty: 'easy' | 'medium' | 'hard') => void;
  onNewGame: () => void;
}

export default function Header({ difficulty, onDifficultyChange, onNewGame }: HeaderProps) {
  const [showMenu, setShowMenu] = useState(false);

  const handleDifficultyChange = (newDifficulty: 'easy' | 'medium' | 'hard') => {
    if (newDifficulty !== difficulty) {
      onDifficultyChange(newDifficulty);
      onNewGame();
    }
    setShowMenu(false);
  };

  return (
    <header className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="https://public.readdy.ai/ai/img_res/d9de8a92-cd94-447f-9370-d5cd9c508124.png" 
              alt="JKV Sudoku Logo" 
              className="w-12 h-12 rounded-lg shadow-md"
            />
            <h1 className="text-2xl md:text-3xl font-bold text-white">JKV Sudoku</h1>
          </div>
          
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-all duration-200 backdrop-blur-sm"
            >
              <span className="capitalize font-medium">{difficulty}</span>
              <i className={`ri-arrow-down-s-line text-xl transition-transform ${showMenu ? 'rotate-180' : ''}`}></i>
            </button>
            
            {showMenu && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowMenu(false)}
                ></div>
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-xl z-20 overflow-hidden">
                  <button
                    onClick={() => handleDifficultyChange('easy')}
                    className={`w-full text-left px-4 py-3 hover:bg-teal-50 transition-colors ${
                      difficulty === 'easy' ? 'bg-teal-100 text-teal-700 font-semibold' : 'text-gray-700'
                    }`}
                  >
                    Easy
                  </button>
                  <button
                    onClick={() => handleDifficultyChange('medium')}
                    className={`w-full text-left px-4 py-3 hover:bg-teal-50 transition-colors ${
                      difficulty === 'medium' ? 'bg-teal-100 text-teal-700 font-semibold' : 'text-gray-700'
                    }`}
                  >
                    Medium
                  </button>
                  <button
                    onClick={() => handleDifficultyChange('hard')}
                    className={`w-full text-left px-4 py-3 hover:bg-teal-50 transition-colors ${
                      difficulty === 'hard' ? 'bg-teal-100 text-teal-700 font-semibold' : 'text-gray-700'
                    }`}
                  >
                    Hard
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
