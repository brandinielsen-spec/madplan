'use client';

import { useState } from 'react';
import { DagData, Ugedag, Opskrift } from '@/lib/types';
import { formatDate } from '@/lib/utils';

interface DayCardProps {
  dag: Ugedag;
  label: string;
  date: Date;
  data: DagData;
  opskrifter: Opskrift[];
  tidligereRetter: string[];
  onSave: (ret: string, opskriftId?: string) => void;
  onDelete: () => void;
  onViewOpskrift?: (opskriftId: string) => void;
}

export default function DayCard({
  dag,
  label,
  date,
  data,
  opskrifter,
  tidligereRetter,
  onSave,
  onDelete,
  onViewOpskrift,
}: DayCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [retInput, setRetInput] = useState(data.ret || '');
  const [selectedOpskriftId, setSelectedOpskriftId] = useState(data.opskriftId || '');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredSuggestions = tidligereRetter.filter(
    (ret) => ret.toLowerCase().includes(retInput.toLowerCase()) && ret !== retInput
  );

  const handleSave = () => {
    if (retInput.trim()) {
      onSave(retInput.trim(), selectedOpskriftId || undefined);
      setIsEditing(false);
    }
  };

  const handleDelete = () => {
    onDelete();
    setRetInput('');
    setSelectedOpskriftId('');
    setIsEditing(false);
  };

  const handleSelectSuggestion = (ret: string) => {
    setRetInput(ret);
    setShowSuggestions(false);
  };

  const handleSelectOpskrift = (opskriftId: string) => {
    setSelectedOpskriftId(opskriftId);
    if (opskriftId) {
      const opskrift = opskrifter.find(o => o.id === opskriftId);
      if (opskrift) {
        setRetInput(opskrift.titel);
      }
    }
  };

  const linkedOpskrift = opskrifter.find((o) => o.id === data.opskriftId);

  if (!isEditing) {
    // Visning af dagen (ikke redigering)
    if (data.ret) {
      return (
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="font-semibold text-gray-900">{label}</h3>
              <p className="text-sm text-gray-500">{formatDate(date)}</p>
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
          </div>
          <p className="text-gray-900 font-medium">{data.ret}</p>
          {linkedOpskrift && onViewOpskrift && (
            <button
              onClick={() => onViewOpskrift(linkedOpskrift.id)}
              className="mt-1 text-sm text-blue-600 hover:text-blue-700"
            >
              Se opskrift →
            </button>
          )}
        </div>
      );
    }

    // Tilføj ret knap
    return (
      <div className="bg-white rounded-xl p-4 shadow-sm">
        <div className="mb-2">
          <h3 className="font-semibold text-gray-900">{label}</h3>
          <p className="text-sm text-gray-500">{formatDate(date)}</p>
        </div>
        <button
          onClick={() => setIsEditing(true)}
          className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors"
        >
          + Tilføj ret
        </button>
      </div>
    );
  }

  // Redigerings-tilstand
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <div className="mb-3">
        <h3 className="font-semibold text-gray-900">{label}</h3>
        <p className="text-sm text-gray-500">{formatDate(date)}</p>
      </div>

      <div className="space-y-3">
        {/* OPSKRIFTER DROPDOWN - ALTID SYNLIG */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <label className="block text-sm font-medium text-blue-800 mb-2">
            📖 Vælg fra opskrifter ({opskrifter.length})
          </label>
          <select
            value={selectedOpskriftId}
            onChange={(e) => handleSelectOpskrift(e.target.value)}
            className="w-full px-3 py-2 border border-blue-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">-- Vælg en opskrift --</option>
            {opskrifter.map((opskrift) => (
              <option key={opskrift.id} value={opskrift.id}>
                {opskrift.titel}
              </option>
            ))}
          </select>
        </div>

        {/* DIVIDER */}
        <div className="flex items-center gap-2 text-gray-400 text-xs">
          <div className="flex-1 border-t"></div>
          <span>eller skriv selv</span>
          <div className="flex-1 border-t"></div>
        </div>

        {/* MANUEL INPUT */}
        <div className="relative">
          <input
            type="text"
            value={retInput}
            onChange={(e) => {
              setRetInput(e.target.value);
              setSelectedOpskriftId('');
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            placeholder="Skriv rettenavn..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {showSuggestions && filteredSuggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
              {filteredSuggestions.slice(0, 5).map((ret, i) => (
                <button
                  key={i}
                  onClick={() => handleSelectSuggestion(ret)}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm"
                >
                  {ret}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* KNAPPER */}
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={!retInput.trim()}
            className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Gem
          </button>
          {data.ret && (
            <button
              onClick={handleDelete}
              className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium"
            >
              Slet
            </button>
          )}
          <button
            onClick={() => {
              setIsEditing(false);
              setRetInput(data.ret || '');
              setSelectedOpskriftId(data.opskriftId || '');
            }}
            className="px-3 py-2 text-gray-500 hover:bg-gray-100 rounded-lg text-sm"
          >
            Annuller
          </button>
        </div>
      </div>
    </div>
  );
}
