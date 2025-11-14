'use client';

import { useRouter } from 'next/navigation';
import { format, addDays, subDays, isToday, isYesterday, isTomorrow } from 'date-fns';

interface DateNavigationProps {
  currentDate: string;
}

export function DateNavigation({ currentDate }: DateNavigationProps) {
  const router = useRouter();
  // Parse the date string properly to avoid timezone issues
  // Parse as YYYY-MM-DD in local timezone
  const [year, month, day] = currentDate.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  const navigateToDate = (newDate: Date) => {
    const dateStr = format(newDate, 'yyyy-MM-dd');
    router.push(`/?date=${dateStr}`);
  };

  const goToToday = () => navigateToDate(new Date());
  const goToYesterday = () => navigateToDate(subDays(date, 1));
  const goToTomorrow = () => navigateToDate(addDays(date, 1));

  const getDateLabel = (dateToLabel: Date): string => {
    if (isToday(dateToLabel)) return 'Today';
    if (isYesterday(dateToLabel)) return 'Yesterday';
    if (isTomorrow(dateToLabel)) return 'Tomorrow';
    return format(dateToLabel, 'MMM d');
  };

  return (
    <div className="flex items-center justify-between mb-6">
      <button
        onClick={goToYesterday}
        className="button-secondary text-sm"
      >
        ← {getDateLabel(subDays(date, 1))}
      </button>

      <button
        onClick={goToToday}
        className="button-primary text-sm"
      >
        {getDateLabel(date)}
      </button>

      <button
        onClick={goToTomorrow}
        className="button-secondary text-sm"
      >
        {getDateLabel(addDays(date, 1))} →
      </button>
    </div>
  );
}
