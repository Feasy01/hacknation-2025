import { useEffect } from 'react';
import { Menu } from 'lucide-react';

import useBreakpoint from '@/hooks/useBreakpoint';
import useDisclosure from '@/hooks/useDisclosure';

const AppShell = ({ header, sidebar, footer, children }) => {
  const { isOpen, toggle, close } = useDisclosure(true);
  const isDesktop = useBreakpoint('md');

  useEffect(() => {
    if (isDesktop) {
      close();
    }
  }, [isDesktop, close]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {header ? (
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
          <div className="flex items-center justify-between px-4 py-3 lg:px-6">
            <div className="flex items-center gap-3">
              {sidebar && (
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium shadow-sm lg:hidden"
                  onClick={toggle}
                >
                  <Menu className="h-4 w-4" />
                  Menu
                </button>
              )}
              {header}
            </div>
          </div>
        </header>
      ) : null}

      <div className="mx-auto flex max-w-7xl gap-6 px-4 py-8 lg:px-6">
        {sidebar ? (
          <aside
            className={`transition-all duration-200 lg:static ${
              isDesktop ? 'hidden lg:block' : isOpen ? 'fixed inset-0 z-30 block' : 'hidden'
            }`}
          >
            <div className="relative h-full w-72 lg:w-64">
              <div className="absolute inset-0 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-xl lg:shadow-sm">
                {sidebar}
              </div>
            </div>
          </aside>
        ) : null}

        <main className="flex-1 space-y-6">
          {children}
          {footer ? <div className="pt-6">{footer}</div> : null}
        </main>
      </div>
    </div>
  );
};

export default AppShell;
