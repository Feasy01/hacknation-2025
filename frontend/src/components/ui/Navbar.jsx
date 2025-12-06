import { Moon, Sun } from 'lucide-react';

const Navbar = ({ logo, search, userMenu, actions = [], onToggleTheme, theme = 'light' }) => (
  <div className="flex items-center gap-4 px-4 py-3">
    {logo}
    <div className="hidden flex-1 md:block">{search}</div>
    <div className="flex items-center gap-2">
      {actions}
      <button
        type="button"
        className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white p-2 text-slate-700 shadow-sm"
        aria-label="Toggle theme"
        onClick={onToggleTheme}
      >
        {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
      </button>
      {userMenu}
    </div>
  </div>
);

export default Navbar;
