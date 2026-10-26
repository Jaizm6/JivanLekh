import React, { useState } from 'react';
import { AppState } from '../types';
import { X, Tag, Plus, Trash2 } from 'lucide-react';

export interface TagsModalProps {
  state?: AppState;
  tags?: string[];
  isOpen: boolean;
  onClose: () => void;
  onAddTag?: (tag: string) => void;
  onDeleteTag?: (tag: string) => void;
}

export const TagsModal: React.FC<TagsModalProps> = ({
  tags = [],
  isOpen,
  onClose,
  onAddTag,
  onDeleteTag
}) => {
  const [newTag, setNewTag] = useState('');

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTag.trim() && onAddTag) {
      onAddTag(newTag.trim().toLowerCase());
      setNewTag('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 max-w-md w-full p-5">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Tag size={16} className="text-blue-500" />
            <h3 className="text-sm font-semibold text-gray-800">Manage Tags</h3>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded">
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleAdd} className="flex gap-2 my-4">
          <input
            type="text"
            placeholder="New tag name..."
            value={newTag}
            onChange={e => setNewTag(e.target.value)}
            className="flex-1 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs outline-none focus:border-blue-400"
          />
          <button
            type="submit"
            className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 flex items-center gap-1"
          >
            <Plus size={14} /> Add
          </button>
        </form>

        <div className="space-y-1.5 max-h-60 overflow-y-auto">
          {tags.length === 0 ? (
            <div className="text-center py-6 text-xs text-gray-400">No tags created yet</div>
          ) : (
            tags.map(t => (
              <div
                key={t}
                className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg text-xs"
              >
                <span className="font-medium text-gray-700">#{t}</span>
                {onDeleteTag && (
                  <button
                    onClick={() => onDeleteTag(t)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
