import { Grid } from '../../utils/sudoku';
import SudokuCell from './SudokuCell';

interface SudokuBoardProps {
  grid: Grid;
  selectedCell: [number, number] | null;
  showMistakes: boolean;
  onCellClick: (row: number, col: number) => void;
}

export default function SudokuBoard({
  grid,
  selectedCell,
  showMistakes,
  onCellClick,
}: SudokuBoardProps) {
  const isHighlighted = (row: number, col: number): boolean => {
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
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-2xl p-2 md:p-4">
        <div className="grid grid-cols-9 gap-0 border-2 border-gray-800 rounded-lg overflow-hidden">
          {grid.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
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
                onClick={() => onCellClick(rowIndex, colIndex)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
