const Breadcrumbs = ({ items = [] }) => (
  <nav aria-label="Breadcrumb">
    <ol className="flex items-center gap-2 text-sm text-slate-600">
      {items.map((item, index) => (
        <li key={item.label} className="flex items-center gap-2">
          {item.href ? (
            <a className="font-medium text-slate-700 hover:text-slate-900" href={item.href}>
              {item.label}
            </a>
          ) : (
            <span className="font-semibold text-slate-900">{item.label}</span>
          )}
          {index < items.length - 1 ? <span className="text-slate-400">/</span> : null}
        </li>
      ))}
    </ol>
  </nav>
);

export default Breadcrumbs;
