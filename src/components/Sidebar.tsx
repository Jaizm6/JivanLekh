import React, { useState } from 'react';
import {
  BookOpen,
  FolderPlus,
  Plus,
  Trash2,
  Tag as TagIcon,
  Pin,
  ChevronDown,
  ChevronRight,
  MoreVertical,
  Edit2,
  X,
  Layers,
  Sparkles,
  Command
} from 'lucide-react';
import { Workspace, Notebook, Tag } from '../types';

interface SidebarProps {
  workspaces: Workspace[];
  activeWorkspaceId: string;
  onSelectWorkspace: (id: string) => void;
  onCreateWorkspace: (name: string) => void;
  notebooks: Notebook[];
  activeNotebookId: string;
  onSelectNotebook: (id: string) => void;
  onCreateNotebook: (name: string, color?: string) => void;
  onRenameNotebook: (id: string, name: string) => void;
  onDeleteNotebook: (id: string) => void;
  tags: Tag[];
  cardsCountByNotebook: Record<string, number>;
  cardsCountByTag: Record<string, number>;
  allCardsCount: number;
  pinnedCount: number;
  trashCount: number;
  onCreateCard: () => void;
  onOpenCommandPalette: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  workspaces,
  activeWorkspaceId,
  onSelectWorkspace,
  onCreateWorkspace,
  notebooks,
  activeNotebookId,
  onSelectNotebook,
  onCreateNotebook,
  onRenameNotebook,
  onDeleteNotebook,
  tags,
  cardsCountByNotebook,
  cardsCountByTag,
  allCardsCount,
  pinnedCount,
  trashCount,
  onCreateCard,
  onOpenCommandPalette,
  isOpenMobile,
  onCloseMobile
}) => {
  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false);
  const [isNotebooksExpanded, setIsNotebooksExpanded] = useState(true);
  const [isTagsExpanded, setIsTagsExpanded] = useState(true);
  const [editingNbId, setEditingNbId] = useState<string | null>(null);
  const [editingNbName, setEditingNbName] = useState('');
  const [activeMenuNbId, setActiveMenuNbId] = useState<string | null>(null);

  const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId) || workspaces[0];

  const handleStartRename = (nb: Notebook) => {
    setEditingNbId(nb.id);
    setEditingNbName(nb.name);
    setActiveMenuNbId(null);
  };

  const handleFinishRename = () => {
    if (editingNbId && editingNbName.trim()) {
      onRenameNotebook(editingNbId, editingNbName.trim());
    }
    setEditingNbId(null);
  };

  const handlePromptCreateNotebook = () => {
    const name = window.prompt('Enter new notebook name:');
    if (name && name.trim()) {
      onCreateNotebook(name.trim());
    }
  };

  const handlePromptCreateWorkspace = () => {
    const name = window.prompt('Enter new workspace name:');
    if (name && name.trim()) {
      onCreateWorkspace(name.trim());
      setIsWorkspaceMenuOpen(false);
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/25 backdrop-blur-xs z-40 md:hidden"
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-[#F8F9FA] border-r border-[#E5E7EB] flex flex-col transition-transform duration-200 ease-in-out md:translate-x-0 ${
          isOpenMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-14 px-4 border-b border-[#E5E7EB] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs tracking-wider shadow-xs">
              JL
            </div>
            <div>
              <h1 className="font-semibold text-sm tracking-tight text-[#1F2937] leading-none">
                JivanLekh
              </h1>
              <span className="text-[10px] text-[#6B7280] font-medium tracking-wide uppercase">
                UpNote Elegance
              </span>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-200/60"
          >
            <X size={18} />
          </button>
        </div>

        {/* Workspace Switcher */}
        <div className="relative px-3 pt-3">
          <button
            onClick={() => setIsWorkspaceMenuOpen(!isWorkspaceMenuOpen)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-white border border-[#E5E7EB] text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-2xs transition-colors"
          >
            <div className="flex items-center gap-2 truncate">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <span className="truncate">{activeWorkspace?.name || 'Workspace'}</span>
            </div>
            <ChevronDown size={14} className="text-gray-400 shrink-0" />
          </button>

          {isWorkspaceMenuOpen && (
            <div className="absolute left-3 right-3 top-12 z-30 bg-white border border-[#E5E7EB] rounded-xl shadow-lg p-1.5 space-y-0.5">
              <div className="px-2 py-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                Workspaces
              </div>
              {workspaces.map(ws => (
                <button
                  key={ws.id}
                  onClick={() => {
                    onSelectWorkspace(ws.id);
                    setIsWorkspaceMenuOpen(false);
                  }}
                  className={`w-full text-left px-2.5 py-1.5 text-xs rounded-md transition-colors ${
                    activeWorkspaceId === ws.id
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  {ws.name}
                </button>
              ))}
              <div className="h-px bg-gray-100 my-1"></div>
              <button
                onClick={handlePromptCreateWorkspace}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-blue-600 hover:bg-blue-50 rounded-md font-medium"
              >
                <Plus size={13} />
                <span>New Workspace</span>
              </button>
            </div>
          )}
        </div>

        {/* New Card Button */}
        <div className="p-3">
          <button
            onClick={() => {
              onCreateCard();
              onCloseMobile();
            }}
            className="w-full flex items-center justify-center gap-2 bg-[#3B82F6] hover:bg-blue-600 active:scale-[0.98] text-white py-2 px-4 rounded-lg font-medium text-xs shadow-xs transition-all"
          >
            <Plus size={16} />
            <span>New Note</span>
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-2 space-y-4 pb-4 select-none">
          {/* General Views */}
          <div className="space-y-0.5">
            <button
              onClick={() => {
                onSelectNotebook('all');
                onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeNotebookId === 'all'
                  ? 'bg-white shadow-2xs text-[#3B82F6] font-semibold border border-[#E5E7EB]'
                  : 'text-gray-600 hover:bg-gray-200/50 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Layers size={15} className={activeNotebookId === 'all' ? 'text-blue-500' : 'text-gray-400'} />
                <span>All notes</span>
              </div>
              <span className="text-[11px] font-semibold bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-md border border-gray-200 ml-auto shrink-0">
                {allCardsCount}
              </span>
            </button>

            <button
              onClick={() => {
                onSelectNotebook('pinned');
                onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeNotebookId === 'pinned'
                  ? 'bg-white shadow-2xs text-[#3B82F6] font-semibold border border-[#E5E7EB]'
                  : 'text-gray-600 hover:bg-gray-200/50 hover:text-gray-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Pin size={15} className={activeNotebookId === 'pinned' ? 'text-blue-500' : 'text-gray-400'} />
                <span>Pinned</span>
              </div>
              <span className="text-[11px] font-semibold bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-md border border-gray-200 ml-auto shrink-0">
                {pinnedCount}
              </span>
            </button>
          </div>

          {/* Notebooks List */}
          <div>
            <div className="flex items-center justify-between px-2 pb-1.5">
              <button
                onClick={() => setIsNotebooksExpanded(!isNotebooksExpanded)}
                className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-600"
              >
                {isNotebooksExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                <span>Notebooks</span>
              </button>
              <button
                onClick={handlePromptCreateNotebook}
                title="Create Notebook"
                className="p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 rounded"
              >
                <FolderPlus size={14} />
              </button>
            </div>

            {isNotebooksExpanded && (
              <div className="space-y-0.5 mt-0.5">
                {notebooks.length === 0 ? (
                  <div className="px-3 py-2 text-xs text-gray-400 italic">No notebooks in this workspace</div>
                ) : (
                  notebooks.map(nb => {
                    const isActive = activeNotebookId === nb.id;
                    const count = cardsCountByNotebook[nb.id] || 0;

                    if (editingNbId === nb.id) {
                      return (
                        <div key={nb.id} className="px-2 py-1">
                          <input
                            type="text"
                            value={editingNbName}
                            onChange={e => setEditingNbName(e.target.value)}
                            onBlur={handleFinishRename}
                            onKeyDown={e => {
                              if (e.key === 'Enter') handleFinishRename();
                              if (e.key === 'Escape') setEditingNbId(null);
                            }}
                            autoFocus
                            className="w-full px-2 py-1 bg-white border border-blue-400 rounded text-xs outline-none"
                          />
                        </div>
                      );
                    }

                    return (
                      <div key={nb.id} className="relative group">
                        <button
                          onClick={() => {
                            onSelectNotebook(nb.id);
                            onCloseMobile();
                          }}
                          className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            isActive
                              ? 'bg-white shadow-2xs text-[#3B82F6] font-semibold border border-[#E5E7EB]'
                              : 'text-gray-600 hover:bg-gray-200/50 hover:text-gray-900'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <span
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ backgroundColor: nb.color || '#3b82f6' }}
                            />
                            <span className="truncate">{nb.name}</span>
                          </div>
                          <div className="flex items-center gap-1 ml-auto shrink-0">
                            <span className="text-[11px] font-semibold bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-md border border-gray-200 group-hover:hidden">
                              {count}
                            </span>
                            <div
                              onClick={e => {
                                e.stopPropagation();
                                setActiveMenuNbId(activeMenuNbId === nb.id ? null : nb.id);
                              }}
                              className="hidden group-hover:flex items-center justify-center p-1 hover:bg-gray-200/70 rounded text-gray-500"
                            >
                              <MoreVertical size={12} />
                            </div>
                          </div>
                        </button>

                        {/* Dropdown Menu for Notebook */}
                        {activeMenuNbId === nb.id && (
                          <div
                            onMouseLeave={() => setActiveMenuNbId(null)}
                            className="absolute right-2 top-8 z-40 bg-white border border-gray-200 rounded-lg shadow-lg py-1 w-28 text-xs"
                          >
                            <button
                              onClick={() => handleStartRename(nb)}
                              className="w-full text-left px-3 py-1.5 hover:bg-gray-50 text-gray-700 flex items-center gap-2"
                            >
                              <Edit2 size={12} /> Rename
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(`Delete notebook "${nb.name}" and move its notes to trash?`)) {
                                  onDeleteNotebook(nb.id);
                                }
                                setActiveMenuNbId(null);
                              }}
                              className="w-full text-left px-3 py-1.5 hover:bg-red-50 text-red-600 flex items-center gap-2"
                            >
                              <Trash2 size={12} /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* Tags List */}
          <div>
            <div className="flex items-center justify-between px-2 pb-1.5">
              <button
                onClick={() => setIsTagsExpanded(!isTagsExpanded)}
                className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-600"
              >
                {isTagsExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                <span>Tags</span>
              </button>
            </div>

            {isTagsExpanded && (
              <div className="space-y-0.5 mt-0.5">
                {tags.length === 0 ? (
                  <div className="px-3 py-2 text-xs text-gray-400 italic">No tags yet</div>
                ) : (
                  tags.map(t => {
                    const isSelected = activeNotebookId === `tag:${t.name}`;
                    const tagCount = cardsCountByTag[t.name] || 0;
                    return (
                      <button
                        key={t.id}
                        onClick={() => {
                          onSelectNotebook(`tag:${t.name}`);
                          onCloseMobile();
                        }}
                        className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          isSelected
                            ? 'bg-white shadow-2xs text-[#3B82F6] font-semibold border border-[#E5E7EB]'
                            : 'text-gray-600 hover:bg-gray-200/50 hover:text-gray-900'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <TagIcon size={13} className={isSelected ? 'text-blue-500' : 'text-gray-400'} />
                          <span className="truncate">#{t.name}</span>
                        </div>
                        <span className="text-[11px] font-semibold bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-md border border-gray-200 ml-auto shrink-0">
                          {tagCount}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* Trash */}
          <div className="pt-2 border-t border-[#E5E7EB]">
            <button
              onClick={() => {
                onSelectNotebook('trash');
                onCloseMobile();
              }}
              className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                activeNotebookId === 'trash'
                  ? 'bg-red-50 text-red-600 font-semibold border border-red-200'
                  : 'text-gray-500 hover:bg-gray-200/50 hover:text-gray-800'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Trash2 size={15} />
                <span>Trash</span>
              </div>
              <span className="text-[11px] font-semibold bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-md border border-gray-200 ml-auto shrink-0">
                {trashCount}
              </span>
            </button>
          </div>
        </div>

        {/* Footer info & Command Palette shortcut */}
        <div className="p-3 border-t border-[#E5E7EB] bg-white/50">
          <button
            onClick={onOpenCommandPalette}
            className="w-full flex items-center justify-between px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200/70 rounded-lg text-[11px] text-gray-500 transition-colors"
          >
            <div className="flex items-center gap-1.5">
              <Command size={12} />
              <span>Search & Jump</span>
            </div>
            <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded text-[9px] font-mono text-gray-600 shadow-2xs">
              ⌘K
            </kbd>
          </button>
        </div>
      </aside>
    </>
  );
};
