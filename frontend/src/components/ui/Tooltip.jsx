const Tooltip = ({ label, children }) => (
  <span className="group relative inline-flex">
    {children}
    <span className="pointer-events-none absolute left-1/2 top-full mt-2 hidden -translate-x-1/2 rounded-md bg-slate-900 px-2 py-1 text-xs text-white shadow-lg group-hover:block">
      {label}
    </span>
  </span>
);

export default Tooltip;
