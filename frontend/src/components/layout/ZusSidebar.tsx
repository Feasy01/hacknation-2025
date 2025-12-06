import React, { useState } from 'react';
import { 
  Users, 
  CreditCard, 
  FileText, 
  ClipboardList, 
  HeartHandshake,
  Baby,
  UserCheck,
  GraduationCap,
  RefreshCw,
  Settings as SettingsIcon,
  Search,
  Calendar,
  ChevronUp,
  ChevronDown,
  AlertTriangle,
  HelpCircle,
  Square
} from 'lucide-react';

interface MenuItem {
  id: string;
  label: string;
  sublabel?: string;
  icon?: React.ReactNode;
  children?: MenuItem[];
  active?: boolean;
  disabled?: boolean;
}

const menuItems: MenuItem[] = [
  {
    id: 'panel-rodziny',
    label: 'Panel członka rodziny',
    icon: <Users className="w-5 h-5 text-primary" />,
    disabled: true,
  },
  {
    id: 'panel-ubezpieczonego',
    label: 'Panel Ubezpieczonego',
    sublabel: 'Składki, OFE, stan konta',
    icon: <CreditCard className="w-5 h-5 text-primary" />,
    disabled: true,
  },
  {
    id: 'dokumenty',
    label: 'Dokumenty i wiadomości',
    sublabel: 'Korespondencja z ZUS',
    icon: <FileText className="w-5 h-5 text-primary" />,
    disabled: true,
  },
  {
    id: 'kreatory',
    label: 'Kreatory wniosków',
    icon: <ClipboardList className="w-5 h-5 text-primary" />,
    children: [
      { id: 'wypadek', label: 'Zawiadomienie o wypadku przy pracy', active: true },
      { id: 'inne', label: 'Inne wnioski', disabled: true },
    ],
  },
  {
    id: 'swiadczenia',
    label: 'Świadczenia wspierające',
    sublabel: 'Wniosek i informacje',
    icon: <HeartHandshake className="w-5 h-5 text-primary" />,
    disabled: true,
  },
  {
    id: 'rodzina800',
    label: 'Rodzina 800+',
    sublabel: 'Wniosek i informacje',
    icon: <Baby className="w-5 h-5 text-primary" />,
    disabled: true,
  },
  {
    id: 'aktywny-rodzic',
    label: 'Aktywny Rodzic',
    sublabel: 'Wniosek i informacje',
    icon: <UserCheck className="w-5 h-5 text-primary" />,
    disabled: true,
  },
  {
    id: 'dobry-start',
    label: 'Dobry start',
    sublabel: 'Wniosek i informacje',
    icon: <GraduationCap className="w-5 h-5 text-primary" />,
    disabled: true,
  },
  {
    id: 'zlecenia',
    label: 'Zlecenia',
    sublabel: 'Autoryzacja operacji',
    icon: <RefreshCw className="w-5 h-5 text-primary" />,
    disabled: true,
  },
  {
    id: 'uslugi',
    label: 'Usługi',
    sublabel: 'Katalog usług elektronicznych',
    icon: <SettingsIcon className="w-5 h-5 text-primary" />,
    disabled: true,
  },
  {
    id: 'wyszukiwanie',
    label: 'Wyszukiwanie, mapa strony',
    sublabel: 'Wyszukiwanie na portalu',
    icon: <Search className="w-5 h-5 text-primary" />,
    disabled: true,
  },
  {
    id: 'wizyty',
    label: 'Wizyty',
    sublabel: 'Rezerwacja wizyty w ZUS',
    icon: <Calendar className="w-5 h-5 text-primary" />,
    disabled: true,
  },
  {
    id: 'ustawienia',
    label: 'Ustawienia',
    sublabel: 'Konfiguracja profilu',
    icon: <SettingsIcon className="w-5 h-5 text-primary" />,
    disabled: true,
  },
];

interface ZusSidebarProps {
  onNavigate: (id: string) => void;
  activeItem?: string;
}

export const ZusSidebar: React.FC<ZusSidebarProps> = ({ onNavigate, activeItem = 'wypadek' }) => {
  const [expandedItems, setExpandedItems] = useState<string[]>(['kreatory']);

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const renderMenuItem = (item: MenuItem, isChild = false) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.id);
    const isActive = item.active || activeItem === item.id;

    return (
      <div key={item.id}>
        <div
          onClick={() => {
            if (hasChildren) {
              toggleExpanded(item.id);
            } else if (!item.disabled) {
              onNavigate(item.id);
            }
          }}
          className={`
            zus-menu-item
            ${isChild ? 'pl-8' : ''}
            ${isActive && !hasChildren ? 'zus-menu-item-active' : ''}
            ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {isChild && (
              <Square className={`w-2 h-2 ${isActive ? 'text-primary fill-primary' : 'text-muted-foreground'}`} />
            )}
            <div className="flex-1 min-w-0">
              <div className={`font-medium truncate ${isActive ? 'text-primary' : ''}`}>
                {item.label}
              </div>
              {item.sublabel && (
                <div className="text-xs text-muted-foreground truncate">
                  {item.sublabel}
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {hasChildren ? (
              isExpanded ? (
                <ChevronUp className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              )
            ) : (
              item.icon
            )}
          </div>
        </div>
        
        {hasChildren && isExpanded && (
          <div className="bg-muted/20">
            {item.children!.map(child => renderMenuItem(child, true))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className="w-72 bg-sidebar border-r border-sidebar-border flex flex-col shrink-0">
      {/* Menu header */}
      <div className="bg-sidebar-header text-sidebar-header-foreground px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm">MENU</span>
          <HelpCircle className="w-3.5 h-3.5 opacity-70" />
        </div>
        <button className="p-1 hover:bg-sidebar-header-foreground/10 rounded">
          <ChevronUp className="w-4 h-4" />
        </button>
      </div>

      {/* Scroll controls */}
      <div className="flex justify-center py-1 border-b border-sidebar-border">
        <button className="p-1 hover:bg-muted rounded">
          <ChevronUp className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>

      {/* Menu items */}
      <div className="flex-1 overflow-y-auto">
        {menuItems.map(item => renderMenuItem(item))}
      </div>

      {/* Scroll controls bottom */}
      <div className="flex justify-center py-1 border-t border-sidebar-border">
        <button className="p-1 hover:bg-muted rounded">
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
    </aside>
  );
};
