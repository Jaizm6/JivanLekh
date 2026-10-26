import { useState, useEffect, useMemo, useCallback } from 'react';
import { Workspace, Notebook, Card, Tag, ToastMessage } from '../types';

const STORAGE_KEY = 'jivanlekh_data_v2';

const INITIAL_WORKSPACES: Workspace[] = [
  { id: 'ws-personal', name: 'Personal Life' },
  { id: 'ws-work', name: 'Work & Ventures' }
];

const INITIAL_NOTEBOOKS: Notebook[] = [
  { id: 'nb-ideas', workspaceId: 'ws-personal', name: 'Ideas & Reflections', icon: 'Sparkles', color: '#3b82f6' },
  { id: 'nb-reading', workspaceId: 'ws-personal', name: 'Reading & Literature', icon: 'BookOpen', color: '#10b981' },
  { id: 'nb-projects', workspaceId: 'ws-work', name: 'Projects & Planning', icon: 'Briefcase', color: '#8b5cf6' },
  { id: 'nb-meeting', workspaceId: 'ws-work', name: 'Meeting Notes', icon: 'Users', color: '#f59e0b' }
];

const INITIAL_TAGS: Tag[] = [
  { id: 't-wisdom', name: 'wisdom', color: '#3b82f6' },
  { id: 't-draft', name: 'draft', color: '#f59e0b' },
  { id: 't-archived', name: 'archive', color: '#6b7280' },
  { id: 't-strategy', name: 'strategy', color: '#8b5cf6' }
];

const INITIAL_CARDS: Card[] = [
  {
    id: 'card-welcome',
    notebookId: 'nb-ideas',
    title: 'Welcome to JivanLekh ✨',
    body: '<h1>The Art of Mindful Writing</h1><p><strong>JivanLekh</strong> is crafted for those who value deep focus, calm aesthetics, and fluid block capture.</p><blockquote>"Words carry the soul of thoughts; keep them in a serene sanctum."</blockquote><h2>Features to Explore</h2><ul><li><strong>Zoho Notebook Hierarchy:</strong> Seamlessly organize cards inside notebooks and separate workspaces.</li><li><strong>Notion Slash Commands:</strong> Type <code>/</code> anywhere on an empty line to insert headings, blockquotes, code blocks, or dividers.</li><li><strong>Card Color Badges:</strong> Label your cards with colors in the top bar to spot them quickly in your list.</li><li><strong>Offline-First Storage:</strong> Every stroke is auto-saved locally into your browser.</li></ul><p>Start editing this note, or create a new card using <kbd>Ctrl+N</kbd> or <kbd>Cmd+K</kbd>.</p>',
    tags: ['wisdom', 'draft'],
    colorLabel: 'blue',
    createdAt: Date.now() - 3600000 * 24,
    updatedAt: Date.now() - 3600000 * 2,
    isTrashed: false
  },
  {
    id: 'card-sanskrit',
    notebookId: 'nb-reading',
    title: 'Origins of Jivan and Lekh',
    body: '<h2>Epithets of Living Thought</h2><p>In classical Sanskrit, <em>Jivan</em> (जीवन) signifies life, breath, and vital energy, while <em>Lekh</em> (लेख) signifies the written word, scripture, or thought inscribed.</p><p>Together, <strong>JivanLekh</strong> forms a living journal of thoughts, captured in tranquil typography and uninterrupted flow.</p><pre><code>// The core philosophy\nconst livingNote = {\n  essence: "Calm",\n  clarity: "High",\n  distractions: 0\n};</code></pre>',
    tags: ['wisdom'],
    colorLabel: 'purple',
    createdAt: Date.now() - 3600000 * 48,
    updatedAt: Date.now() - 3600000 * 5,
    isTrashed: false
  },
  {
    id: 'card-roadmap',
    notebookId: 'nb-projects',
    title: 'Q4 Product Architecture',
    body: '<h2>High-Velocity Goals</h2><p>Overview of technical milestones and architectural refinements for the coming quarter.</p><ul><li>Implement zero-latency multi-provider local sync</li><li>Refine typographic hierarchy and micro-interactions</li><li>Preserve local-first encryption guarantees</li></ul><hr><p>Review completed by the core design committee.</p>',
    tags: ['strategy'],
    colorLabel: 'green',
    createdAt: Date.now() - 3600000 * 72,
    updatedAt: Date.now() - 3600000 * 12,
    isTrashed: false
  }
];

export function useJivanLekh() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_workspaces`);
      return saved ? JSON.parse(saved) : INITIAL_WORKSPACES;
    } catch {
      return INITIAL_WORKSPACES;
    }
  });

  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_active_ws`);
      return saved || 'ws-personal';
    } catch {
      return 'ws-personal';
    }
  });

  const [notebooks, setNotebooks] = useState<Notebook[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_notebooks`);
      return saved ? JSON.parse(saved) : INITIAL_NOTEBOOKS;
    } catch {
      return INITIAL_NOTEBOOKS;
    }
  });

  const [activeNotebookId, setActiveNotebookId] = useState<string>('all');

  const [tags, setTags] = useState<Tag[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_tags`);
      return saved ? JSON.parse(saved) : INITIAL_TAGS;
    } catch {
      return INITIAL_TAGS;
    }
  });

  const [cards, setCards] = useState<Card[]>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_cards`);
      return saved ? JSON.parse(saved) : INITIAL_CARDS;
    } catch {
      return INITIAL_CARDS;
    }
  });

  const [activeCardId, setActiveCardId] = useState<string | null>('card-welcome');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [lastTrashedCard, setLastTrashedCard] = useState<Card | null>(null);

  // Persistence effects
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_workspaces`, JSON.stringify(workspaces));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, [workspaces]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_active_ws`, activeWorkspaceId);
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, [activeWorkspaceId]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_notebooks`, JSON.stringify(notebooks));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, [notebooks]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_tags`, JSON.stringify(tags));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, [tags]);

  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_cards`, JSON.stringify(cards));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, [cards]);

  // Toast timer
  const showToast = useCallback((message: string, actionLabel?: string, onAction?: () => void) => {
    const id = Math.random().toString(36).slice(2);
    setToast({ id, message, actionLabel, onAction });
    const timer = setTimeout(() => {
      setToast(current => (current?.id === id ? null : current));
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  // Filter notebooks belonging to current active workspace
  const workspaceNotebooks = useMemo(() => {
    return notebooks.filter(nb => nb.workspaceId === activeWorkspaceId);
  }, [notebooks, activeWorkspaceId]);

  // Filter cards based on view, search, and trash state
  const filteredCards = useMemo(() => {
    let result = cards;

    // View filter
    if (activeNotebookId === 'trash') {
      result = result.filter(c => c.isTrashed);
    } else {
      result = result.filter(c => !c.isTrashed);

      if (activeNotebookId === 'all') {
        // All cards in current workspace
        const wsNbIds = new Set(workspaceNotebooks.map(nb => nb.id));
        result = result.filter(c => wsNbIds.has(c.notebookId));
      } else if (activeNotebookId.startsWith('tag:')) {
        const tagName = activeNotebookId.slice(4);
        result = result.filter(c => c.tags.includes(tagName));
      } else {
        result = result.filter(c => c.notebookId === activeNotebookId);
      }
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(c =>
        c.title.toLowerCase().includes(q) ||
        c.body.toLowerCase().includes(q) ||
        c.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    // Sort by updatedAt descending
    return [...result].sort((a, b) => b.updatedAt - a.updatedAt);
  }, [cards, activeNotebookId, workspaceNotebooks, searchQuery]);

  const activeCard = useMemo(() => {
    return cards.find(c => c.id === activeCardId) || null;
  }, [cards, activeCardId]);

  // Actions
  const createCard = useCallback((targetNotebookId?: string) => {
    let nbId = targetNotebookId;
    if (!nbId || nbId === 'all' || nbId === 'trash' || nbId.startsWith('tag:' ) || nbId === 'pinned') {
      if (workspaceNotebooks.length > 0) {
        nbId = workspaceNotebooks[0].id;
      } else {
        const defaultNbId = `nb-${Math.random().toString(36).slice(2, 9)}`;
        const defaultNb: Notebook = {
          id: defaultNbId,
          workspaceId: activeWorkspaceId,
          name: 'Notes',
          icon: 'BookOpen',
          color: '#3b82f6'
        };
        setNotebooks(prev => [...prev, defaultNb]);
        nbId = defaultNbId;
      }
    }

    const newCard: Card = {
      id: `card-${Math.random().toString(36).slice(2, 10)}`,
      notebookId: nbId,
      title: '',
      body: '<p><br></p>',
      tags: [],
      colorLabel: null,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isTrashed: false
    };

    setCards(prev => [newCard, ...prev]);
    setActiveCardId(newCard.id);
    showToast('New card created');
    return newCard.id;
  }, [workspaceNotebooks, activeWorkspaceId, showToast]);

  const updateCard = useCallback((id: string, updates: Partial<Card>) => {
    setCards(prev =>
      prev.map(c => {
        if (c.id === id) {
          return {
            ...c,
            ...updates,
            updatedAt: Date.now()
          };
        }
        return c;
      })
    );
  }, []);

  const trashCard = useCallback((id: string) => {
    const target = cards.find(c => c.id === id);
    if (!target) return;

    setLastTrashedCard(target);
    setCards(prev => prev.map(c => (c.id === id ? { ...c, isTrashed: true, updatedAt: Date.now() } : c)));

    // Switch active card if deleted was active
    if (activeCardId === id) {
      const remaining = filteredCards.filter(c => c.id !== id);
      setActiveCardId(remaining[0]?.id || null);
    }

    showToast('Moved card to Trash', 'Undo', () => {
      setCards(prev => prev.map(c => (c.id === id ? { ...c, isTrashed: false, updatedAt: Date.now() } : c)));
      setActiveCardId(id);
      showToast('Card restored');
    });
  }, [cards, activeCardId, filteredCards, showToast]);

  const restoreCard = useCallback((id: string) => {
    setCards(prev => prev.map(c => (c.id === id ? { ...c, isTrashed: false, updatedAt: Date.now() } : c)));
    setActiveCardId(id);
    showToast('Card restored');
  }, [showToast]);

  const permanentlyDeleteCard = useCallback((id: string) => {
    setCards(prev => prev.filter(c => c.id !== id));
    if (activeCardId === id) {
      const remaining = filteredCards.filter(c => c.id !== id);
      setActiveCardId(remaining[0]?.id || null);
    }
    showToast('Card permanently deleted');
  }, [activeCardId, filteredCards, showToast]);

  const emptyTrash = useCallback(() => {
    setCards(prev => prev.filter(c => !c.isTrashed));
    showToast('Trash emptied');
  }, [showToast]);

  const createNotebook = useCallback((name: string, color?: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const newNb: Notebook = {
      id: `nb-${Math.random().toString(36).slice(2, 9)}`,
      workspaceId: activeWorkspaceId,
      name: trimmed,
      icon: 'BookOpen',
      color: color || '#3b82f6'
    };
    setNotebooks(prev => [...prev, newNb]);
    setActiveNotebookId(newNb.id);
    showToast(`Notebook "${trimmed}" created`);
  }, [activeWorkspaceId, showToast]);

  const renameNotebook = useCallback((id: string, newName: string) => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    setNotebooks(prev => prev.map(nb => (nb.id === id ? { ...nb, name: trimmed } : nb)));
    showToast('Notebook renamed');
  }, [showToast]);

  const deleteNotebook = useCallback((id: string) => {
    setNotebooks(prev => prev.filter(nb => nb.id !== id));
    // Move notes inside to another notebook or trash
    setCards(prev => prev.map(c => (c.notebookId === id ? { ...c, isTrashed: true } : c)));
    if (activeNotebookId === id) {
      setActiveNotebookId('all');
    }
    showToast('Notebook deleted; its notes moved to Trash');
  }, [activeNotebookId, showToast]);

  const createWorkspace = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const wsId = `ws-${Math.random().toString(36).slice(2, 9)}`;
    const newWs: Workspace = {
      id: wsId,
      name: trimmed
    };
    const defaultNb: Notebook = {
      id: `nb-${Math.random().toString(36).slice(2, 9)}`,
      workspaceId: wsId,
      name: 'Notes',
      icon: 'BookOpen',
      color: '#3b82f6'
    };
    setWorkspaces(prev => [...prev, newWs]);
    setNotebooks(prev => [...prev, defaultNb]);
    setActiveWorkspaceId(wsId);
    setActiveNotebookId('all');
    showToast(`Workspace "${trimmed}" created`);
  }, [showToast]);

  const addTag = useCallback((tagName: string) => {
    const clean = tagName.replace(/^#/, '').trim().toLowerCase();
    if (!clean) return;
    if (!tags.some(t => t.name.toLowerCase() === clean)) {
      const newTag: Tag = {
        id: `t-${Math.random().toString(36).slice(2, 8)}`,
        name: clean
      };
      setTags(prev => [...prev, newTag]);
    }
  }, [tags]);

  const addTagToCard = useCallback((cardId: string, tagName: string) => {
    const clean = tagName.replace(/^#/, '').trim().toLowerCase();
    if (!clean) return;
    addTag(clean);
    setCards(prev =>
      prev.map(c => {
        if (c.id === cardId && !c.tags.includes(clean)) {
          return { ...c, tags: [...c.tags, clean], updatedAt: Date.now() };
        }
        return c;
      })
    );
  }, [addTag]);

  const removeTagFromCard = useCallback((cardId: string, tagName: string) => {
    setCards(prev =>
      prev.map(c => {
        if (c.id === cardId) {
          return { ...c, tags: c.tags.filter(t => t !== tagName), updatedAt: Date.now() };
        }
        return c;
      })
    );
  }, []);

  return {
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
    addTag,
    addTagToCard,
    removeTagFromCard,
    showToast
  };
}
