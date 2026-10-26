import React from 'react';
import { ActiveView, AppState } from '../types';
import { Search, Menu, Moon, Sun, PanelLeft } from 'lucide-react';

export interface HeaderBarProps {
  state?: AppState;
  activeView?: ActiveView;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  onToggleSidebar?: () => void;
  onToggleTheme?: () => void;
  isDark?: boolean;
}

export const HeaderBar: React.FC<HeaderBarProps> = ({
  searchQuery = '',
  onSearchChange,
  onToggleSidebar,
  onToggleTheme,
  isDark = false
}) => {
  return (
    <header className="h-12 border-b border-gray-200 px-4 flex items-center justify-between bg-white">
      <div className="flex items-center gap-2">
        {onToggleSidebar && (
          <button onClick={onToggleSidebar} className="p-1.5 text-gray-500 hover:text-gray-800 rounded">
            <Menu size={16} />
          </button>
        )}
        <span className="font-semibold text-xs tracking-tight text-gray-800">JivanLekh</span>
      </div>

      <div className="flex items-center gap-2">
        {onSearchChange && (
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={e => onSearchChange(e.target.value)}
              className="pl-7 pr-3 py-1 bg-gray-100 rounded-md text-xs outline-none w-36 focus:w-48 transition-all"
            />
          </div>
        )}

        {onToggleTheme && (
          <button onClick={onToggleTheme} className="p-1.5 text-gray-500 hover:text-gray-800 rounded">
            {isDark ? <Sun size={15} /> : <Moon size={15} />}
          </button>
        )}
      </div>
    </header>
  );
};
