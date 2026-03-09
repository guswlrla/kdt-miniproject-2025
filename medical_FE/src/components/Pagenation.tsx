'use client';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const WINDOW_SIZE = 5;

  const getPageNumbers = () => {
    const start = Math.floor(currentPage / WINDOW_SIZE) * WINDOW_SIZE;
    const end = Math.min(start + WINDOW_SIZE - 1, totalPages - 1);
    const pages = [];
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

  if (totalPages <= 0) return null;

  const btnClass = "w-8 h-8 flex border border-gray-300 items-center justify-center transition-colors hover:bg-gray-100 disabled:opacity-30 disabled:hover:bg-transparent";

  return (
    <div className="flex justify-center items-center gap-1 p-4">
      <button onClick={() => onPageChange(0)} disabled={currentPage === 0} className={btnClass}><img src='/angles-left.svg' /></button>
      <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 0} className={btnClass}><img src='/angle-left.svg' /></button>
      
      <div className="flex gap-2">
        {getPageNumbers().map(num =>
          <button key={num} onClick={() => onPageChange(num)} className={`w-9 h-8 transition-all text-gray-500 
                  ${currentPage === num ? 'border-b border-gray-400' : 'hover:bg-gray-200'}`}>
            {num + 1}
          </button>
        )}
      </div>

      <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage >= totalPages - 1} className={btnClass}><img src='/angle-right.svg' /></button>
      <button onClick={() => onPageChange(totalPages - 1)} disabled={currentPage >= totalPages - 1} className={btnClass}><img src='/angles-right.svg' /></button>
    </div>
  );
}