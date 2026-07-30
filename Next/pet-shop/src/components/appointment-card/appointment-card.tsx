import { cn } from '@/lib/utils';
import { Appointment } from '@/types/appointments';

type AppointmentCardProps = {
  appointment: Appointment;
  isFirstInSection?: boolean;
};

export function AppointmentCard({
  appointment,
  isFirstInSection,
}: AppointmentCardProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-2 md:grid-cols-[15%_35%_30%_20%] items-center py-3',
        !isFirstInSection && 'border-t border-border-divisor'
      )}
    >
      <div className="text-left pr-4 md:pr-0">
        <span className="text-label-small-size text-content-primary font-semibold">
          {appointment.time}
        </span>
      </div>

      <div className="text-right md:text-left mf:pr-4">
        <div className="flex items-center justify-end md:justify-start gap-1">
          <span className="text-label-small-size text-content-primary font-semibold">
            {appointment.petName}
          </span>
          <span className="text-paragraph-small-size text-content-secondary">
            /
          </span>
          <span className="text-paragraph-small-size text-content-secondary">
            {appointment.tutorName}
          </span>
        </div>

        <div className="text-left pr-4 md:mt-0 col-span-2 md:col-end-1 flex justify-end items-center gap-2">
          <span className="text-paragraph-small-size text-content-secondary">
            {appointment.description}
          </span>
        </div>
      </div>
    </div>
  );
}
