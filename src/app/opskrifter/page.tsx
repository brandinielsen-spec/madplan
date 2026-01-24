'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import RecipeModal from '@/components/RecipeModal';
import { Ejer, Opskrift } from '@/lib/types';
import * as api from '@/lib/api';

function OpskrifterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [ejere, setEjere] = useState<Ejer[]>([]);
  const [selectedEjerId, setSelectedEjerId] = useState<string | null>(null);
  const [opskrifter, setOpskrifter] = useState<Opskrift[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const filteredOpskrifter = opskrifter.filter(o =>
    o && o.titel && o.titel.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    async function loadEjere() {
      try {
        const data = await api.hentEjere();
        setEjere(data);

        const urlEjerId = searchParams.get('ejer');
        if (urlEjerId && data.find(e => e.id === urlEjerId)) {
          setSelectedEjerId(urlEjerId);
        } else if (data.length > 0) {
          setSelectedEjerId(data[0].id);
        }
      } catch (error) {
        console.error('Fejl ved hentning af ejere:', error);
      } finally {
        setLoading(false);
      }
    }
    loadEjere();
  }, [searchParams]);

  useEffect(() => {
    if (!selectedEjerId) return;

    async function loadOpskrifter() {
      setLoading(true);
      try {
        const data = await api.hentOpskrifter(selectedEjerId!);
        setOpskrifter(data);
      } catch (error) {
        console.error('Fejl ved hentning af opskrifter:', error);
      } finally {
        setLoading(false);
      }
    }
    loadOpskrifter();
  }, [selectedEjerId]);

  const handleSelectEjer = useCallback((ejerId: string) => {
    setSelectedEjerId(ejerId);
    router.push(`/opskrifter?ejer=${ejerId}`);
  }, [router]);

  const handleCreateOpskrift = useCallback(async (data: Omit<Opskrift, 'id' | 'oprettetDato' | 'ejerId'>) => {
    if (!selectedEjerId) return;

    try {
      const newOpskrift = await api.opretOpskrift({
        ...data,
        ejerId: selectedEjerId,
      });
      setOpskrifter(prev => [newOpskrift, ...prev]);
      setShowModal(false);
    } catch (error) {
      console.error('Fejl ved oprettelse af opskrift:', error);
    }
  }, [selectedEjerId]);

  if (loading && ejere.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Indlæser...</div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto p-4">
      <header className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Opskrifter</h1>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
          >
            + Ny
          </button>
        </div>

        <select
          value={selectedEjerId || ''}
          onChange={(e) => handleSelectEjer(e.target.value)}
          className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
        >
          <option value="" disabled>Vælg ejer...</option>
          {ejere.map((ejer) => (
            <option key={ejer.id} value={ejer.id}>{ejer.navn}</option>
          ))}
        </select>

        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Søg efter opskrift..."
          className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </header>

      {selectedEjerId && (
        <div className="space-y-3">
          {filteredOpskrifter.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchQuery ? 'Ingen opskrifter matcher din søgning' : 'Ingen opskrifter endnu'}
            </div>
          ) : (
            filteredOpskrifter.map((opskrift) => (
              <Link
                key={opskrift.id}
                href={`/opskrifter/${opskrift.id}`}
                className="block bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <h3 className="font-semibold text-gray-900">{opskrift.titel}</h3>
                <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                  <span>{opskrift.portioner} portioner</span>
                  <span>•</span>
                  <span>{opskrift.ingredienser.length} ingredienser</span>
                </div>
              </Link>
            ))
          )}
        </div>
      )}

      {showModal && (
        <RecipeModal
          onSave={handleCreateOpskrift}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}

export default function OpskrifterPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="text-gray-500">Indlæser...</div></div>}>
      <OpskrifterContent />
    </Suspense>
  );
}
