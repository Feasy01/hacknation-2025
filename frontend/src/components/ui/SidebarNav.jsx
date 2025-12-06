import { baseCard } from './styles';

const SidebarNav = ({ groups = [] }) => (
  <div className={`${baseCard} p-4`}>
    <nav className="space-y-4">
      {groups.map((group) => (
        <div key={group.label} className="space-y-2">
          <p className="text-xs font-semibold uppercase text-slate-500">{group.label}</p>
          <div className="space-y-1">
            {group.items.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                  item.active ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </a>
            ))}
          </div>
        </div>
      ))}
    </nav>
  </div>
);

export default SidebarNav;
