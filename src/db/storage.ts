import { AppState, Note, Reminder, Workspace, Notebook } from '../types';

const STORAGE_KEY = 'jivanlekh_v2_data';

export function getInitialState(): AppState {
  return {
    nbs: [
      { id: 'nb-personal', workspaceId: 'w1', ws: 'w1', name: 'Personal Life', color: '#3b82f6', cover: 0 },
      { id: 'nb-work', workspaceId: 'w1', ws: 'w1', name: 'Work & Projects', color: '#8b5cf6', cover: 1 }
    ],
    notes: [
      {
        id: 'n-welcome',
        title: 'Welcome to JivanLekh',
        notebookId: 'nb-personal',
        nb: 'nb-personal',
        tags: ['wisdom', 'intro'],
        pin: 1,
        upd: Date.now(),
        cre: Date.now(),
        createdAt: Date.now(),
        updatedAt: Date.now(),
        isTrashed: false,
        body: '<h1>Welcome to JivanLekh</h1><p>A tranquil home for your ideas and thoughts.</p>'
      }
    ],
    rem: [],
    wss: [{ id: 'w1', name: 'Personal' }],
    cw: 'w1',
    sync: {
      target: 'folder',
      targets: ['folder'],
      cfg: {},
      e2ee: 0
    },
    theme: 'auto',
    palette: 'amber',
    customTags: ['wisdom', 'intro'],
    tagColors: {},
    pref: {
      accent: '#3b82f6',
      font: 'serif',
      size: 17,
      width: 'full',
      lh: 1.6
    },
    ui: {
      nb: 1,
      tg: 1,
      open: {},
      sort: 'upd',
      dense: 0,
      sc: 0,
      lc: 0,
      src: 0
    }
  };
}

export function loadAppState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getInitialState();
    return { ...getInitialState(), ...JSON.parse(raw) };
  } catch {
    return getInitialState();
  }
}

export function saveAppState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.warn('Storage save failed:', err);
  }
}
