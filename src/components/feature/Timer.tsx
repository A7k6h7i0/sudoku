import { useState } from 'react';

interface TimerProps {
  time: number;
  isPaused: boolean;
  mistakes?: number;
  onShowMistakesToggle?: () => void;
  showMistakes?: boolean;
  // Settings
  darkMode?: boolean;
  onDarkModeToggle?: () => void;
  timerEnabled?: boolean;
  onTimerToggle?: () => void;
  soundEnabled?: boolean;
  onSoundToggle?: () => void;
  musicEnabled?: boolean;
  onMusicToggle?: () => void;
  lightningMode?: boolean;
  onLightningModeToggle?: () => void;
  autoNotes?: boolean;
  onAutoNotesToggle?: () => void;
  highlightRowCol?: boolean;
  onHighlightRowColToggle?: () => void;
  autoRemoveNotes?: boolean;
  onAutoRemoveNotesToggle?: () => void;
}

export default function Timer({ 
  time, 
  isPaused, 
  mistakes = 0, 
  onShowMistakesToggle, 
  showMistakes,
  darkMode = false,
  onDarkModeToggle,
  timerEnabled = true,
  onTimerToggle,
  soundEnabled = true,
  onSoundToggle,
  musicEnabled = false,
  onMusicToggle,
  lightningMode = false,
  onLightningModeToggle,
  autoNotes = false,
  onAutoNotesToggle,
  highlightRowCol = true,
  onHighlightRowColToggle,
  autoRemoveNotes = true,
  onAutoRemoveNotesToggle,
}: TimerProps) {
  const [showSettings, setShowSettings] = useState(false);
  
  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const ToggleSwitch = ({ enabled, onToggle }: { enabled: boolean; onToggle?: () => void }) => (
    <div 
      className={`w-10 h-5 rounded-full transition-colors cursor-pointer ${enabled ? 'bg-cyan-500' : 'bg-gray-300'}`}
      onClick={(e) => {
        e.stopPropagation();
        onToggle?.();
      }}
    >
      <div className={`w-4 h-4 bg-white rounded-full shadow transform transition-transform mt-0.5 ${enabled ? 'translate-x-5' : 'translate-x-0.5'}`}></div>
    </div>
  );

	  return (
	    <div className={`flex items-center gap-2.5 rounded-xl px-2 py-1.5 ${darkMode ? 'bg-gray-800/70' : 'bg-white/75 border border-cyan-100 shadow-md shadow-cyan-200/40'} backdrop-blur-sm`}>
	      <button
	        onClick={() => setShowSettings(!showSettings)}
	        className="p-2 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white transition-colors shadow-md"
	        title="Settings"
	      >
	        <i className="ri-settings-3-line text-2xl"></i>
	      </button>
      
	      {showSettings && (
	        <>
	          <div className="fixed inset-0 z-10" onClick={() => setShowSettings(false)}></div>
	          <div className={`absolute right-0 top-10 mt-2 w-56 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-cyan-100'} rounded-xl shadow-xl z-20 overflow-hidden border`}>
	            <div className={`px-4 py-3 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-100'} border-b`}>
	              <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Settings</h3>
	            </div>
	            <div className="py-2">
	              <button className={`w-full px-4 py-2.5 text-left hover:${darkMode ? 'bg-gray-700' : 'bg-cyan-50'} flex items-center justify-between`}>
	                <span className={`flex items-center gap-3 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
	                  <i className={`${darkMode ? 'ri-moon-fill' : 'ri-moon-line'} text-gray-500`}></i>
	                  Dark Mode
	                </span>
	                <ToggleSwitch enabled={darkMode} onToggle={onDarkModeToggle} />
	              </button>
	              <button className={`w-full px-4 py-2.5 text-left hover:${darkMode ? 'bg-gray-700' : 'bg-cyan-50'} flex items-center justify-between`}>
	                <span className={`flex items-center gap-3 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
	                  <i className={`${timerEnabled ? 'ri-timer-fill' : 'ri-timer-line'} text-gray-500`}></i>
	                  Timer
	                </span>
	                <ToggleSwitch enabled={timerEnabled} onToggle={onTimerToggle} />
	              </button>
	              <button className={`w-full px-4 py-2.5 text-left hover:${darkMode ? 'bg-gray-700' : 'bg-cyan-50'} flex items-center justify-between`}>
	                <span className={`flex items-center gap-3 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
	                  <i className={`${soundEnabled ? 'ri-volume-up-fill' : 'ri-volume-mute-fill'} text-gray-500`}></i>
	                  Sound
	                </span>
	                <ToggleSwitch enabled={soundEnabled} onToggle={onSoundToggle} />
	              </button>
	              <button className={`w-full px-4 py-2.5 text-left hover:${darkMode ? 'bg-gray-700' : 'bg-cyan-50'} flex items-center justify-between`}>
	                <span className={`flex items-center gap-3 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
	                  <i className={`${musicEnabled ? 'ri-music-2-fill' : 'ri-music-2-line'} text-gray-500`}></i>
	                  Music
	                </span>
	                <ToggleSwitch enabled={musicEnabled} onToggle={onMusicToggle} />
	              </button>
	              <button className={`w-full px-4 py-2.5 text-left hover:${darkMode ? 'bg-gray-700' : 'bg-cyan-50'} flex items-center justify-between`}>
	                <span className={`flex items-center gap-3 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
	                  <i className={`${lightningMode ? 'ri-flashlight-fill' : 'ri-flashlight-line'} text-gray-500`}></i>
	                  Lightning Mode
	                </span>
	                <ToggleSwitch enabled={lightningMode} onToggle={onLightningModeToggle} />
	              </button>
              <button className={`w-full px-4 py-2.5 text-left hover:${darkMode ? 'bg-gray-700' : 'bg-cyan-50'} flex items-center justify-between`}>
                <span className={`flex items-center gap-3 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  <i className={`${showMistakes ? 'ri-error-warning-fill' : 'ri-error-warning-line'} text-gray-500`}></i>
                  Show Mistakes
                </span>
                <ToggleSwitch enabled={showMistakes ?? false} onToggle={onShowMistakesToggle} />
              </button>
              <button className={`w-full px-4 py-2.5 text-left hover:${darkMode ? 'bg-gray-700' : 'bg-cyan-50'} flex items-center justify-between`}>
                <span className={`flex items-center gap-3 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  <i className={`${autoNotes ? 'ri-checkbox-fill' : 'ri-checkbox-blank-line'} text-gray-500`}></i>
                  Auto Notes
                </span>
                <ToggleSwitch enabled={autoNotes} onToggle={onAutoNotesToggle} />
              </button>
              <button className={`w-full px-4 py-2.5 text-left hover:${darkMode ? 'bg-gray-700' : 'bg-cyan-50'} flex items-center justify-between`}>
                <span className={`flex items-center gap-3 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  <i className={`${highlightRowCol ? 'ri-layout-highlight-fill' : 'ri-layout-highlight-line'} text-gray-500`}></i>
                  Highlight Row/Col
                </span>
                <ToggleSwitch enabled={highlightRowCol} onToggle={onHighlightRowColToggle} />
              </button>
              <button className={`w-full px-4 py-2.5 text-left hover:${darkMode ? 'bg-gray-700' : 'bg-cyan-50'} flex items-center justify-between`}>
                <span className={`flex items-center gap-3 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
                  <i className={`${autoRemoveNotes ? 'ri-delete-back-fill' : 'ri-delete-back-line'} text-gray-500`}></i>
                  Auto Remove Notes
                </span>
                <ToggleSwitch enabled={autoRemoveNotes} onToggle={onAutoRemoveNotesToggle} />
              </button>
            </div>
          </div>
        </>
      )}

	      <div className="flex items-center gap-3 ml-auto">
	        <div className="flex items-center gap-2">
	          <i
	            className={`ri-error-warning-line text-lg ${
	              mistakes > 0 ? 'text-red-500' : darkMode ? 'text-gray-400' : 'text-gray-500'
	            }`}
	          ></i>
	          <span className={`text-base font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
	            Wrong
	          </span>
	          <span className={`text-lg font-bold ${mistakes > 0 ? 'text-red-500' : darkMode ? 'text-gray-200' : 'text-gray-700'} tabular-nums`}>
	            {mistakes}
	          </span>
	        </div>
	        {timerEnabled && (
	          <div className="flex items-center gap-2">
	            <i className={`ri-time-line text-lg ${isPaused ? 'text-red-500' : darkMode ? 'text-gray-400' : 'text-gray-500'}`}></i>
	            <span className={`text-lg font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-700'} tabular-nums`}>
	              {formatTime(time)}
	            </span>
	            {isPaused && (
	              <span className="text-base text-red-500 font-semibold ml-1">PAUSED</span>
	            )}
	          </div>
	        )}
	      </div>
	    </div>
	  );
	}
