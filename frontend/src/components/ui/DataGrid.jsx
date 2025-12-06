import { useEffect, useMemo, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-quartz.css';

import usePagination from '@/hooks/usePagination';
import useQueryParams from '@/hooks/useQueryParams';

const DataGrid = ({ rowData = [], columnDefs = [], statusBar, toolbar, emptyState, pagination }) => {
  const gridRef = useRef(null);
  const { setParams } = useQueryParams();
  const { page, pageSize, setPage, setPageSize, totalPages } = usePagination({
    total: rowData.length,
    initialPageSize: pagination?.pageSize || 10,
  });

  const visibleRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return rowData.slice(start, start + pageSize);
  }, [page, pageSize, rowData]);

  useEffect(() => {
    if (pagination?.syncParams) {
      setParams({ page, pageSize });
    }
  }, [page, pageSize, pagination, setParams]);

  return (
    <div className="space-y-3">
      {toolbar}
      <div className="ag-theme-quartz w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <AgGridReact
          ref={gridRef}
          rowData={visibleRows}
          columnDefs={columnDefs}
          animateRows
          pagination={false}
          suppressCellFocus
          defaultColDef={{ resizable: true, sortable: true, filter: true }}
        />
      </div>
      {visibleRows.length === 0 && emptyState}
      <div className="flex items-center justify-between text-sm text-slate-600">
        {pagination ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded border border-slate-200 px-2 py-1 hover:bg-slate-100"
              onClick={() => setPage(Math.max(1, page - 1))}
            >
              Prev
            </button>
            <span>
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              className="rounded border border-slate-200 px-2 py-1 hover:bg-slate-100"
              onClick={() => setPage(Math.min(totalPages, page + 1))}
            >
              Next
            </button>
            <select
              className="rounded border border-slate-200 px-2 py-1"
              value={pageSize}
              onChange={(event) => setPageSize(Number(event.target.value))}
            >
              {[10, 20, 50].map((size) => (
                <option key={size} value={size}>
                  {size} / page
                </option>
              ))}
            </select>
          </div>
        ) : null}
        {statusBar}
      </div>
    </div>
  );
};

export default DataGrid;
