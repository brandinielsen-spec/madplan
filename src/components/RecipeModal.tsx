'use client';

import { useState, useEffect } from 'react';
import { Opskrift } from '@/lib/types';

interface RecipeModalProps {
  opskrift?: Opskrift | null;
  onSave: (data: Omit<Opskrift, 'id' | 'oprettetDato' | 'ejerId'>) => void;
  onDelete?: () => void;
  onClose: () => void;
}

export default function RecipeModal({ opskrift, onSave, onDelete, onClose }: RecipeModalProps) {
  const [titel, setTitel] = useState('');
  const [portioner, setPortioner] = useState(4);
  const [ingredienser, setIngredienser] = useState('');
  const [fremgangsmaade, setFremgangsmaade] = useState('');

  useEffect(() => {
    if (opskrift) {
      setTitel(opskrift.titel);
      setPortioner(opskrift.portioner);
      setIngredienser(opskrift.ingredienser.join('\n'));
      setFremgangsmaade(opskrift.fremgangsmaade);
    }
  }, [opskrift]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titel.trim()) return;

    onSave({
      titel: titel.trim(),
      portioner,
      ingredienser: ingredienser.split('\n').filter((i) => i.trim()),
      fremgangsmaade: fremgangsmaade.trim(),
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl p-6 w-full max-w-lg my-8">
        <h2 className="text-lg font-semibold mb-4">
          {opskrift ? 'Rediger opskrift' : 'Ny opskrift'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Titel</label>
            <input
              type="text"
              value={titel}
              onChange={(e) => setTitel(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="F.eks. Spaghetti Bolognese"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Portioner</label>
            <input
              type="number"
              value={portioner}
              onChange={(e) => setPortioner(Number(e.target.value))}
              min={1}
              max={20}
              className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ingredienser (én per linje)
            </label>
            <textarea
              value={ingredienser}
              onChange={(e) => setIngredienser(e.target.value)}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="500g hakket oksekød&#10;1 dåse hakkede tomater&#10;2 løg&#10;..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fremgangsmåde</label>
            <textarea
              value={fremgangsmaade}
              onChange={(e) => setFremgangsmaade(e.target.value)}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="1. Brun kødet i en gryde...&#10;2. Tilsæt løg og hvidløg..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
            >
              {opskrift ? 'Gem ændringer' : 'Opret opskrift'}
            </button>
            {opskrift && onDelete && (
              <button
                type="button"
                onClick={onDelete}
                className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium"
              >
                Slet
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium"
            >
              Annuller
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
