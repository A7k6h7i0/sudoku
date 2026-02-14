import { Cell } from '../../utils/sudoku';

interface SudokuCellProps {
  cell: Cell;
  row: number;
  col: number;
  isSelected: boolean;
  isHighlighted: boolean;
  isSameNumber: boolean;
  showMistakes: boolean;
  isIncorrect?: boolean;
  isBoxShaded?: boolean;
  darkMode?: boolean;
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
  isIncorrect = false,
  isBoxShaded = false,
  darkMode = false,
  onClick,
}: SudokuCellProps) {
  const isRightBorder = (col + 1) % 3 === 0 && col !== 8;
  const isBottomBorder = (row + 1) % 3 === 0 && row !== 8;
  const isLastCol = col === 8;
  const isLastRow = row === 8;

  const getCellClasses = () => {
    const classes = [
      'aspect-square flex items-center justify-center cursor-pointer transition-all duration-150 select-none',
    ];

    const baseBg = darkMode
      ? isBoxShaded
        ? 'bg-gray-800'
        : 'bg-gray-900/60'
      : isBoxShaded
        ? 'bg-[#FFF0D6]'
        : 'bg-[#FFF7E6]';
    
    if (isSelected) {
      classes.push(darkMode ? 'bg-teal-900/60 ring-2 ring-teal-400' : 'bg-teal-200 ring-2 ring-teal-500');
    } else if (showMistakes && isIncorrect) {
      classes.push(darkMode ? 'bg-red-900/40 ring-1 ring-red-500' : 'bg-red-100 ring-1 ring-red-500');
    } else if (isSameNumber) {
      classes.push(darkMode ? 'bg-teal-900/25' : 'bg-teal-100');
    } else if (isHighlighted) {
      classes.push(darkMode ? 'bg-gray-800/80' : 'bg-gray-100');
    } else {
      classes.push(`${baseBg} ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}`);
    }

    const strongBorder = darkMode ? 'border-gray-500' : 'border-gray-800';
    const weakBorder = darkMode ? 'border-gray-700' : 'border-gray-400';

    // Vertical borders
    if (isRightBorder || isLastCol) {
      classes.push(`border-r-2 ${strongBorder}`);
    } else {
      classes.push(`border-r ${weakBorder}`);
    }
    if (col === 0) {
      classes.push(`border-l-2 ${strongBorder}`);
    }

    // Horizontal borders
    if (isBottomBorder || isLastRow) {
      classes.push(`border-b-2 ${strongBorder}`);
    } else {
      classes.push(`border-b ${weakBorder}`);
    }
    if (row === 0) {
      classes.push(`border-t-2 ${strongBorder}`);
    }

    return classes.join(' ');
  };

  const getValueClasses = () => {
    const classes = ['text-2xl md:text-3xl font-semibold'];
    
    if (cell.given) {
      classes.push(darkMode ? 'text-gray-100 font-bold' : 'text-gray-900 font-bold');
    } else if (showMistakes && (cell.conflict || isIncorrect)) {
      classes.push('text-red-600 font-bold');
    } else {
      classes.push(darkMode ? 'text-teal-300' : 'text-teal-600');
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
              className={`flex items-center justify-center text-[10px] md:text-[12px] ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}
            >
              {cell.notes.has(num) ? num : ''}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
