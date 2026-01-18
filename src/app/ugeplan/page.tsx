'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import WeekSelector from '@/components/WeekSelector';
import DayCard from '@/components/DayCard';
import OwnerSelector from '@/components/OwnerSelector';
import CopyWeekModal from '@/components/CopyWeekModal';
import { Ejer, Opskrift, Ugeplan, UGEDAGE, Ugedag } from '@/lib/types';
import { getCurrentWeek, getWeekDates, createEmptyUgeplan } from '@/lib/utils';
import * as api from '@/lib/api';

function UgeplanContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [ejere, setEjere] = useState<Ejer[]>([]);
  const [selectedEjerId, setSelectedEjerId] = useState<string | null>(null);
  const [aar, setAar] = useState(getCurrentWeek().aar);
  const [uge, setUge] = useState(getCurrentWeek().uge);
  const [ugeplan, setUgeplan] = useState<Ugeplan | null>(null);
  const [opskrifter, setOpskrifter] = useState<Opskrift[]>([]);
  const [tidligereRetter, setTidligereRetter] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [addedToShopping, setAddedToShopping] = useState<Set<string>>(new Set());

  const weekDates = getWeekDates(aar, uge);

  // Load ejere on mount
  useEffect(() => {
    async function loadEjere() {
      try {
        const data = await api.hentEjere();
        setEjere(data);

        // Auto-select first owner or from URL
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

  // Load ugeplan when ejer or week changes
  useEffect(() => {
    if (!selectedEjerId) return;

    async function loadUgeplan() {
      setLoading(true);
      try {
        const [plan, recipes, retter] = await Promise.all([
          api.hentUgeplan(selectedEjerId!, aar, uge),
          api.hentOpskrifter(selectedEjerId!),
          api.hentTidligereRetter(selectedEjerId!),
        ]);

        setUgeplan(plan || createEmptyUgeplan(selectedEjerId!, aar, uge) as Ugeplan);
        setOpskrifter(recipes);
        setTidligereRetter(retter);
      } catch (error) {
        console.error('Fejl ved hentning af ugeplan:', error);
        setUgeplan(createEmptyUgeplan(selectedEjerId!, aar, uge) as Ugeplan);
      } finally {
        setLoading(false);
      }
    }
    loadUgeplan();
  }, [selectedEjerId, aar, uge]);

  const handleNavigate = useCallback((newAar: number, newUge: number) => {
    setAar(newAar);
    setUge(newUge);
  }, []);

  const handleSelectEjer = useCallback((ejerId: string) => {
    setSelectedEjerId(ejerId);
    router.push(`/ugeplan?ejer=${ejerId}`);
  }, [router]);

  const handleAddEjer = useCallback(async (navn: string) => {
    try {
      const newEjer = await api.opretEjer(navn);
      setEjere(prev => [...prev, newEjer]);
      setSelectedEjerId(newEjer.id);
    } catch (error) {
      console.error('Fejl ved oprettelse af ejer:', error);
    }
  }, []);

  const handleSaveDay = useCallback(async (dag: Ugedag, ret: string, opskriftId?: string) => {
    if (!selectedEjerId) return;

    try {
      const updated = await api.gemDag(selectedEjerId, aar, uge, dag, ret, opskriftId);
      setUgeplan(updated);
    } catch (error) {
      console.error('Fejl ved gem af dag:', error);
    }
  }, [selectedEjerId, aar, uge]);

  const handleDeleteDay = useCallback(async (dag: Ugedag) => {
    if (!selectedEjerId) return;

    try {
      await api.sletDag(selectedEjerId, aar, uge, dag);
      setUgeplan(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          dage: {
            ...prev.dage,
            [dag]: { ret: null, opskriftId: null }
          }
        };
      });
    } catch (error) {
      console.error('Fejl ved sletning af dag:', error);
    }
  }, [selectedEjerId, aar, uge]);

  const handleCopyWeek = useCallback(async (tilAar: number, tilUge: number) => {
    if (!selectedEjerId) return;

    try {
      await api.kopierUge(selectedEjerId, aar, uge, tilAar, tilUge);
      setShowCopyModal(false);
      handleNavigate(tilAar, tilUge);
    } catch (error) {
      console.error('Fejl ved kopiering af uge:', error);
    }
  }, [selectedEjerId, aar, uge, handleNavigate]);

  const handleViewOpskrift = useCallback((opskriftId: string) => {
    router.push(`/opskrifter/${opskriftId}`);
  }, [router]);

  const handleAddToShopping = useCallback(async (opskrift: Opskrift) => {
    if (!selectedEjerId || addedToShopping.has(opskrift.id)) return;

    try {
      await api.tilfoejIngredienser(selectedEjerId, aar, uge, opskrift.ingredienser);
      setAddedToShopping(prev => new Set(prev).add(opskrift.id));
    } catch (error) {
      console.error('Fejl ved tilføjelse til indkøbsliste:', error);
    }
  }, [selectedEjerId, aar, uge, addedToShopping]);

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
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Madplan</h1>
        <OwnerSelector
          ejere={ejere}
          selectedEjerId={selectedEjerId}
          onSelect={handleSelectEjer}
          onAddEjer={handleAddEjer}
        />
      </header>

      {selectedEjerId && (
        <>
          <div className="mb-6">
            <WeekSelector
              aar={aar}
              uge={uge}
              onNavigate={handleNavigate}
              onCopyWeek={() => setShowCopyModal(true)}
            />
          </div>

          <div className="space-y-3">
            {UGEDAGE.map((dag, index) => (
              <DayCard
                key={dag.key}
                dag={dag.key}
                label={dag.label}
                date={weekDates[index]}
                data={ugeplan?.dage?.[dag.key] || { ret: null, opskriftId: null }}
                opskrifter={opskrifter}
                tidligereRetter={tidligereRetter}
                onSave={(ret, opskriftId) => handleSaveDay(dag.key, ret, opskriftId)}
                onDelete={() => handleDeleteDay(dag.key)}
                onViewOpskrift={handleViewOpskrift}
                onAddToShopping={handleAddToShopping}
                addedToShopping={addedToShopping.has(ugeplan?.dage?.[dag.key]?.opskriftId || '')}
              />
            ))}
          </div>

          {showCopyModal && (
            <CopyWeekModal
              fraAar={aar}
              fraUge={uge}
              onCopy={handleCopyWeek}
              onClose={() => setShowCopyModal(false)}
            />
          )}
        </>
      )}
    </div>
  );
}

export default function UgeplanPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><div className="text-gray-500">Indlæser...</div></div>}>
      <UgeplanContent />
    </Suspense>
  );
}
