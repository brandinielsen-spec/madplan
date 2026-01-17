'use client';

import { Indkoebspost } from '@/lib/types';

interface ShoppingItemProps {
  item: Indkoebspost;
  onToggle: (id: string, checked: boolean) => void;
  onDelete: (id: string) => void;
}

export default function ShoppingItem({ item, onToggle, onDelete }: ShoppingItemProps) {
  return (
    <div className={`flex items-center gap-3 p-3 bg-white rounded-lg shadow-sm ${
      item.afkrydset ? 'opacity-60' : ''
    }`}>
      <button
        onClick={() => onToggle(item.id, !item.afkrydset)}
        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
          item.afkrydset
            ? 'bg-green-500 border-green-500'
            : 'border-gray-300 hover:border-green-400'
        }`}
      >
        {item.afkrydset && (
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      <div className="flex-1">
        <span className={`text-gray-900 ${item.afkrydset ? 'line-through' : ''}`}>
          {item.navn}
        </span>
        {item.kilde === 'manuel' && (
          <span className="ml-2 text-xs text-gray-400">(manuel)</span>
        )}
      </div>

      {item.kilde === 'manuel' && (
        <button
          onClick={() => onDelete(item.id)}
          className="p-1 text-gray-400 hover:text-red-500"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      )}
    </div>
  );
}
