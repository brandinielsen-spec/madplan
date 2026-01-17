import { getISOWeek, getYear, startOfISOWeek, addWeeks, subWeeks, format } from 'date-fns';
import { da } from 'date-fns/locale';

export function getCurrentWeek(): { aar: number; uge: number } {
  const now = new Date();
  return {
    aar: getYear(now),
    uge: getISOWeek(now),
  };
}

export function getWeekDates(aar: number, uge: number): Date[] {
  const firstDayOfYear = new Date(aar, 0, 4);
  const firstWeek = startOfISOWeek(firstDayOfYear);
  const targetWeek = addWeeks(firstWeek, uge - 1);

  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(targetWeek);
    date.setDate(targetWeek.getDate() + i);
    return date;
  });
}

export function formatDate(date: Date): string {
  return format(date, 'd. MMM', { locale: da });
}

export function navigateWeek(aar: number, uge: number, direction: 'prev' | 'next'): { aar: number; uge: number } {
  const firstDayOfYear = new Date(aar, 0, 4);
  const firstWeek = startOfISOWeek(firstDayOfYear);
  const currentWeekStart = addWeeks(firstWeek, uge - 1);

  const newWeekStart = direction === 'next'
    ? addWeeks(currentWeekStart, 1)
    : subWeeks(currentWeekStart, 1);

  return {
    aar: getYear(newWeekStart),
    uge: getISOWeek(newWeekStart),
  };
}

export function createEmptyUgeplan(ejerId: string, aar: number, uge: number): Omit<import('./types').Ugeplan, 'id'> {
  const emptyDay = { ret: null, opskriftId: null };
  return {
    ejerId,
    aar,
    uge,
    dage: {
      mandag: { ...emptyDay },
      tirsdag: { ...emptyDay },
      onsdag: { ...emptyDay },
      torsdag: { ...emptyDay },
      fredag: { ...emptyDay },
      loerdag: { ...emptyDay },
      soendag: { ...emptyDay },
    },
  };
}
