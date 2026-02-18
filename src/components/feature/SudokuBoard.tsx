import { Grid } from '../../utils/sudoku';
import SudokuCell from './SudokuCell';

interface SudokuBoardProps {
  grid: Grid;
  solution: number[][];
  selectedCell: [number, number] | null;
  showMistakes: boolean;
  highlightRowCol?: boolean;
  darkMode?: boolean;
  onCellClick: (row: number, col: number) => void;
}

export default function SudokuBoard({
  grid,
  solution,
  selectedCell,
  showMistakes,
  highlightRowCol = true,
  darkMode = false,
  onCellClick,
}: SudokuBoardProps) {
  const isHighlighted = (row: number, col: number): boolean => {
    if (!highlightRowCol) return false;
    if (!selectedCell) return false;
    const [selRow, selCol] = selectedCell;
    return row === selRow || col === selCol;
  };

  const isSameNumber = (row: number, col: number): boolean => {
    if (!selectedCell) return false;
    const [selRow, selCol] = selectedCell;
    const selectedValue = grid[selRow][selCol].value;
    if (!selectedValue) return false;
    return grid[row][col].value === selectedValue && (row !== selRow || col !== selCol);
  };

  return (
    <div className="w-full max-w-xs sm:max-w-sm mx-auto">
      <div
        className={`rounded-3xl p-[3px] shadow-2xl ${
          darkMode
            ? 'bg-gradient-to-br from-gray-700 via-gray-600 to-gray-500'
            : 'bg-gradient-to-br from-cyan-500 via-teal-500 to-indigo-500'
        }`}
      >
        <div className={`${darkMode ? 'bg-gray-900' : 'bg-[#FFF9EE]'} rounded-[20px] p-1.5`}>
          <div
            className="grid grid-cols-9 gap-0 rounded-2xl overflow-hidden"
          >
          {grid.map((row, rowIndex) =>
            row.map((cell, colIndex) => {
              const boxShade = (Math.floor(rowIndex / 3) + Math.floor(colIndex / 3)) % 2 === 1;
              const value = cell.value;
              const isIncorrect =
                showMistakes &&
                !cell.given &&
                value !== null &&
                solution?.[rowIndex]?.[colIndex] !== undefined &&
                value !== solution[rowIndex][colIndex];

              return (
                <SudokuCell
                  key={`${rowIndex}-${colIndex}`}
                  cell={cell}
                  row={rowIndex}
                  col={colIndex}
                  isSelected={
                    selectedCell !== null &&
                    selectedCell[0] === rowIndex &&
                    selectedCell[1] === colIndex
                  }
                  isHighlighted={isHighlighted(rowIndex, colIndex)}
                  isSameNumber={isSameNumber(rowIndex, colIndex)}
                  showMistakes={showMistakes}
                  isIncorrect={isIncorrect}
                  isBoxShaded={boxShade}
                  darkMode={darkMode}
                  onClick={() => onCellClick(rowIndex, colIndex)}
                />
              );
            })
          )}
          </div>
        </div>
      </div>
    </div>
  );
}
