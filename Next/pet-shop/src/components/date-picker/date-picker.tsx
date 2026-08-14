'use client';

import { ChevronLeft, ChevronRight, Calendar, ChevronDown } from 'lucide-react';
import { Button } from '../ui/button';
import { Popover } from '../ui/popover';
import { PopoverTrigger } from '@radix-ui/react-popover';
import { usePathname, useSearchParams, useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { addDays, format, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function DatePicker() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const dateParam = searchParams.get('date');

  const date = useMemo<Date | undefined>(() => {
    if (!dateParam) return undefined;

    const [year, month, day] = dateParam.split('-').map(Number);
    const parsedDate = new Date(year, month - 1, day);

    return isValid(parsedDate) ? parsedDate : new Date();
  }, [dateParam]);

  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const updateURLWithDate = (selectedDate: Date | undefined) => {
    if (!selectedDate) return;

    const newParams = new URLSearchParams(searchParams.toString());
    newParams.set('date', format(selectedDate, 'yyyy-MM-dd'));

    router.push(`${pathname}?${newParams.toString()}`);
  };

  const handleNavigateDay = (days: number) => {
    const newDate = addDays(date || new Date(), days);
    updateURLWithDate(newDate);
  };

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" onClick={() => handleNavigateDay(-1)}>
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-min-45 justify-between text-left font-normal bg-transparent border-border-primary text-content-primary hover:bg-background-tertiary hover:border-border-secondary hover:text-content-primary focus-visible:ring-offset-0 focus-visible:ring-1 focus-visible:ring-border-brand focus:border-border-brand focus-visible:border-border-brand"
          >
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-content-brand" />
              {date ? (
                format(date, 'PPP', { locale: ptBR })
              ) : (
                <span>Selecione uma data</span>
              )}
            </div>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
      </Popover>

      <Button variant="outline" onClick={() => handleNavigateDay(1)}>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
