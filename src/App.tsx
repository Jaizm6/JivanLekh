import React, { useState, useEffect, useMemo } from 'react';
import { useJivanLekh } from './hooks/useJivanLekh';
import { Sidebar } from './components/Sidebar';
import { NoteList } from './components/NoteList';
import { Editor } from './components/Editor';
import { CommandPalette } from './components/CommandPalette';
import { Toast } from './components/Toast';

export default function App() {
  const {
    workspaces,
    activeWorkspaceId,
    setActiveWorkspaceId,
    notebooks,
    workspaceNotebooks,
    activeNotebookId,
    setActiveNotebookId,
    tags,
    cards,
    filteredCards,
    activeCardId,
    setActiveCardId,
    activeCard,
    searchQuery,
    setSearchQuery,
    toast,
    setToast,
    createCard,
    updateCard,
    trashCard,
    restoreCard,
    permanentlyDeleteCard,
    emptyTrash,
    createNotebook,
    renameNotebook,
    deleteNotebook,
    createWorkspace,
    addTagToCard,
    removeTagFromCard,
    showToast
  } = useJivanLekh();

  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  // Mobile pane: 'list' | 'editor'
  const [mobilePane, setMobilePane] = useState<'list' | 'editor'>('list');

  // Handle global shortcuts (Cmd+K for command palette, Cmd+N for new note)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      } else if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        createCard();
        setMobilePane('editor');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [createCard]);

  // Card counts per notebook
  const cardsCountByNotebook = useMemo(() => {
    const counts: Record<string, number> = {};
    cards.forEach(c => {
      if (!c.isTrashed) {
        counts[c.notebookId] = (counts[c.notebookId] || 0) + 1;
      }
    });
    return counts;
  }, [cards]);

  const allCardsCount = useMemo(() => {
    const wsNbIds = new Set(workspaceNotebooks.map(nb => nb.id));
    return cards.filter(c => !c.isTrashed && wsNbIds.has(c.notebookId)).length;
  }, [cards, workspaceNotebooks]);

  const pinnedCount = useMemo(() => {
    const wsNbIds = new Set(workspaceNotebooks.map(nb => nb.id));
    return cards.filter(c => !c.isTrashed && (c.pinned || c.pin) && wsNbIds.has(c.notebookId)).length;
  }, [cards, workspaceNotebooks]);

  const cardsCountByTag = useMemo(() => {
    const counts: Record<string, number> = {};
    const wsNbIds = new Set(workspaceNotebooks.map(nb => nb.id));
    cards.forEach(c => {
      if (!c.isTrashed && wsNbIds.has(c.notebookId) && c.tags) {
        c.tags.forEach(tagName => {
          counts[tagName] = (counts[tagName] || 0) + 1;
        });
      }
    });
    return counts;
  }, [cards, workspaceNotebooks]);

  const trashCount = useMemo(() => {
    return cards.filter(c => c.isTrashed).length;
  }, [cards]);

  // Active notebook info
  const activeNotebook = useMemo(() => {
    if (activeNotebookId === 'all') return { id: 'all', name: 'All Notes' };
    if (activeNotebookId === 'pinned') return { id: 'pinned', name: 'Pinned Notes' };
    if (activeNotebookId === 'trash') return { id: 'trash', name: 'Trash' };
    if (activeNotebookId.startsWith('tag:')) {
      return { id: activeNotebookId, name: `#${activeNotebookId.slice(4)}` };
    }
    return notebooks.find(nb => nb.id === activeNotebookId) || null;
  }, [activeNotebookId, notebooks]);

  const handleSelectCard = (id: string) => {
    setActiveCardId(id);
    setMobilePane('editor');
  };

  const handleCreateCardAction = () => {
    createCard();
    setMobilePane('editor');
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white text-[#1F2937] font-sans antialiased select-none">
      {/* 1. Left Pane: Sidebar */}
      <Sidebar
        workspaces={workspaces}
        activeWorkspaceId={activeWorkspaceId}
        onSelectWorkspace={id => {
          setActiveWorkspaceId(id);
          setActiveNotebookId('all');
        }}
        onCreateWorkspace={createWorkspace}
        notebooks={workspaceNotebooks}
        activeNotebookId={activeNotebookId}
        onSelectNotebook={id => {
          setActiveNotebookId(id);
          // If first card exists, select it
          const first = cards.find(c => {
            if (id === 'all') return !c.isTrashed;
            if (id === 'pinned') return !c.isTrashed && (c.pinned || c.pin);
            if (id === 'trash') return c.isTrashed;
            if (id.startsWith('tag:')) return c.tags.includes(id.slice(4)) && !c.isTrashed;
            return c.notebookId === id && !c.isTrashed;
          });
          if (first) setActiveCardId(first.id);
        }}
        onCreateNotebook={createNotebook}
        onRenameNotebook={renameNotebook}
        onDeleteNotebook={deleteNotebook}
        tags={tags}
        cardsCountByNotebook={cardsCountByNotebook}
        cardsCountByTag={cardsCountByTag}
        allCardsCount={allCardsCount}
        pinnedCount={pinnedCount}
        trashCount={trashCount}
        onCreateCard={handleCreateCardAction}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* 2. Middle Pane: Note List */}
      <div
        className={`h-full flex shrink-0 ${
          mobilePane === 'editor' ? 'hidden md:flex' : 'flex w-full md:w-auto'
        }`}
      >
        <NoteList
          cards={filteredCards}
          activeCardId={activeCardId}
          onSelectCard={handleSelectCard}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          title={activeNotebook?.name || 'Notes'}
          isTrashView={activeNotebookId === 'trash'}
          onEmptyTrash={emptyTrash}
          onCreateCard={handleCreateCardAction}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          activeNotebookId={activeNotebookId}
          onSelectNotebook={setActiveNotebookId}
        />
      </div>

      {/* 3. Right Pane: Editor */}
      <div
        className={`h-full flex-1 flex-col min-w-0 ${
          mobilePane === 'list' ? 'hidden md:flex' : 'flex'
        }`}
      >
        <Editor
          card={activeCard}
          notebook={notebooks.find(n => n.id === activeCard?.notebookId) || null}
          onUpdateCard={updateCard}
          onTrashCard={trashCard}
          onRestoreCard={restoreCard}
          onPermanentlyDeleteCard={permanentlyDeleteCard}
          onAddTag={addTagToCard}
          onRemoveTag={removeTagFromCard}
          onShowToast={showToast}
          onBackToListMobile={() => setMobilePane('list')}
        />
      </div>

      {/* Command Palette Modal (Cmd+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        cards={cards}
        notebooks={workspaceNotebooks}
        onSelectCard={handleSelectCard}
        onCreateCard={handleCreateCardAction}
        onSelectNotebook={id => setActiveNotebookId(id)}
      />

      {/* Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
