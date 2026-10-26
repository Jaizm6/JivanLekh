import React, { useState, useEffect, useRef } from 'react';
import { Search, FileText, Plus, Layers, Trash2, BookOpen, ArrowRight, X } from 'lucide-react';
import { Card, Notebook } from '../types';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  cards: Card[];
  notebooks: Notebook[];
  onSelectCard: (id: string) => void;
  onCreateCard: () => void;
  onSelectNotebook: (id: string) => void;
}

interface CommandItem {
  id: string;
  type: 'action' | 'notebook' | 'card';
  title: string;
  subtitle?: string;
  category: string;
  icon: React.ReactNode;
  run: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  cards,
  notebooks,
  onSelectCard,
  onCreateCard,
  onSelectNotebook
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 40);
    }
  }, [isOpen]);

  // Combine actions & cards into searchable results
  const items: CommandItem[] = React.useMemo(() => {
    const q = query.toLowerCase().trim();

    const quickActions: CommandItem[] = [
      {
        id: 'action-new',
        type: 'action' as const,
        title: 'Create new note',
        category: 'Actions',
        icon: <Plus size={15} className="text-blue-500" />,
        run: () => onCreateCard()
      },
      {
        id: 'action-all',
        type: 'action' as const,
        title: 'Go to All Notes',
        category: 'Views',
        icon: <Layers size={15} className="text-gray-500" />,
        run: () => onSelectNotebook('all')
      },
      {
        id: 'action-trash',
        type: 'action' as const,
        title: 'Open Trash',
        category: 'Views',
        icon: <Trash2 size={15} className="text-red-500" />,
        run: () => onSelectNotebook('trash')
      }
    ];

    const notebookItems: CommandItem[] = notebooks.map(nb => ({
      id: `nb-${nb.id}`,
      type: 'notebook' as const,
      title: `Notebook: ${nb.name}`,
      category: 'Notebooks',
      icon: <BookOpen size={15} style={{ color: nb.color || '#3b82f6' }} />,
      run: () => onSelectNotebook(nb.id)
    }));

    const cardItems: CommandItem[] = cards
      .filter(c => !c.isTrashed)
      .map(card => {
        const nb = notebooks.find(n => n.id === card.notebookId);
        return {
          id: `card-${card.id}`,
          type: 'card' as const,
          title: card.title || 'Untitled Note',
          subtitle: nb ? nb.name : 'Note',
          category: 'Notes',
          icon: <FileText size={15} className="text-gray-400" />,
          run: () => {
            onSelectCard(card.id);
            if (nb) onSelectNotebook(nb.id);
          }
        };
      });

    const all: CommandItem[] = [...quickActions, ...notebookItems, ...cardItems];

    if (!q) return all.slice(0, 10);

    return all
      .filter(item =>
        item.title.toLowerCase().includes(q) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(q))
      )
      .slice(0, 12);
  }, [query, cards, notebooks, onCreateCard, onSelectNotebook, onSelectCard]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % items.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + items.length) % items.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (items[selectedIndex]) {
        items[selectedIndex].run();
        onClose();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-start justify-center pt-20 px-4 animate-in fade-in duration-100"
    >
      <div
        onClick={e => e.stopPropagation()}
        className="w-full max-w-xl bg-white border border-[#E5E7EB] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150"
      >
        {/* Search header */}
        <div className="p-3.5 border-b border-[#E5E7EB] flex items-center gap-3">
          <Search size={18} className="text-gray-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search notes..."
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            className="w-full text-sm text-[#1F2937] placeholder-gray-400 bg-transparent border-none outline-none"
          />
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
          >
            <X size={16} />
          </button>
        </div>

        {/* Results list */}
        <div className="max-h-80 overflow-y-auto p-1.5 divide-y divide-gray-50">
          {items.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-400">
              No results found for "{query}"
            </div>
          ) : (
            items.map((item, index) => {
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    item.run();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`px-3 py-2 rounded-xl flex items-center justify-between cursor-pointer transition-colors ${
                    isSelected ? 'bg-blue-50/80 text-blue-900' : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="p-1 rounded-md bg-white border border-gray-100 shadow-2xs">
                      {item.icon}
                    </span>
                    <div className="min-w-0">
                      <div className="text-xs font-medium truncate">{item.title}</div>
                      {item.subtitle && (
                        <div className="text-[10px] text-gray-400 truncate">{item.subtitle}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-gray-400">
                    <span>{item.category}</span>
                    {isSelected && <ArrowRight size={12} className="text-blue-500" />}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 border-t border-gray-100 bg-gray-50 flex items-center justify-between text-[11px] text-gray-400">
          <div className="flex items-center gap-3">
            <span>↑↓ to navigate</span>
            <span>↵ to select</span>
            <span>esc to close</span>
          </div>
          <span>JivanLekh Quick Jump</span>
        </div>
      </div>
    </div>
  );
};
