import { AppointmentPeriod } from '../../types/appointments';
import { Cloudy, Moon, Sun } from 'lucide-react';
import { AppointmentCard } from '../appointment-card';

type PeriodSectionProps = {
  period: AppointmentPeriod;
};

const periodIcons = {
  morning: <Sun className="text-accent-blue" />,
  afternoon: <Cloudy className="text-accent-orange" />,
  evening: <Moon className="text-accent-yellow" />,
};

export function PeriodSection({ period }: PeriodSectionProps) {
  return (
    <section className="mb-8 bg-background-tertiary rounded-xl">
      <div className="flex items-center px-5 py-3 justify-between border-b border-[#2E2C30]">
        <div className="flex items-center gap-2">
          {periodIcons[period.type]}
          <h2 className="text-label-large-size text-content-primary">
            {period.title}
          </h2>
        </div>
        <span className="text-label-large-size text-content-secondary">
          {period.timeRange}
        </span>
      </div>

      {period.appointments.length > 0 ? (
        <div className="px-5">
          <div>
            {period.appointments.map((appointments, index) => (
              <AppointmentCard
                key={index}
                appointment={appointments}
                isFirstInSection={index === 0}
              />
            ))}
          </div>
        </div>
      ) : (
        <p className="text-paragraph-small-size text-content-secondary p-5">
          Nenhum agendamento para este período
        </p>
      )}
    </section>
  );
}
