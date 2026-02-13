interface TimerProps {
  time: number;
  isPaused: boolean;
}

export default function Timer({ time, isPaused }: TimerProps) {
  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center justify-center gap-2 bg-white rounded-lg shadow-lg px-6 py-3 mb-4">
      <i className={`ri-time-line text-2xl ${isPaused ? 'text-red-500' : 'text-teal-500'}`}></i>
      <span className="text-2xl font-bold text-gray-800 tabular-nums">
        {formatTime(time)}
      </span>
      {isPaused && (
        <span className="text-sm text-red-500 font-medium ml-2">PAUSED</span>
      )}
    </div>
  );
}
