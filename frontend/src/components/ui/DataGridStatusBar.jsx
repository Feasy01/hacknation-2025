const DataGridStatusBar = ({ total, selected }) => (
  <div className="text-sm text-slate-600">
    {selected ? `${selected} selected • ` : ''}
    {total} total rows
  </div>
);

export default DataGridStatusBar;
