import React from 'react';
import { AppState, SyncTarget } from '../types';
import { X, Cloud, Folder, HardDrive } from 'lucide-react';

export interface SyncModalProps {
  state?: AppState;
  isOpen: boolean;
  onClose: () => void;
  onSyncNow?: () => void;
  onSelectTarget?: (target: SyncTarget) => void;
}

export const SyncModal: React.FC<SyncModalProps> = ({
  state,
  isOpen,
  onClose,
  onSyncNow,
  onSelectTarget
}) => {
  if (!isOpen) return null;

  const targets: Array<{ id: SyncTarget; label: string; desc: string }> = [
    { id: 'folder', label: 'Local Drive', desc: 'File System Sync & JSON backup' },
    { id: 'gdrive', label: 'Google Drive', desc: 'Cloud storage integration' },
    { id: 'webdav', label: 'WebDAV / Nextcloud', desc: 'Self-hosted sync server' }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 max-w-md w-full p-5">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Cloud size={16} className="text-blue-500" />
            <h3 className="text-sm font-semibold text-gray-800">Cloud & Local Sync</h3>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded">
            <X size={16} />
          </button>
        </div>

        <div className="py-4 space-y-2.5">
          {targets.map(t => (
            <div
              key={t.id}
              onClick={() => onSelectTarget?.(t.id)}
              className="p-3 border border-gray-200 hover:border-blue-400 rounded-xl cursor-pointer transition-colors"
            >
              <div className="text-xs font-semibold text-gray-800">{t.label}</div>
              <div className="text-[11px] text-gray-400">{t.desc}</div>
            </div>
          ))}
        </div>

        {onSyncNow && (
          <div className="pt-2 border-t border-gray-100 flex justify-end">
            <button
              onClick={onSyncNow}
              className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700"
            >
              Sync Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
