import { useState, useEffect, useMemo, useCallback } from 'react';
import { Workspace, Notebook, Card, Tag, ToastMessage } from '../types';
import {
  auth,
  db,
  googleProvider,
  handleFirestoreError,
  OperationType
} from '../services/firebase';
import {
  signInAnonymously,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import {
  collection,
  query,
  where,
  onSnapshot,
  setDoc,
  deleteDoc,
  doc
} from 'firebase/firestore';

const STORAGE_KEY = 'jivanlekh_data_v2';

const INITIAL_WORKSPACES: Workspace[] = [
  { id: 'ws-personal', name: 'Personal' },
  { id: 'ws-study', name: 'Study' },
  { id: 'ws-office', name: 'Office' }
];

const INITIAL_NOTEBOOKS: Notebook[] = [
  { id: 'nb-ideas', workspaceId: 'ws-personal', name: 'Ideas & Reflections', icon: 'Sparkles', color: '#3b82f6' },
  { id: 'nb-reading', workspaceId: 'ws-personal', name: 'Reading & Literature', icon: 'BookOpen', color: '#10b981' },
  { id: 'nb-projects', workspaceId: 'ws-study', name: 'Projects & Planning', icon: 'Briefcase', color: '#8b5cf6' },
  { id: 'nb-meeting', workspaceId: 'ws-office', name: 'Meeting Notes', icon: 'Users', color: '#f59e0b' }
];

const INITIAL_TAGS: Tag[] = [
  { id: 't-wisdom', name: 'wisdom', color: '#3b82f6' },
  { id: 't-draft', name: 'draft', color: '#f59e0b' },
  { id: 't-archived', name: 'archive', color: '#6b7280' },
  { id: 't-strategy', name: 'strategy', color: '#8b5cf6' }
];

const INITIAL_CARDS: Card[] = [
  {
    id: 'card-guide',
    notebookId: 'nb-ideas',
    title: '📍 How to Log Site Visit Expenses (Guide)',
    body: '<h1>📍 How to Log Site Visit Expenses in JivanLekh</h1><div class="callout-block"><span style="font-size:18px;">💡</span><div><strong>Two Easy Ways to Log Expenses with Automatic Sum Calculations:</strong></div></div><h2>Method 1: Quick Checklist Logging (Automatic Sum Banner)</h2><p>Simply write your expenses as checklist lines with amounts like <code>20₹ - Local up</code> or <code>₹50 - Tea</code>. JivanLekh automatically detects the amounts and shows a live <strong>Total Expense Banner</strong> at the top with a 1-click <strong>Convert to Expense Table</strong> button!</p><h3>Example Checklist:</h3><ul class="todo-list" style="list-style:none;padding-left:0;"><li style="display:flex;align-items:flex-start;gap:8px;list-style:none;"><input type="checkbox" checked /> <span>20₹ - Local up</span></li><li style="display:flex;align-items:flex-start;gap:8px;list-style:none;"><input type="checkbox" checked /> <span>20₹ - Local Down</span></li><li style="display:flex;align-items:flex-start;gap:8px;list-style:none;"><input type="checkbox" checked /> <span>30₹ - Metro down</span></li><li style="display:flex;align-items:flex-start;gap:8px;list-style:none;"><input type="checkbox" checked /> <span>15₹ - Auto up</span></li><li style="display:flex;align-items:flex-start;gap:8px;list-style:none;"><input type="checkbox" checked /> <span>15₹ - Auto down</span></li><li style="display:flex;align-items:flex-start;gap:8px;list-style:none;"><input type="checkbox" checked /> <span>20₹ - Coffee</span></li></ul><hr><h2>Method 2: Notion Expense Database Table</h2><p>Type <code>/table</code> or click the <strong>📊 Table</strong> button on the editor toolbar to insert an interactive Notion Expense Table with editable columns (Name, Amount, Category, Person, Status) and an automatic <strong>SUM ₹</strong> & <strong>COUNT</strong> footer row that recalculates in real time!</p><div class="notion-db-block my-4" style="border:1px solid #E5E7EB;border-radius:10px;overflow:hidden;background:#ffffff;"><div style="padding:8px 12px;background:#F8F9FA;border-bottom:1px solid #E5E7EB;font-weight:600;font-size:12px;color:#374151;">📊 Notion Expense Database Table</div><table class="notion-db-table" style="width:100%;border-collapse:collapse;font-size:12px;text-align:left;"><thead><tr style="background:#F3F4F6;border-bottom:1px solid #E5E7EB;color:#6B7280;font-size:11px;"><th style="padding:8px 10px;border-right:1px solid #E5E7EB;">Aa Name</th><th style="padding:8px 10px;border-right:1px solid #E5E7EB;">₹ Amount</th><th style="padding:8px 10px;border-right:1px solid #E5E7EB;">🏷️ Category</th><th style="padding:8px 10px;border-right:1px solid #E5E7EB;">👤 Person</th><th style="padding:8px 10px;">Status</th></tr></thead><tbody><tr style="border-bottom:1px solid #E5E7EB;"><td style="padding:6px 10px;border-right:1px solid #E5E7EB;" contenteditable="true">Local train up</td><td style="padding:6px 10px;border-right:1px solid #E5E7EB;font-family:monospace;color:#047857;font-weight:600;" contenteditable="true">20.00</td><td style="padding:6px 10px;border-right:1px solid #E5E7EB;" contenteditable="true">Transportation</td><td style="padding:6px 10px;border-right:1px solid #E5E7EB;" contenteditable="true">Jaiprakash</td><td style="padding:6px 10px;" contenteditable="true">Settled</td></tr><tr style="border-bottom:1px solid #E5E7EB;"><td style="padding:6px 10px;border-right:1px solid #E5E7EB;" contenteditable="true">Local train down</td><td style="padding:6px 10px;border-right:1px solid #E5E7EB;font-family:monospace;color:#047857;font-weight:600;" contenteditable="true">20.00</td><td style="padding:6px 10px;border-right:1px solid #E5E7EB;" contenteditable="true">Transportation</td><td style="padding:6px 10px;border-right:1px solid #E5E7EB;" contenteditable="true">Jaiprakash</td><td style="padding:6px 10px;" contenteditable="true">Settled</td></tr><tr style="border-bottom:1px solid #E5E7EB;"><td style="padding:6px 10px;border-right:1px solid #E5E7EB;" contenteditable="true">Metro fare</td><td style="padding:6px 10px;border-right:1px solid #E5E7EB;font-family:monospace;color:#047857;font-weight:600;" contenteditable="true">30.00</td><td style="padding:6px 10px;border-right:1px solid #E5E7EB;" contenteditable="true">Transportation</td><td style="padding:6px 10px;border-right:1px solid #E5E7EB;" contenteditable="true">Jaiprakash</td><td style="padding:6px 10px;" contenteditable="true">Settled</td></tr><tr style="border-bottom:1px solid #E5E7EB;"><td style="padding:6px 10px;border-right:1px solid #E5E7EB;" contenteditable="true">Auto fare up</td><td style="padding:6px 10px;border-right:1px solid #E5E7EB;font-family:monospace;color:#047857;font-weight:600;" contenteditable="true">15.00</td><td style="padding:6px 10px;border-right:1px solid #E5E7EB;" contenteditable="true">Transportation</td><td style="padding:6px 10px;border-right:1px solid #E5E7EB;" contenteditable="true">Jaiprakash</td><td style="padding:6px 10px;" contenteditable="true">Settled</td></tr><tr style="border-bottom:1px solid #E5E7EB;"><td style="padding:6px 10px;border-right:1px solid #E5E7EB;" contenteditable="true">Auto fare down</td><td style="padding:6px 10px;border-right:1px solid #E5E7EB;font-family:monospace;color:#047857;font-weight:600;" contenteditable="true">15.00</td><td style="padding:6px 10px;border-right:1px solid #E5E7EB;" contenteditable="true">Transportation</td><td style="padding:6px 10px;border-right:1px solid #E5E7EB;" contenteditable="true">Jaiprakash</td><td style="padding:6px 10px;" contenteditable="true">Settled</td></tr><tr style="border-bottom:1px solid #E5E7EB;"><td style="padding:6px 10px;border-right:1px solid #E5E7EB;" contenteditable="true">Coffee</td><td style="padding:6px 10px;border-right:1px solid #E5E7EB;font-family:monospace;color:#047857;font-weight:600;" contenteditable="true">20.00</td><td style="padding:6px 10px;border-right:1px solid #E5E7EB;" contenteditable="true">Food & Grocery</td><td style="padding:6px 10px;border-right:1px solid #E5E7EB;" contenteditable="true">Jaiprakash</td><td style="padding:6px 10px;" contenteditable="true">Settled</td></tr></tbody><tfoot><tr style="background:#F8F9FA;border-top:2px solid #D1D5DB;font-weight:700;color:#1F2937;"><td style="padding:8px 10px;border-right:1px solid #E5E7EB;font-family:monospace;color:#6B7280;">COUNT 6</td><td style="padding:8px 10px;border-right:1px solid #E5E7EB;font-family:monospace;color:#047857;font-size:13px;">SUM ₹120.00</td><td style="padding:8px 10px;border-right:1px solid #E5E7EB;"></td><td style="padding:8px 10px;border-right:1px solid #E5E7EB;"></td><td style="padding:8px 10px;"></td></tr></tfoot></table></div>',
    tags: ['guide', 'expense'],
    colorLabel: 'blue',
    createdAt: Date.now() - 3600000 * 10,
    updatedAt: Date.now() - 3600000 * 1,
    isTrashed: false,
    pinned: true
  },
  {
    id: 'card-credgenics',
    notebookId: 'nb-ideas',
    title: 'Credgenics (EFC) - Airavali 14 Oct 2026 - settled all',
    body: '<ul class="todo-list" style="list-style:none;padding-left:0;"><li style="display:flex;align-items:flex-start;gap:8px;list-style:none;"><input type="checkbox" checked /> <span>20₹ - Local up</span></li><li style="display:flex;align-items:flex-start;gap:8px;list-style:none;"><input type="checkbox" checked /> <span>20₹ - Local Down</span></li><li style="display:flex;align-items:flex-start;gap:8px;list-style:none;"><input type="checkbox" checked /> <span>30₹ - Metro down</span></li><li style="display:flex;align-items:flex-start;gap:8px;list-style:none;"><input type="checkbox" checked /> <span>15₹ - Auto up</span></li><li style="display:flex;align-items:flex-start;gap:8px;list-style:none;"><input type="checkbox" checked /> <span>15₹ - Auto down</span></li><li style="display:flex;align-items:flex-start;gap:8px;list-style:none;"><input type="checkbox" checked /> <span>20₹ - Coffee</span></li></ul>',
    tags: ['site-visit', 'settled'],
    colorLabel: 'green',
    createdAt: Date.now() - 3600000 * 24,
    updatedAt: Date.now() - 3600000 * 2,
    isTrashed: false
  },
  {
    id: 'card-columbia',
    notebookId: 'nb-ideas',
    title: 'Columbia Petro - Khar Road 12 Oct 2026 - settled all',
    body: '<ul class="todo-list" style="list-style:none;padding-left:0;"><li style="display:flex;align-items:flex-start;gap:8px;list-style:none;"><input type="checkbox" checked /> <span>150₹ - Cab to Khar Road</span></li><li style="display:flex;align-items:flex-start;gap:8px;list-style:none;"><input type="checkbox" checked /> <span>80₹ - Lunch & Refreshment</span></li><li style="display:flex;align-items:flex-start;gap:8px;list-style:none;"><input type="checkbox" checked /> <span>120₹ - Return Auto</span></li></ul>',
    tags: ['site-visit', 'settled'],
    colorLabel: 'green',
    createdAt: Date.now() - 3600000 * 48,
    updatedAt: Date.now() - 3600000 * 5,
    isTrashed: false
  }
];

export function useJivanLekh() {
  const [user, setUser] = useState<User | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(true);

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

  const [activeCardId, setActiveCardId] = useState<string | null>('card-guide');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Auto sign-in / Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async currentUser => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        try {
          const anon = await signInAnonymously(auth);
          setUser(anon.user);
        } catch (e) {
          console.error('Anonymous auth failed', e);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Firebase Real-time Synchronization
  useEffect(() => {
    if (!user) return;
    const uid = user.uid;
    setIsSyncing(true);

    // 1. Workspaces Listener
    const wsQuery = query(collection(db, 'workspaces'), where('ownerId', '==', uid));
    const unsubWs = onSnapshot(
      wsQuery,
      snapshot => {
        if (snapshot.empty && workspaces.length > 0) {
          // Seed local workspaces to Firestore
          workspaces.forEach(ws => {
            setDoc(doc(db, 'workspaces', ws.id), { ...ws, ownerId: uid }).catch(err =>
              handleFirestoreError(err, OperationType.WRITE, `workspaces/${ws.id}`)
            );
          });
        } else {
          const items: Workspace[] = snapshot.docs.map(doc => {
            const data = doc.data();
            return { id: doc.id, name: data.name };
          });
          if (items.length > 0) setWorkspaces(items);
        }
      },
      err => handleFirestoreError(err, OperationType.GET, 'workspaces')
    );

    // 2. Notebooks Listener
    const nbQuery = query(collection(db, 'notebooks'), where('ownerId', '==', uid));
    const unsubNb = onSnapshot(
      nbQuery,
      snapshot => {
        if (snapshot.empty && notebooks.length > 0) {
          notebooks.forEach(nb => {
            setDoc(doc(db, 'notebooks', nb.id), { ...nb, ownerId: uid }).catch(err =>
              handleFirestoreError(err, OperationType.WRITE, `notebooks/${nb.id}`)
            );
          });
        } else {
          const items: Notebook[] = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
              id: doc.id,
              workspaceId: data.workspaceId,
              name: data.name,
              icon: data.icon,
              color: data.color
            };
          });
          if (items.length > 0) setNotebooks(items);
        }
      },
      err => handleFirestoreError(err, OperationType.GET, 'notebooks')
    );

    // 3. Cards Listener
    const cardQuery = query(collection(db, 'cards'), where('ownerId', '==', uid));
    const unsubCards = onSnapshot(
      cardQuery,
      snapshot => {
        if (snapshot.empty && cards.length > 0) {
          cards.forEach(c => {
            setDoc(doc(db, 'cards', c.id), { ...c, ownerId: uid }).catch(err =>
              handleFirestoreError(err, OperationType.WRITE, `cards/${c.id}`)
            );
          });
        } else {
          const items: Card[] = snapshot.docs.map(d => {
            const data = d.data();
            return {
              id: d.id,
              notebookId: data.notebookId || 'nb-ideas',
              title: data.title || '',
              body: data.body || '',
              tags: data.tags || [],
              colorLabel: data.colorLabel || null,
              createdAt: data.createdAt || Date.now(),
              updatedAt: data.updatedAt || Date.now(),
              isTrashed: Boolean(data.isTrashed),
              pinned: Boolean(data.pinned)
            };
          });
          if (items.length > 0) {
            setCards(items);
            if (!items.some(i => i.id === activeCardId)) {
              setActiveCardId(items[0]?.id || null);
            }
          }
        }
        setIsSyncing(false);
      },
      err => handleFirestoreError(err, OperationType.GET, 'cards')
    );

    // 4. Tags Listener
    const tagQuery = query(collection(db, 'tags'), where('ownerId', '==', uid));
    const unsubTags = onSnapshot(
      tagQuery,
      snapshot => {
        if (snapshot.empty && tags.length > 0) {
          tags.forEach(t => {
            setDoc(doc(db, 'tags', t.id), { ...t, ownerId: uid }).catch(err =>
              handleFirestoreError(err, OperationType.WRITE, `tags/${t.id}`)
            );
          });
        } else {
          const items: Tag[] = snapshot.docs.map(d => ({
            id: d.id,
            name: d.data().name,
            color: d.data().color
          }));
          if (items.length > 0) setTags(items);
        }
      },
      err => handleFirestoreError(err, OperationType.GET, 'tags')
    );

    return () => {
      unsubWs();
      unsubNb();
      unsubCards();
      unsubTags();
    };
  }, [user]);

  // LocalStorage backups
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_workspaces`, JSON.stringify(workspaces));
      localStorage.setItem(`${STORAGE_KEY}_active_ws`, activeWorkspaceId);
      localStorage.setItem(`${STORAGE_KEY}_notebooks`, JSON.stringify(notebooks));
      localStorage.setItem(`${STORAGE_KEY}_tags`, JSON.stringify(tags));
      localStorage.setItem(`${STORAGE_KEY}_cards`, JSON.stringify(cards));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, [workspaces, activeWorkspaceId, notebooks, tags, cards]);

  const showToast = useCallback((message: string, actionLabel?: string, onAction?: () => void) => {
    const id = Math.random().toString(36).slice(2);
    setToast({ id, message, actionLabel, onAction });
    const timer = setTimeout(() => {
      setToast(current => (current?.id === id ? null : current));
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      showToast('Signed in with Google! Notes syncing live across devices.');
    } catch (e: any) {
      console.error('Google Auth error:', e);
      showToast('Sign in failed: ' + (e.message || 'Unknown error'));
    }
  };

  const logoutUser = async () => {
    try {
      await signOut(auth);
      await signInAnonymously(auth);
      showToast('Signed out of cloud account');
    } catch (e: any) {
      console.error('Signout error:', e);
    }
  };

  const workspaceNotebooks = useMemo(() => {
    return notebooks.filter(nb => nb.workspaceId === activeWorkspaceId);
  }, [notebooks, activeWorkspaceId]);

  const filteredCards = useMemo(() => {
    let result = cards;

    if (activeNotebookId === 'trash') {
      result = result.filter(c => c.isTrashed);
    } else {
      result = result.filter(c => !c.isTrashed);

      if (activeNotebookId === 'all') {
        const wsNbIds = new Set(workspaceNotebooks.map(nb => nb.id));
        result = result.filter(c => wsNbIds.has(c.notebookId));
      } else if (activeNotebookId.startsWith('tag:')) {
        const tagName = activeNotebookId.slice(4);
        result = result.filter(c => c.tags && c.tags.includes(tagName));
      } else {
        result = result.filter(c => c.notebookId === activeNotebookId);
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        c =>
          c.title.toLowerCase().includes(q) ||
          c.body.toLowerCase().includes(q) ||
          (c.tags && c.tags.some(t => t.toLowerCase().includes(q)))
      );
    }

    return [...result].sort((a, b) => b.updatedAt - a.updatedAt);
  }, [cards, activeNotebookId, workspaceNotebooks, searchQuery]);

  const activeCard = useMemo(() => {
    return cards.find(c => c.id === activeCardId) || null;
  }, [cards, activeCardId]);

  const createCard = useCallback(
    (targetNotebookId?: string) => {
      let nbId = targetNotebookId;
      if (!nbId || nbId === 'all' || nbId === 'trash' || nbId.startsWith('tag:') || nbId === 'pinned') {
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
          if (user) {
            setDoc(doc(db, 'notebooks', defaultNbId), { ...defaultNb, ownerId: user.uid }).catch(err =>
              handleFirestoreError(err, OperationType.WRITE, `notebooks/${defaultNbId}`)
            );
          }
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

      if (user) {
        setDoc(doc(db, 'cards', newCard.id), { ...newCard, ownerId: user.uid }).catch(err =>
          handleFirestoreError(err, OperationType.WRITE, `cards/${newCard.id}`)
        );
      }

      showToast('New card created');
      return newCard.id;
    },
    [workspaceNotebooks, activeWorkspaceId, user, showToast]
  );

  const updateCard = useCallback(
    (id: string, updates: Partial<Card>) => {
      setCards(prev =>
        prev.map(c => {
          if (c.id === id) {
            const updated = {
              ...c,
              ...updates,
              updatedAt: Date.now()
            };
            if (user) {
              setDoc(doc(db, 'cards', id), { ...updated, ownerId: user.uid }, { merge: true }).catch(err =>
                handleFirestoreError(err, OperationType.UPDATE, `cards/${id}`)
              );
            }
            return updated;
          }
          return c;
        })
      );
    },
    [user]
  );

  const trashCard = useCallback(
    (id: string) => {
      setCards(prev =>
        prev.map(c => {
          if (c.id === id) {
            const updated = { ...c, isTrashed: true, updatedAt: Date.now() };
            if (user) {
              setDoc(doc(db, 'cards', id), { isTrashed: true, updatedAt: Date.now(), ownerId: user.uid }, { merge: true }).catch(err =>
                handleFirestoreError(err, OperationType.UPDATE, `cards/${id}`)
              );
            }
            return updated;
          }
          return c;
        })
      );

      if (activeCardId === id) {
        const remaining = filteredCards.filter(c => c.id !== id);
        setActiveCardId(remaining[0]?.id || null);
      }

      showToast('Moved card to Trash', 'Undo', () => {
        restoreCard(id);
      });
    },
    [cards, activeCardId, filteredCards, user, showToast]
  );

  const restoreCard = useCallback(
    (id: string) => {
      setCards(prev =>
        prev.map(c => {
          if (c.id === id) {
            const updated = { ...c, isTrashed: false, updatedAt: Date.now() };
            if (user) {
              setDoc(doc(db, 'cards', id), { isTrashed: false, updatedAt: Date.now(), ownerId: user.uid }, { merge: true }).catch(err =>
                handleFirestoreError(err, OperationType.UPDATE, `cards/${id}`)
              );
            }
            return updated;
          }
          return c;
        })
      );
      setActiveCardId(id);
      showToast('Card restored');
    },
    [user, showToast]
  );

  const permanentlyDeleteCard = useCallback(
    (id: string) => {
      setCards(prev => prev.filter(c => c.id !== id));
      if (user) {
        deleteDoc(doc(db, 'cards', id)).catch(err =>
          handleFirestoreError(err, OperationType.DELETE, `cards/${id}`)
        );
      }
      if (activeCardId === id) {
        const remaining = filteredCards.filter(c => c.id !== id);
        setActiveCardId(remaining[0]?.id || null);
      }
      showToast('Card permanently deleted');
    },
    [activeCardId, filteredCards, user, showToast]
  );

  const emptyTrash = useCallback(() => {
    const trashed = cards.filter(c => c.isTrashed);
    setCards(prev => prev.filter(c => !c.isTrashed));
    if (user) {
      trashed.forEach(c => {
        deleteDoc(doc(db, 'cards', c.id)).catch(err =>
          handleFirestoreError(err, OperationType.DELETE, `cards/${c.id}`)
        );
      });
    }
    showToast('Trash emptied');
  }, [cards, user, showToast]);

  const createNotebook = useCallback(
    (name: string, color?: string) => {
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
      if (user) {
        setDoc(doc(db, 'notebooks', newNb.id), { ...newNb, ownerId: user.uid }).catch(err =>
          handleFirestoreError(err, OperationType.WRITE, `notebooks/${newNb.id}`)
        );
      }
      showToast(`Notebook "${trimmed}" created`);
    },
    [activeWorkspaceId, user, showToast]
  );

  const renameNotebook = useCallback(
    (id: string, newName: string) => {
      const trimmed = newName.trim();
      if (!trimmed) return;
      setNotebooks(prev =>
        prev.map(nb => {
          if (nb.id === id) {
            const updated = { ...nb, name: trimmed };
            if (user) {
              setDoc(doc(db, 'notebooks', id), { name: trimmed, ownerId: user.uid }, { merge: true }).catch(err =>
                handleFirestoreError(err, OperationType.UPDATE, `notebooks/${id}`)
              );
            }
            return updated;
          }
          return nb;
        })
      );
      showToast('Notebook renamed');
    },
    [user, showToast]
  );

  const deleteNotebook = useCallback(
    (id: string) => {
      setNotebooks(prev => prev.filter(nb => nb.id !== id));
      if (user) {
        deleteDoc(doc(db, 'notebooks', id)).catch(err =>
          handleFirestoreError(err, OperationType.DELETE, `notebooks/${id}`)
        );
      }
      setCards(prev =>
        prev.map(c => {
          if (c.notebookId === id) {
            const updated = { ...c, isTrashed: true };
            if (user) {
              setDoc(doc(db, 'cards', c.id), { isTrashed: true, ownerId: user.uid }, { merge: true }).catch(err =>
                handleFirestoreError(err, OperationType.UPDATE, `cards/${c.id}`)
              );
            }
            return updated;
          }
          return c;
        })
      );
      if (activeNotebookId === id) {
        setActiveNotebookId('all');
      }
      showToast('Notebook deleted; notes moved to Trash');
    },
    [activeNotebookId, user, showToast]
  );

  const createWorkspace = useCallback(
    (name: string) => {
      const trimmed = name.trim();
      if (!trimmed) return;
      const wsId = `ws-${Math.random().toString(36).slice(2, 9)}`;
      const newWs: Workspace = { id: wsId, name: trimmed };
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

      if (user) {
        setDoc(doc(db, 'workspaces', wsId), { ...newWs, ownerId: user.uid }).catch(err =>
          handleFirestoreError(err, OperationType.WRITE, `workspaces/${wsId}`)
        );
        setDoc(doc(db, 'notebooks', defaultNb.id), { ...defaultNb, ownerId: user.uid }).catch(err =>
          handleFirestoreError(err, OperationType.WRITE, `notebooks/${defaultNb.id}`)
        );
      }
      showToast(`Workspace "${trimmed}" created`);
    },
    [user, showToast]
  );

  const addTag = useCallback(
    (tagName: string) => {
      const clean = tagName.replace(/^#/, '').trim().toLowerCase();
      if (!clean) return;
      if (!tags.some(t => t.name.toLowerCase() === clean)) {
        const tagId = `t-${Math.random().toString(36).slice(2, 8)}`;
        const newTag: Tag = { id: tagId, name: clean };
        setTags(prev => [...prev, newTag]);
        if (user) {
          setDoc(doc(db, 'tags', tagId), { ...newTag, ownerId: user.uid }).catch(err =>
            handleFirestoreError(err, OperationType.WRITE, `tags/${tagId}`)
          );
        }
      }
    },
    [tags, user]
  );

  const addTagToCard = useCallback(
    (cardId: string, tagName: string) => {
      const clean = tagName.replace(/^#/, '').trim().toLowerCase();
      if (!clean) return;
      addTag(clean);
      setCards(prev =>
        prev.map(c => {
          if (c.id === cardId && !c.tags.includes(clean)) {
            const updated = { ...c, tags: [...c.tags, clean], updatedAt: Date.now() };
            if (user) {
              setDoc(doc(db, 'cards', cardId), { tags: updated.tags, updatedAt: updated.updatedAt, ownerId: user.uid }, { merge: true }).catch(err =>
                handleFirestoreError(err, OperationType.UPDATE, `cards/${cardId}`)
              );
            }
            return updated;
          }
          return c;
        })
      );
    },
    [addTag, user]
  );

  const removeTagFromCard = useCallback(
    (cardId: string, tagName: string) => {
      setCards(prev =>
        prev.map(c => {
          if (c.id === cardId) {
            const updated = { ...c, tags: c.tags.filter(t => t !== tagName), updatedAt: Date.now() };
            if (user) {
              setDoc(doc(db, 'cards', cardId), { tags: updated.tags, updatedAt: updated.updatedAt, ownerId: user.uid }, { merge: true }).catch(err =>
                handleFirestoreError(err, OperationType.UPDATE, `cards/${cardId}`)
              );
            }
            return updated;
          }
          return c;
        })
      );
    },
    [user]
  );

  return {
    user,
    isSyncing,
    loginWithGoogle,
    logoutUser,
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
