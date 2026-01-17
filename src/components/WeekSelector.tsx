'use client';

import { navigateWeek, getWeekDates, formatDate } from '@/lib/utils';

interface WeekSelectorProps {
  aar: number;
  uge: number;
  onNavigate: (aar: number, uge: number) => void;
  onCopyWeek?: () => void;
}

export default function WeekSelector({ aar, uge, onNavigate, onCopyWeek }: WeekSelectorProps) {
  const dates = getWeekDates(aar, uge);
  const startDate = formatDate(dates[0]);
  const endDate = formatDate(dates[6]);

  const handlePrev = () => {
    const { aar: newAar, uge: newUge } = navigateWeek(aar, uge, 'prev');
    onNavigate(newAar, newUge);
  };

  const handleNext = () => {
    const { aar: newAar, uge: newUge } = navigateWeek(aar, uge, 'next');
    onNavigate(newAar, newUge);
  };

  return (
    <div className="flex items-center justify-between bg-white rounded-xl p-4 shadow-sm">
      <button
        onClick={handlePrev}
        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        aria-label="Forrige uge"
      >
        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <div className="text-center">
        <div className="text-lg font-semibold text-gray-900">
          Uge {uge}, {aar}
        </div>
        <div className="text-sm text-gray-500">
          {startDate} - {endDate}
        </div>
      </div>

      <button
        onClick={handleNext}
        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        aria-label="Næste uge"
      >
        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {onCopyWeek && (
        <button
          onClick={onCopyWeek}
          className="ml-2 p-2 hover:bg-gray-100 rounded-full transition-colors"
          aria-label="Kopiér uge"
          title="Kopiér uge"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </button>
      )}
    </div>
  );
}
