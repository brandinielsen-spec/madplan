'use client';

import { useState, useEffect, useRef } from 'react';
import { Opskrift } from '@/lib/types';
import * as api from '@/lib/api';

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
  const [importUrl, setImportUrl] = useState('');
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleImportUrl = async () => {
    if (!importUrl.trim()) return;

    setImporting(true);
    setImportError('');

    try {
      const data = await api.importOpskriftFraUrl(importUrl.trim());
      setTitel(data.titel);
      setPortioner(data.portioner);
      setIngredienser(data.ingredienser.join('\n'));
      setFremgangsmaade(data.fremgangsmaade);
      setImportUrl('');
    } catch (error) {
      setImportError(error instanceof Error ? error.message : 'Kunne ikke importere opskrift');
    } finally {
      setImporting(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setImportError('');

    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64 = reader.result as string;
          const data = await api.importOpskriftFraBillede(base64);
          setTitel(data.titel);
          setPortioner(data.portioner);
          setIngredienser(data.ingredienser.join('\n'));
          setFremgangsmaade(data.fremgangsmaade);
        } catch (error) {
          setImportError(error instanceof Error ? error.message : 'Kunne ikke importere opskrift');
        } finally {
          setImporting(false);
        }
      };
      reader.onerror = () => {
        setImportError('Kunne ikke læse billedet');
        setImporting(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      setImportError('Kunne ikke læse billedet');
      setImporting(false);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-xl p-6 w-full max-w-lg my-8">
        <h2 className="text-lg font-semibold mb-4">
          {opskrift ? 'Rediger opskrift' : 'Ny opskrift'}
        </h2>

        {/* Import section */}
        {!opskrift && (
          <div className="mb-6 p-4 bg-gray-50 rounded-lg space-y-3">
            <p className="text-sm font-medium text-gray-700">Importer opskrift</p>

            {/* URL import */}
            <div className="flex gap-2">
              <input
                type="url"
                value={importUrl}
                onChange={(e) => setImportUrl(e.target.value)}
                placeholder="Indsæt URL fra opskriftsside..."
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={importing}
              />
              <button
                type="button"
                onClick={handleImportUrl}
                disabled={importing || !importUrl.trim()}
                className="px-3 py-2 text-sm bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              >
                {importing ? 'Henter...' : 'Hent'}
              </button>
            </div>

            {/* Image import */}
            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                disabled={importing}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={importing}
                className="flex-1 px-3 py-2 text-sm border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {importing ? 'Analyserer billede...' : '📷 Upload billede af opskrift'}
              </button>
            </div>

            {importError && (
              <p className="text-sm text-red-600">{importError}</p>
            )}
          </div>
        )}

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
