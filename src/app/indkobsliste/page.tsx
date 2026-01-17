'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import WeekSelector from '@/components/WeekSelector';
import ShoppingItem from '@/components/ShoppingItem';
import { Ejer, Indkoebspost } from '@/lib/types';
import { getCurrentWeek } from '@/lib/utils';
import * as api from '@/lib/api';

export default function IndkobslistePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [ejere, setEjere] = useState<Ejer[]>([]);
  const [selectedEjerId, setSelectedEjerId] = useState<string | null>(null);
  const [aar, setAar] = useState(getCurrentWeek().aar);
  const [uge, setUge] = useState(getCurrentWeek().uge);
  const [indkoebsposter, setIndkoebsposter] = useState<Indkoebspost[]>([]);
  const [newItem, setNewItem] = useState('');
  const [loading, setLoading] = useState(true);

  const uafkrydsede = indkoebsposter.filter(p => !p.afkrydset);
  const afkrydsede = indkoebsposter.filter(p => p.afkrydset);

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

    async function loadIndkoebsliste() {
      setLoading(true);
      try {
        const data = await api.hentIndkoebsliste(selectedEjerId!, aar, uge);
        setIndkoebsposter(data);
      } catch (error) {
        console.error('Fejl ved hentning af indkøbsliste:', error);
        setIndkoebsposter([]);
      } finally {
        setLoading(false);
      }
    }
    loadIndkoebsliste();
  }, [selectedEjerId, aar, uge]);

  const handleNavigate = useCallback((newAar: number, newUge: number) => {
    setAar(newAar);
    setUge(newUge);
  }, []);

  const handleSelectEjer = useCallback((ejerId: string) => {
    setSelectedEjerId(ejerId);
    router.push(`/indkobsliste?ejer=${ejerId}`);
  }, [router]);

  const handleAddItem = useCallback(async () => {
    if (!selectedEjerId || !newItem.trim()) return;

    try {
      const item = await api.tilfoejManuelPost(selectedEjerId, aar, uge, newItem.trim());
      setIndkoebsposter(prev => [...prev, item]);
      setNewItem('');
    } catch (error) {
      console.error('Fejl ved tilføjelse af vare:', error);
    }
  }, [selectedEjerId, aar, uge, newItem]);

  const handleToggle = useCallback(async (id: string, checked: boolean) => {
    try {
      const updated = await api.opdaterIndkoebspost(id, checked);
      setIndkoebsposter(prev => prev.map(p => p.id === id ? updated : p));
    } catch (error) {
      console.error('Fejl ved opdatering af vare:', error);
    }
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    try {
      await api.sletIndkoebspost(id);
      setIndkoebsposter(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error('Fejl ved sletning af vare:', error);
    }
  }, []);

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
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Indkøbsliste</h1>

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
      </header>

      {selectedEjerId && (
        <>
          <div className="mb-6">
            <WeekSelector
              aar={aar}
              uge={uge}
              onNavigate={handleNavigate}
            />
          </div>

          <div className="mb-6">
            <div className="flex gap-2">
              <input
                type="text"
                value={newItem}
                onChange={(e) => setNewItem(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
                placeholder="Tilføj vare..."
                className="flex-1 px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleAddItem}
                disabled={!newItem.trim()}
                className="px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Tilføj
              </button>
            </div>
          </div>

          {indkoebsposter.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Ingen varer på listen endnu
            </div>
          ) : (
            <>
              {uafkrydsede.length > 0 && (
                <section className="mb-6">
                  <h2 className="text-sm font-medium text-gray-500 mb-3">
                    At købe ({uafkrydsede.length})
                  </h2>
                  <div className="space-y-2">
                    {uafkrydsede.map((item) => (
                      <ShoppingItem
                        key={item.id}
                        item={item}
                        onToggle={handleToggle}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                </section>
              )}

              {afkrydsede.length > 0 && (
                <section>
                  <h2 className="text-sm font-medium text-gray-500 mb-3">
                    Købt ({afkrydsede.length})
                  </h2>
                  <div className="space-y-2">
                    {afkrydsede.map((item) => (
                      <ShoppingItem
                        key={item.id}
                        item={item}
                        onToggle={handleToggle}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                </section>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
