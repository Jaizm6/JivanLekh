import React from 'react';
import { AppState, AppPreferences } from '../types';
import { X, Settings, Sliders } from 'lucide-react';

export interface SettingsModalProps {
  state?: AppState;
  isOpen: boolean;
  onClose: () => void;
  onUpdatePref?: (pref: Partial<AppPreferences>) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  state,
  isOpen,
  onClose,
  onUpdatePref
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 max-w-md w-full p-5">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Settings size={16} className="text-gray-600" />
            <h3 className="text-sm font-semibold text-gray-800">Preferences</h3>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded">
            <X size={16} />
          </button>
        </div>

        <div className="py-4 space-y-4 text-xs">
          <div>
            <label className="block text-gray-600 font-medium mb-1">Editor Font</label>
            <div className="flex gap-2">
              {(['serif', 'sans', 'mono'] as const).map(font => (
                <button
                  key={font}
                  onClick={() => onUpdatePref?.({ font })}
                  className={`flex-1 py-1.5 px-3 rounded-lg border text-center font-medium capitalize ${
                    state?.pref.font === font
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {font}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-gray-600 font-medium mb-1">Font Size ({state?.pref.size || 16}px)</label>
            <input
              type="range"
              min="14"
              max="24"
              value={state?.pref.size || 16}
              onChange={e => onUpdatePref?.({ size: Number(e.target.value) })}
              className="w-full accent-blue-600"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
