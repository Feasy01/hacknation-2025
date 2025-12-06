const Sidebar = ({ sections = [] }) => (
  <nav className="space-y-6">
    {sections.map((section) => (
      <div key={section.label} className="space-y-3">
        <p className="text-xs font-semibold uppercase text-slate-500">{section.label}</p>
        <ul className="space-y-1">
          {section.items.map((item) => (
            <li key={item.label}>
              <a
                href={item.href}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition hover:bg-slate-100 ${
                  item.active ? 'bg-slate-100 text-slate-900' : 'text-slate-700'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    ))}
  </nav>
);

export default Sidebar;
