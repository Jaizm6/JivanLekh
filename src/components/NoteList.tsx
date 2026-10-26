import React from 'react';
import { Search, Menu, Plus, Trash2, FileText, ArrowLeft, RefreshCw } from 'lucide-react';
import { Card, CardColor } from '../types';

interface NoteListProps {
  cards: Card[];
  activeCardId: string | null;
  onSelectCard: (id: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  title: string;
  isTrashView: boolean;
  onEmptyTrash: () => void;
  onCreateCard: () => void;
  onOpenMobileSidebar: () => void;
  activeNotebookId?: string;
  onSelectNotebook?: (id: string) => void;
}

const COLOR_MAP: Record<CardColor, { bg: string; dot: string; border: string }> = {
  red: { bg: '#fee2e2', dot: '#ef4444', border: '#fca5a5' },
  blue: { bg: '#dbeafe', dot: '#3b82f6', border: '#93c5fd' },
  green: { bg: '#dcfce7', dot: '#10b981', border: '#86efac' },
  yellow: { bg: '#fef9c3', dot: '#f59e0b', border: '#fde047' },
  purple: { bg: '#f3e8ff', dot: '#8b5cf6', border: '#d8b4fe' },
  gray: { bg: '#f3f4f6', dot: '#6b7280', border: '#d1d5db' }
};

export const NoteList: React.FC<NoteListProps> = ({
  cards,
  activeCardId,
  onSelectCard,
  searchQuery,
  onSearchChange,
  title,
  isTrashView,
  onEmptyTrash,
  onCreateCard,
  onOpenMobileSidebar,
  activeNotebookId,
  onSelectNotebook
}) => {
  const formatDate = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    if (diff < 60 * 1000) return 'Just now';
    if (diff < 60 * 60 * 1000) return `${Math.floor(diff / (60 * 1000))}m ago`;
    if (diff < 24 * 60 * 60 * 1000) return `${Math.floor(diff / (60 * 60 * 1000))}h ago`;
    return new Date(timestamp).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric'
    });
  };

  const getSnippet = (html: string) => {
    if (!html) return 'Empty note';
    const clean = html.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
    return clean || 'Empty note';
  };

  return (
    <section className="h-full w-full md:w-80 lg:w-88 bg-white border-r border-[#E5E7EB] flex flex-col shrink-0">
      {/* Top Header */}
      <div className="p-3.5 border-b border-[#E5E7EB] flex items-center justify-between gap-2 bg-[#FBFBFC]">
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={() => {
              if (activeNotebookId && activeNotebookId !== 'all' && onSelectNotebook) {
                onSelectNotebook('all');
              } else {
                onOpenMobileSidebar();
              }
            }}
            className="p-1.5 text-gray-500 hover:text-gray-800 rounded-lg hover:bg-gray-100"
            aria-label={activeNotebookId && activeNotebookId !== 'all' ? 'Back to All Notes' : 'Open Sidebar'}
            title={activeNotebookId && activeNotebookId !== 'all' ? 'Back to All Notes' : 'Open Sidebar'}
          >
            {activeNotebookId && activeNotebookId !== 'all' ? <ArrowLeft size={18} /> : <Menu size={18} />}
          </button>
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-[10px] tracking-wider shadow-xs flex-none">
              JL
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-semibold text-[#1F2937] truncate leading-tight flex items-center gap-1.5">
                <span>JivanLekh</span>
                {title && title !== 'All Notes' && (
                  <span className="text-xs font-normal text-gray-500 truncate">· {title}</span>
                )}
              </h2>
              <span className="text-[11px] text-[#6B7280]">
                {cards.length} {cards.length === 1 ? 'note' : 'notes'}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {isTrashView ? (
            cards.length > 0 && (
              <button
                onClick={() => {
                  if (window.confirm('Permanently delete all items in Trash?')) {
                    onEmptyTrash();
                  }
                }}
                className="text-xs text-red-600 hover:text-red-700 font-medium px-2 py-1 hover:bg-red-50 rounded"
              >
                Empty
              </button>
            )
          ) : (
            <button
              onClick={onCreateCard}
              title="New Note"
              className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Plus size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Search Input */}
      <div className="p-2.5 border-b border-[#E5E7EB] bg-white">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search notes, body, or #tags..."
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-[#F3F4F6] hover:bg-gray-100/90 focus:bg-white border border-transparent focus:border-blue-400 rounded-lg text-xs outline-none transition-all placeholder:text-gray-400 text-gray-700"
          />
        </div>
      </div>

      {/* Cards Grid (Compact Mode) */}
      <div className="flex-1 overflow-y-auto p-2.5">
        {cards.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-gray-400">
            <FileText size={36} strokeWidth={1.4} className="mb-2 opacity-40 text-gray-400" />
            <p className="text-xs font-medium text-gray-500">
              {searchQuery ? 'No notes match your search' : 'No notes here yet'}
            </p>
            {!isTrashView && (
              <button
                onClick={onCreateCard}
                className="mt-3 text-xs text-blue-600 hover:underline font-medium"
              >
                + Create a note
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {cards.map(card => {
              const isActive = activeCardId === card.id;
              const colorInfo = card.colorLabel ? (COLOR_MAP as any)[card.colorLabel] : null;

              return (
                <div
                  key={card.id}
                  onClick={() => onSelectCard(card.id)}
                  className={`group relative p-2.5 rounded-xl cursor-pointer transition-all border flex flex-col justify-between ${
                    isActive
                      ? 'bg-blue-50/60 border-blue-400 shadow-xs ring-1 ring-blue-300'
                      : 'bg-[#FCFCFD] hover:bg-white border-[#E5E7EB] hover:border-gray-300 shadow-2xs hover:shadow-xs'
                  }`}
                  style={colorInfo ? { backgroundColor: colorInfo.bg + '30', borderColor: colorInfo.border } : undefined}
                >
                  <div className="flex items-start justify-between gap-1 mb-1">
                    <h3
                      className={`text-xs font-semibold truncate leading-tight ${
                        isActive ? 'text-blue-700' : 'text-[#1F2937]'
                      } ${!card.title ? 'italic text-gray-400 font-normal' : ''}`}
                    >
                      {card.title || 'Untitled'}
                    </h3>
                    {colorInfo && (
                      <span
                        className="w-2 h-2 rounded-full shrink-0 mt-0.5"
                        style={{ backgroundColor: colorInfo.dot }}
                        title={`Color: ${card.colorLabel}`}
                      />
                    )}
                  </div>

                  <p className="text-[10px] text-[#6B7280] line-clamp-2 leading-snug mb-2 font-normal">
                    {getSnippet(card.body)}
                  </p>

                  <div className="flex items-center justify-between text-[9px] text-gray-400 mt-auto pt-1 border-t border-gray-100/80">
                    <span className="truncate">{formatDate(card.updatedAt)}</span>
                    {card.tags && card.tags.length > 0 && (
                      <span className="text-gray-500 font-medium truncate max-w-[50%]">
                        #{card.tags[0]}
                        {card.tags.length > 1 ? ` +${card.tags.length - 1}` : ''}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
