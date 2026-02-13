import { Cell } from '../../utils/sudoku';

interface SudokuCellProps {
  cell: Cell;
  row: number;
  col: number;
  isSelected: boolean;
  isHighlighted: boolean;
  isSameNumber: boolean;
  showMistakes: boolean;
  onClick: () => void;
}

export default function SudokuCell({
  cell,
  row,
  col,
  isSelected,
  isHighlighted,
  isSameNumber,
  showMistakes,
  onClick,
}: SudokuCellProps) {
  const isRightBorder = (col + 1) % 3 === 0 && col !== 8;
  const isBottomBorder = (row + 1) % 3 === 0 && row !== 8;

  const getCellClasses = () => {
    const classes = ['aspect-square flex items-center justify-center cursor-pointer transition-all duration-150'];
    
    if (isSelected) {
      classes.push('bg-teal-200 ring-2 ring-teal-500');
    } else if (isSameNumber) {
      classes.push('bg-teal-100');
    } else if (isHighlighted) {
      classes.push('bg-gray-100');
    } else {
      classes.push('bg-white hover:bg-gray-50');
    }

    if (isRightBorder) {
      classes.push('border-r-2 border-gray-800');
    } else {
      classes.push('border-r border-gray-300');
    }

    if (isBottomBorder) {
      classes.push('border-b-2 border-gray-800');
    } else {
      classes.push('border-b border-gray-300');
    }

    if (col === 0) {
      classes.push('border-l-2 border-gray-800');
    }

    if (row === 0) {
      classes.push('border-t-2 border-gray-800');
    }

    return classes.join(' ');
  };

  const getValueClasses = () => {
    const classes = ['text-xl md:text-2xl font-semibold'];
    
    if (cell.given) {
      classes.push('text-gray-900 font-bold');
    } else if (showMistakes && cell.conflict) {
      classes.push('text-red-600');
    } else {
      classes.push('text-teal-600');
    }

    return classes.join(' ');
  };

  return (
    <div className={getCellClasses()} onClick={onClick}>
      {cell.value ? (
        <span className={getValueClasses()}>{cell.value}</span>
      ) : cell.notes.size > 0 ? (
        <div className="grid grid-cols-3 gap-0 w-full h-full p-0.5">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <div
              key={num}
              className="flex items-center justify-center text-[8px] md:text-[10px] text-gray-500"
            >
              {cell.notes.has(num) ? num : ''}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
