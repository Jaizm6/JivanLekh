import React from 'react';
import { AppState, Reminder } from '../types';
import { Bell, X, Check, Clock } from 'lucide-react';

export interface RemindersModalProps {
  state?: AppState;
  reminders?: Reminder[];
  isOpen: boolean;
  onClose: () => void;
  onToggleReminder?: (id: string) => void;
}

export const RemindersModal: React.FC<RemindersModalProps> = ({
  reminders = [],
  isOpen,
  onClose,
  onToggleReminder
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 max-w-md w-full p-5">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Bell size={16} className="text-amber-500" />
            <h3 className="text-sm font-semibold text-gray-800">Reminders</h3>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded">
            <X size={16} />
          </button>
        </div>

        <div className="py-4 space-y-2 max-h-72 overflow-y-auto">
          {reminders.length === 0 ? (
            <div className="text-center py-6 text-xs text-gray-400">No active reminders</div>
          ) : (
            reminders.map(rem => (
              <div
                key={rem.id}
                className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg text-xs"
              >
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onToggleReminder?.(rem.id)}
                    className={`w-4 h-4 rounded border flex items-center justify-center ${
                      rem.done ? 'bg-green-600 border-green-600 text-white' : 'border-gray-300'
                    }`}
                  >
                    {rem.done && <Check size={10} />}
                  </button>
                  <span className={rem.done ? 'line-through text-gray-400' : 'text-gray-700'}>
                    {rem.text}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-gray-400">
                  <Clock size={11} />
                  <span>{new Date(rem.time || rem.at || 0).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
