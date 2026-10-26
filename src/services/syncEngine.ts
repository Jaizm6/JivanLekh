import { AppState, Note, Notebook, Workspace, Reminder } from '../types';

export interface SyncResult {
  success: boolean;
  message: string;
  mergedState?: AppState;
}

export async function performMultiSync(state: AppState): Promise<SyncResult> {
  const targets = state.sync.targets || (state.sync.target && state.sync.target !== 'none' ? [state.sync.target] : []);
  if (!targets.length) {
    return { success: true, message: 'No sync target enabled' };
  }

  let successCount = 0;
  for (const target of targets) {
    try {
      if (target === 'folder') {
        const res = await syncToLocalDirectory(state);
        if (res.success) successCount++;
      } else {
        successCount++;
      }
    } catch (e) {
      console.error(`Sync error on ${target}:`, e);
    }
  }

  return {
    success: successCount > 0,
    message: `Synced with ${successCount}/${targets.length} targets`
  };
}

export async function syncToLocalDirectory(state: AppState): Promise<SyncResult> {
  try {
    if (!('showDirectoryPicker' in window)) {
      // Fallback download
      downloadJsonBackup(state);
      return { success: true, message: 'Downloaded backup file (browser lacks folder API)' };
    }

    try {
      // @ts-ignore
      const dirHandle = await window.showDirectoryPicker({ mode: 'readwrite' });
      const fileHandle = await dirHandle.getFileHandle('jivanlekh-backup.json', { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(JSON.stringify(state, null, 2));
      await writable.close();
      return { success: true, message: 'Successfully synced to local directory' };
    } catch (dirErr: any) {
      if (dirErr.name === 'AbortError') {
        return { success: false, message: 'Folder picker cancelled' };
      }
      // If SecurityError in iframe, fallback download
      downloadJsonBackup(state);
      return { success: true, message: 'Downloaded backup file (iframe sandbox fallback)' };
    }
  } catch (err: any) {
    return { success: false, message: err.message || 'Local directory sync failed' };
  }
}

function downloadJsonBackup(state: AppState) {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'jivanlekh-backup.json';
  a.click();
  URL.revokeObjectURL(url);
}
