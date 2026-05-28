import React from 'react';
import './Table.css';

export const Table = ({ children }) => (
  <div className="table-wrapper">
    <table className="table">{children}</table>
  </div>
);

export const Thead = ({ children }) => <thead className="table-head">{children}</thead>;
export const Tbody = ({ children }) => <tbody>{children}</tbody>;
export const Th = ({ children, className = '' }) => <th className={`th ${className}`}>{children}</th>;
export const Td = ({ children, className = '', colSpan }) => <td className={`td ${className}`} colSpan={colSpan}>{children}</td>;
export const Tr = ({ children, className = '' }) => <tr className={`tr ${className}`}>{children}</tr>;

export const Pagination = ({ page, totalPages, onPageChange, total, limit }) => {
  const pages = [];
  const maxVisible = 5;
  let start = Math.max(1, page - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages, start + maxVisible - 1);
  if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);

  for (let i = start; i <= end; i++) pages.push(i);

  if (totalPages <= 1) return null;

  return (
    <div className="pagination">
      <span className="pagination-info">
        Showing {Math.min((page - 1) * limit + 1, total)}–{Math.min(page * limit, total)} of {total}
      </span>
      <div className="pagination-controls">
        <button
          className="page-btn"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
        >
          ‹
        </button>
        {pages.map((p) => (
          <button
            key={p}
            className={`page-btn ${p === page ? 'active' : ''}`}
            onClick={() => onPageChange(p)}
          >
            {p}
          </button>
        ))}
        <button
          className="page-btn"
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
        >
          ›
        </button>
      </div>
    </div>
  );
};
