import { PeriodSection } from '@/components/period-section/period-section';
// import { prisma } from '@/lib/prisma';
import { APPOINTMENT_DATA, groupAppointmentByPeriod } from '@/utils';

export default async function Home() {
  // const appointment = await prisma.appointment.findMany();

  // console.log(appointment);
  const periods = groupAppointmentByPeriod(APPOINTMENT_DATA);

  return (
    <div className="bg-background-primary p-6">
      <div className="flex items-center justify-between md:mb-8">
        <div>
          <h1 className="text-title-size text-content-primary mb-2">
            Sua Agenda
          </h1>
          <p className="text-paragraph-medium-size text-content-secondary">
            Aqui você pode ver todos os clientes e serviços agendados para hoje.
          </p>
        </div>
      </div>

      <div className="pb-24 md:pb-0">
        {periods.map((period, index) => (
          <PeriodSection period={period} key={index} />
        ))}
      </div>
    </div>
  );
}
