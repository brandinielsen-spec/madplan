'use client';

import { useState } from 'react';
import { Ejer } from '@/lib/types';

interface OwnerSelectorProps {
  ejere: Ejer[];
  selectedEjerId: string | null;
  onSelect: (ejerId: string) => void;
  onAddEjer: (navn: string) => void;
}

export default function OwnerSelector({ ejere, selectedEjerId, onSelect, onAddEjer }: OwnerSelectorProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');

  const handleAdd = () => {
    if (newName.trim()) {
      onAddEjer(newName.trim());
      setNewName('');
      setIsAdding(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <select
        value={selectedEjerId || ''}
        onChange={(e) => onSelect(e.target.value)}
        className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="" disabled>Vælg ejer...</option>
        {ejere.map((ejer) => (
          <option key={ejer.id} value={ejer.id}>
            {ejer.navn}
          </option>
        ))}
      </select>

      {isAdding ? (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Navn..."
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          <button
            onClick={handleAdd}
            className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            Tilføj
          </button>
          <button
            onClick={() => setIsAdding(false)}
            className="px-3 py-2 text-gray-500 hover:text-gray-700"
          >
            Annuller
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsAdding(true)}
          className="px-3 py-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          + Ny ejer
        </button>
      )}
    </div>
  );
}
