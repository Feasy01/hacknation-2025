import React from 'react';
import { ZusHeader } from './ZusHeader';
import { ZusSidebar } from './ZusSidebar';
import { HelpCircle } from 'lucide-react';

interface ZusLayoutProps {
  children: React.ReactNode;
  title: string;
  onNavigate: (id: string) => void;
  activeItem?: string;
}

export const ZusLayout: React.FC<ZusLayoutProps> = ({ 
  children, 
  title, 
  onNavigate,
  activeItem 
}) => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <ZusHeader />
      
      <div className="flex flex-1">
        <ZusSidebar onNavigate={onNavigate} activeItem={activeItem} />
        
        <main className="flex-1 flex flex-col min-w-0">
          {/* Content header */}
          <div className="bg-sidebar-header text-sidebar-header-foreground px-4 py-2.5 flex items-center gap-2">
            <span className="font-semibold text-sm uppercase">{title}</span>
            <HelpCircle className="w-3.5 h-3.5 opacity-70" />
          </div>
          
          {/* Content area */}
          <div className="flex-1 p-4 overflow-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-border bg-card px-4 py-2 flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>Ubezpieczony - Kreatory wniosków</span>
          <span className="text-primary hover:underline cursor-pointer">Ustawienia cookies</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Do końca sesji pozostało: 15 min.</span>
          <span>Numer wersji: 1.0.0</span>
        </div>
      </footer>
    </div>
  );
};
