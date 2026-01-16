import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  totalItems, 
  itemsPerPage, 
  onPageChange,
  showInfo = true,
  size = 'md'
}) => {
  if (totalPages <= 1) return null;

  const getVisiblePages = () => {
    const delta = size === 'sm' ? 1 : 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const visiblePages = getVisiblePages();
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const buttonClass = size === 'sm' 
    ? 'px-2 py-1 text-sm' 
    : size === 'lg' 
    ? 'px-4 py-3 text-base' 
    : 'px-3 py-2 text-sm';

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
      {showInfo && (
        <div className="text-sm theme-text-secondary">
          Showing <span className="font-medium theme-text-primary">{startItem}</span> to{' '}
          <span className="font-medium theme-text-primary">{endItem}</span> of{' '}
          <span className="font-medium theme-text-primary">{totalItems}</span> results
        </div>
      )}
      
      <nav className="flex items-center space-x-1">
        {/* Previous Button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`${buttonClass} flex items-center space-x-1 border theme-border rounded-lg transition-all duration-200 ${
            currentPage === 1
              ? 'theme-bg-secondary theme-text-muted cursor-not-allowed opacity-50'
              : 'theme-bg-secondary theme-text-primary hover:theme-bg-tertiary hover:border-primary-300 hover:shadow-sm'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Previous</span>
        </button>

        {/* Page Numbers */}
        <div className="flex items-center space-x-1">
          {visiblePages.map((page, index) => (
            page === '...' ? (
              <div key={`dots-${index}`} className={`${buttonClass} theme-text-muted flex items-center justify-center`}>
                <MoreHorizontal className="w-4 h-4" />
              </div>
            ) : (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`${buttonClass} min-w-[40px] flex items-center justify-center border rounded-lg transition-all duration-200 font-medium ${
                  currentPage === page
                    ? 'bg-primary-600 text-white border-primary-600 shadow-md transform scale-105'
                    : 'theme-bg-secondary theme-text-primary theme-border hover:theme-bg-tertiary hover:border-primary-300 hover:shadow-sm hover:scale-105'
                }`}
              >
                {page}
              </button>
            )
          ))}
        </div>

        {/* Next Button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`${buttonClass} flex items-center space-x-1 border theme-border rounded-lg transition-all duration-200 ${
            currentPage === totalPages
              ? 'theme-bg-secondary theme-text-muted cursor-not-allowed opacity-50'
              : 'theme-bg-secondary theme-text-primary hover:theme-bg-tertiary hover:border-primary-300 hover:shadow-sm'
          }`}
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </nav>
    </div>
  );
};

export default Pagination;