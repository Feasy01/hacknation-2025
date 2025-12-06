import { useMemo, useState } from 'react';

const usePagination = ({ total = 0, initialPage = 1, initialPageSize = 10 }) => {
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / pageSize)), [total, pageSize]);

  return {
    page,
    pageSize,
    totalPages,
    setPage,
    setPageSize,
  };
};

export default usePagination;
