// Pagination.js
import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const getPaginationItems = () => {
    if (totalPages <= 4) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }
    
    let pages = [];
    if (currentPage <= 2) {
      pages = [1, 2, 3, 4, '...'];
    } else if (currentPage >= totalPages - 1) {
      pages = [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    } else {
      pages = [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
    }
    return pages;
  };

  const handleClick = (page) => {
    if (page === '...' || page === currentPage) return;
    onPageChange(page);
  };

  return (
    <div className="mt-4 flex justify-center items-center space-x-2">
      <button
        onClick={() => handleClick(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
      >
        Previous
      </button>
      {getPaginationItems().map((item, index) => (
        <button
          key={index}
          onClick={() => handleClick(item)}
          className={`px-4 py-2 mx-1 rounded ${
            item === currentPage ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
          }`}
        >
          {item}
        </button>
      ))}
      <button
        onClick={() => handleClick(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
