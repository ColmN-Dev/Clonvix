import { ChevronLeft, ChevronRight } from 'lucide-react';

type PaginationProps = {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
};

// Pagination component to display page numbers and navigation buttons, inspired by GitHub's pagination style

export default function Pagination({
    currentPage,
    totalPages,
    onPageChange,
}: PaginationProps) {

    // Array to store the page numbers and ellipses displayed in the pagination
    const pages: (number | string)[] = [];

    // If there is one or less pages, do not render the pagination component
    if (totalPages <= 1) {
        return null;
    }

    // Show all pages if there are 7 or less
    if (totalPages <= 7) {
        // Loop through each page and add it to the pages array
        for (let page = 1; page <= totalPages; page++) {
            pages.push(page);
        }
    } else {

        // Always show the first page
        pages.push(1);

        // Calculate the range of pages to display based on the current page
        const startPage = currentPage <= 5 ? 2 : currentPage >= totalPages - 4 ? totalPages - 6 : currentPage - 2;
        const endPage = currentPage <= 5 ? 7 : currentPage >= totalPages - 4 ? totalPages - 1 : currentPage + 2;

        // Add an ellipsis when pages are skipped before the visible range
        if (startPage > 2) {
            pages.push('...');
        }

        // Loop through the calculated range and add each page number
        for (let page = startPage; page <= endPage; page++) {
            pages.push(page);
        }

        // Add an ellipsis when pages are skipped before the last page
        if (endPage < totalPages - 1) {
            pages.push('...');
        }

        // Always show the last page
        pages.push(totalPages);
    }

    return (
        <div className="pagination-container">
            <nav className="pagination-nav">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`pagination-button pagination-nav-button ${currentPage === 1 ? 'pagination-disabled' : ''}`}
                >
                    <ChevronLeft size={16} />
                    Previous
                </button>
                {pages.map((page, index) => (
                    <button
                        key={index}
                        onClick={() => typeof page === 'number' && onPageChange(page)}
                        className={`pagination-button ${page === currentPage ? 'active' : ''} ${typeof page === 'string' ? 'ellipsis' : ''}`}
                    >
                        {page}
                    </button>
                ))}
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={`pagination-button pagination-nav-button ${currentPage === totalPages ? 'pagination-disabled' : ''}`}
                >
                    Next
                    <ChevronRight size={16} />
                </button>
            </nav>
        </div>
    );
}