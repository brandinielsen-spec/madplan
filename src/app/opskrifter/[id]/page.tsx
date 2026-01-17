'use client';

import { useState, useEffect, useCallback, use } from 'react';
import { useRouter } from 'next/navigation';
import RecipeModal from '@/components/RecipeModal';
import { Opskrift } from '@/lib/types';
import * as api from '@/lib/api';

interface Props {
  params: Promise<{ id: string }>;
}

export default function OpskriftDetailPage({ params }: Props) {
  const { id } = use(params);
  const router = useRouter();

  const [opskrift, setOpskrift] = useState<Opskrift | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOpskrift() {
      try {
        const data = await api.hentOpskrift(id);
        setOpskrift(data);
      } catch (error) {
        console.error('Fejl ved hentning af opskrift:', error);
        router.push('/opskrifter');
      } finally {
        setLoading(false);
      }
    }
    loadOpskrift();
  }, [id, router]);

  const handleUpdate = useCallback(async (data: Omit<Opskrift, 'id' | 'oprettetDato' | 'ejerId'>) => {
    if (!opskrift) return;

    try {
      const updated = await api.opdaterOpskrift(opskrift.id, data);
      setOpskrift(updated);
      setShowEditModal(false);
    } catch (error) {
      console.error('Fejl ved opdatering af opskrift:', error);
    }
  }, [opskrift]);

  const handleDelete = useCallback(async () => {
    if (!opskrift) return;

    if (!confirm('Er du sikker på, at du vil slette denne opskrift?')) return;

    try {
      await api.sletOpskrift(opskrift.id);
      router.push('/opskrifter');
    } catch (error) {
      console.error('Fejl ved sletning af opskrift:', error);
    }
  }, [opskrift, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Indlæser...</div>
      </div>
    );
  }

  if (!opskrift) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Opskrift ikke fundet</div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto p-4">
      <header className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Tilbage
        </button>

        <div className="flex items-start justify-between">
          <h1 className="text-2xl font-bold text-gray-900">{opskrift.titel}</h1>
          <button
            onClick={() => setShowEditModal(true)}
            className="p-2 text-gray-500 hover:text-gray-700"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
        </div>

        <p className="text-gray-500 mt-1">{opskrift.portioner} portioner</p>
      </header>

      <section className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-3">Ingredienser</h2>
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <ul className="space-y-2">
            {opskrift.ingredienser.map((ingrediens, index) => (
              <li key={index} className="flex items-start">
                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                <span className="text-gray-700">{ingrediens}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {opskrift.fremgangsmaade && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Fremgangsmåde</h2>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="text-gray-700 whitespace-pre-wrap">{opskrift.fremgangsmaade}</div>
          </div>
        </section>
      )}

      {showEditModal && (
        <RecipeModal
          opskrift={opskrift}
          onSave={handleUpdate}
          onDelete={handleDelete}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </div>
  );
}
