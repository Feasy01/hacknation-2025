import React from 'react';
import { HelpCircle, Phone, AlertTriangle, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ZusHeaderProps {
  userName?: string;
}

export const ZusHeader: React.FC<ZusHeaderProps> = ({ userName = 'Użytkownik' }) => {
  return (
    <header className="bg-header text-header-foreground">
      <div className="flex items-center justify-between px-4 py-2">
        {/* Left section - Logo and user */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            {/* ZUS Logo placeholder */}
            <div className="text-2xl font-bold tracking-tight text-primary">
              <span className="text-[hsl(68,50%,50%)]">Z</span>
              <span className="text-[hsl(68,50%,50%)]">U</span>
              <span className="text-[hsl(68,50%,50%)]">S</span>
            </div>
          </div>
          <div className="text-sm">
            <span className="text-muted-foreground">Jesteś zalogowany jako: </span>
            <span className="font-semibold">{userName}</span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs h-7 px-3 bg-transparent border-header-foreground/30 text-header-foreground hover:bg-header-foreground/10"
          >
            Wyloguj
          </Button>
        </div>

        {/* Right section - Quick links */}
        <div className="flex items-center gap-4">
          <button className="flex items-center gap-2 text-xs hover:text-primary transition-colors">
            <HelpCircle className="w-4 h-4" />
            <span>Zadaj pytanie ZUS</span>
          </button>
          <button className="flex items-center gap-2 text-xs hover:text-primary transition-colors">
            <Phone className="w-4 h-4" />
            <span>Kontakt z CKK</span>
          </button>
          <button className="flex items-center gap-2 text-xs hover:text-primary transition-colors">
            <AlertTriangle className="w-4 h-4" />
            <span className="hidden lg:inline">Zgłoś incydent bezpieczeństwa</span>
          </button>
          <button className="flex items-center gap-2 text-xs hover:text-primary transition-colors">
            <Globe className="w-4 h-4" />
            <span>Mowa</span>
          </button>
        </div>
      </div>

      {/* Role tabs */}
      <div className="flex justify-end px-4 pb-1">
        <div className="flex">
          <button className="px-4 py-1.5 text-xs bg-secondary text-secondary-foreground border border-border">
            Ogólny
          </button>
          <button className="px-4 py-1.5 text-xs bg-primary text-primary-foreground">
            Ubezpieczony
          </button>
          <button className="px-4 py-1.5 text-xs bg-secondary text-secondary-foreground border border-border">
            Płatnik
          </button>
          <button className="px-4 py-1.5 text-xs bg-[hsl(120,40%,45%)] text-primary-foreground">
            ePłatnik
          </button>
        </div>
      </div>
    </header>
  );
};
