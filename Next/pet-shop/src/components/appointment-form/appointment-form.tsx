'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '../ui/button';

export function AppointmentForm() {
  return (
    <Dialog>
      <DialogTrigger
        render={<Button variant="brand">Novo Agendamento</Button>}
      />

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agende um atendimento</DialogTitle>
          <DialogDescription>
            Preencha os dados do cliente para realizar o agendamento:
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
