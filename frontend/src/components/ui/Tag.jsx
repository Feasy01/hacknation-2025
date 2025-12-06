const Tag = ({ label, onRemove }) => (
  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
    {label}
    {onRemove ? (
      <button type="button" className="text-slate-500" onClick={onRemove}>
        ×
      </button>
    ) : null}
  </span>
);

export default Tag;
