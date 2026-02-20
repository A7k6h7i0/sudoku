import { useState } from 'react';

interface HeaderProps {
  difficulty: 'easy' | 'medium' | 'hard';
  onDifficultyChange: (difficulty: 'easy' | 'medium' | 'hard') => void;
  darkMode?: boolean;
}

export default function Header({ difficulty, onDifficultyChange, darkMode }: HeaderProps) {
  const [showMenu, setShowMenu] = useState(false);

  const handleDifficultyChange = (newDifficulty: 'easy' | 'medium' | 'hard') => {
    if (newDifficulty !== difficulty) {
      onDifficultyChange(newDifficulty);
    }
    setShowMenu(false);
  };

  return (
    <header className={`w-full ${darkMode ? 'bg-gray-800' : 'bg-gradient-to-r from-cyan-500 via-teal-500 to-blue-500'} shadow-xl`}>
      <div className="max-w-7xl mx-auto px-3 py-2.5 md:px-4 md:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="/jkv-logo.jpeg" 
              alt="JKV Sudoku Logo" 
              className="w-12 h-12 md:w-12 md:h-12 rounded-lg shadow-md"
            />
            <h1 className="text-4xl md:text-4xl font-bold text-white whitespace-nowrap">JKV Sudoku</h1>
          </div>
          
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="flex items-center gap-2 bg-white/25 hover:bg-white/35 border border-white/25 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-xl transition-all duration-200 backdrop-blur-sm text-lg md:text-lg shadow-lg"
            >
              <span className="capitalize font-medium">{difficulty}</span>
              <i className={`ri-arrow-down-s-line text-2xl transition-transform ${showMenu ? 'rotate-180' : ''}`}></i>
            </button>
            
            {showMenu && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setShowMenu(false)}
                ></div>
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-2xl z-20 overflow-hidden border border-cyan-100">
                  <button
                    onClick={() => handleDifficultyChange('easy')}
                    className={`w-full text-left px-4 py-3 hover:bg-cyan-50 transition-colors ${
                      difficulty === 'easy' ? 'bg-cyan-100 text-cyan-700 font-semibold' : 'text-gray-700'
                    }`}
                  >
                    Easy
                  </button>
                  <button
                    onClick={() => handleDifficultyChange('medium')}
                    className={`w-full text-left px-4 py-3 hover:bg-cyan-50 transition-colors ${
                      difficulty === 'medium' ? 'bg-cyan-100 text-cyan-700 font-semibold' : 'text-gray-700'
                    }`}
                  >
                    Medium
                  </button>
                  <button
                    onClick={() => handleDifficultyChange('hard')}
                    className={`w-full text-left px-4 py-3 hover:bg-cyan-50 transition-colors ${
                      difficulty === 'hard' ? 'bg-cyan-100 text-cyan-700 font-semibold' : 'text-gray-700'
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

