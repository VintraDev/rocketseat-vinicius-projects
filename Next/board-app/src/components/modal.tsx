'use client';

import * as Dialog from '@radix-ui/react-dialog';
import { useRouter } from 'next/navigation';
import { twMerge } from 'tailwind-merge';

interface ModalProps extends Dialog.DialogContentProps {}

export function Modal({ className, ...props }: ModalProps) {
  const router = useRouter();

  function handleOpenChange(open: boolean) {
    if (!open) {
      router.back();
    }
  }

  return (
    <Dialog.Root defaultOpen onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60" />
        <Dialog.Content
          className={twMerge(
            'fixed right-0 top-0 z-60 h-full w-full max-w-135 bg-navy-950 overflow-auto border-l border-navy-700',
            className
          )}
          {...props}
        />
      </Dialog.Portal>
    </Dialog.Root>
  );
}
