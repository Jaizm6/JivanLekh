import React from 'react';
import { Notebook } from '../types';
import { COVER_PRESETS, getCoverSvg } from '../utils/covers';
import { X, Check } from 'lucide-react';

export interface CoverModalProps {
  notebook: Notebook | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectCover: (coverIndex: number) => void;
}

export const CoverModal: React.FC<CoverModalProps> = ({
  notebook,
  isOpen,
  onClose,
  onSelectCover
}) => {
  if (!isOpen || !notebook) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 max-w-md w-full p-5">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-800">Notebook Cover</h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded">
            <X size={16} />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3 py-4">
          {COVER_PRESETS.map((preset, index) => {
            const isSelected = notebook.cover === index;
            return (
              <button
                key={index}
                onClick={() => {
                  onSelectCover(index);
                  onClose();
                }}
                className={`relative aspect-[3/4] rounded-lg overflow-hidden border-2 transition-transform hover:scale-102 ${
                  isSelected ? 'border-blue-500 ring-2 ring-blue-300' : 'border-transparent'
                }`}
              >
                <img src={getCoverSvg(index)} alt={preset[0]} className="w-full h-full object-cover" />
                {isSelected && (
                  <div className="absolute top-2 right-2 bg-blue-600 text-white p-0.5 rounded-full">
                    <Check size={12} />
                  </div>
                )}
                <div className="absolute inset-x-0 bottom-0 p-1.5 bg-black/50 text-[10px] text-white font-medium text-center truncate">
                  {preset[0]}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
