import React from 'react';
import { AppState, Notebook } from '../types';
import { getCoverSvg } from '../utils/covers';
import { Plus, BookOpen, MoreVertical } from 'lucide-react';

export interface NotebookShelfProps {
  state?: AppState;
  notebooks?: Notebook[];
  onSelectNotebook?: (id: string) => void;
  onCreateNotebook?: () => void;
}

export const NotebookShelf: React.FC<NotebookShelfProps> = ({
  notebooks = [],
  onSelectNotebook,
  onCreateNotebook
}) => {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-gray-800">Notebooks</h2>
        {onCreateNotebook && (
          <button
            onClick={onCreateNotebook}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700"
          >
            <Plus size={14} /> New Notebook
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {notebooks.map(nb => (
          <div
            key={nb.id}
            onClick={() => onSelectNotebook?.(nb.id)}
            className="group relative aspect-[3/4] rounded-xl overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition-all hover:-translate-y-1 bg-gray-100 border border-gray-200"
          >
            <img
              src={getCoverSvg(nb.cover || 0)}
              alt={nb.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-x-2 bottom-2 p-2 bg-white/90 backdrop-blur-xs rounded-lg shadow-xs">
              <h4 className="text-xs font-semibold text-gray-800 truncate">{nb.name}</h4>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
