import { ScheduleView } from '@/components/ScheduleView';
import { DateNavigation } from '@/components/DateNavigation';
import { format } from 'date-fns';

function normalizeDate(dateParam: string | null): string {
  if (!dateParam) {
    return format(new Date(), 'yyyy-MM-dd');
  }

  const lower = dateParam.toLowerCase();
  const today = new Date();

  switch (lower) {
    case 'today':
      return format(today, 'yyyy-MM-dd');
    case 'yesterday': {
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      return format(yesterday, 'yyyy-MM-dd');
    }
    case 'tomorrow': {
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return format(tomorrow, 'yyyy-MM-dd');
    }
    default:
      // Validate date format
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
        return dateParam;
      }
      return format(today, 'yyyy-MM-dd');
  }
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const params = await searchParams;
  const date = normalizeDate(params.date || null);

  return (
    <main className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">NBA Games</h1>
      
      <DateNavigation currentDate={date} />
      
      <ScheduleView date={date} />
    </main>
  );
}
