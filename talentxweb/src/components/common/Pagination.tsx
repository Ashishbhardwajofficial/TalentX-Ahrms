import React from 'react';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  showPageSizeSelector?: boolean;
  pageSizeOptions?: number[];
  maxVisiblePages?: number;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onPageSizeChange,
  showPageSizeSelector = true,
  pageSizeOptions = [10, 25, 50, 100],
  maxVisiblePages = 5
}) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getVisiblePages = () => {
    const pages: number[] = [];
    const halfVisible = Math.floor(maxVisiblePages / 2);

    let startPage = Math.max(1, currentPage - halfVisible);
    let endPage = Math.min(totalPages, currentPage + halfVisible);

    // Adjust if we're near the beginning or end
    if (endPage - startPage + 1 < maxVisiblePages) {
      if (startPage === 1) {
        endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      } else {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  const visiblePages = getVisiblePages();

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="pagination">
      <div className="pagination-info">
        Showing {startItem} to {endItem} of {totalItems} entries
      </div>

      <div className="pagination-controls">
        {showPageSizeSelector && onPageSizeChange && (
          <div className="page-size-selector">
            <label htmlFor="page-size">Show:</label>
            <select
              id="page-size"
              value={itemsPerPage}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
            >
              {pageSizeOptions.map(size => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="page-navigation">
          <button
            className="pagination-button"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(1)}
            aria-label="Go to first page"
          >
            ««
          </button>

          <button
            className="pagination-button"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
            aria-label="Go to previous page"
          >
            ‹
          </button>

          {visiblePages.length > 0 && visiblePages[0]! > 1 && (
            <>
              <button
                className="pagination-button"
                onClick={() => onPageChange(1)}
              >
                1
              </button>
              {visiblePages[0]! > 2 && <span className="pagination-ellipsis">...</span>}
            </>
          )}

          {visiblePages.map(page => (
            <button
              key={page}
              className={`pagination-button ${page === currentPage ? 'active' : ''}`}
              onClick={() => onPageChange(page)}
              aria-label={`Go to page ${page}`}
              aria-current={page === currentPage ? 'page' : undefined}
            >
              {page}
            </button>
          ))}

          {visiblePages.length > 0 && visiblePages[visiblePages.length - 1]! < totalPages && (
            <>
              {visiblePages[visiblePages.length - 1]! < totalPages - 1 && (
                <span className="pagination-ellipsis">...</span>
              )}
              <button
                className="pagination-button"
                onClick={() => onPageChange(totalPages)}
              >
                {totalPages}
              </button>
            </>
          )}

          <button
            className="pagination-button"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            aria-label="Go to next page"
          >
            ›
          </button>

          <button
            className="pagination-button"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(totalPages)}
            aria-label="Go to last page"
          >
            »»
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pagination;