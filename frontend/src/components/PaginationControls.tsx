import { Pagination } from "react-bootstrap";

type PaginationControlsProps = {
  onPageChange: (page: number) => void;
  page: number;
  pageSize: number;
  totalItems: number;
};

export function PaginationControls({
  onPageChange,
  page,
  pageSize,
  totalItems,
}: PaginationControlsProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  if (totalItems <= pageSize) {
    return null;
  }

  return (
    <Pagination className="mb-0" aria-label="Equipment pagination">
      <Pagination.Prev disabled={page === 1} onClick={() => onPageChange(page - 1)} />
      {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
        <Pagination.Item
          key={pageNumber}
          active={pageNumber === page}
          onClick={() => onPageChange(pageNumber)}
        >
          {pageNumber}
        </Pagination.Item>
      ))}
      <Pagination.Next
        disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)}
      />
    </Pagination>
  );
}
