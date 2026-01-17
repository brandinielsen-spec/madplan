'use client';

import { useState } from 'react';
import { getCurrentWeek, navigateWeek } from '@/lib/utils';

interface CopyWeekModalProps {
  fraAar: number;
  fraUge: number;
  onCopy: (tilAar: number, tilUge: number) => void;
  onClose: () => void;
}

export default function CopyWeekModal({ fraAar, fraUge, onCopy, onClose }: CopyWeekModalProps) {
  const { aar: currentAar, uge: currentUge } = getCurrentWeek();
  const [tilAar, setTilAar] = useState(currentAar);
  const [tilUge, setTilUge] = useState(currentUge + 1 > 52 ? 1 : currentUge + 1);

  const handleCopy = () => {
    if (tilAar === fraAar && tilUge === fraUge) {
      alert('Du kan ikke kopiere til samme uge');
      return;
    }
    onCopy(tilAar, tilUge);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-sm">
        <h2 className="text-lg font-semibold mb-4">Kopiér uge {fraUge}</h2>

        <p className="text-sm text-gray-600 mb-4">
          Kopierer retter, opskriftsreferencer og manuelle indkøbsposter til en anden uge.
        </p>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">År</label>
            <select
              value={tilAar}
              onChange={(e) => setTilAar(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {[currentAar - 1, currentAar, currentAar + 1].map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Uge</label>
            <select
              value={tilUge}
              onChange={(e) => setTilUge(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Array.from({ length: 52 }, (_, i) => i + 1).map((week) => (
                <option key={week} value={week}>Uge {week}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleCopy}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
          >
            Kopiér til uge {tilUge}
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
          >
            Annuller
          </button>
        </div>
      </div>
    </div>
  );
}
