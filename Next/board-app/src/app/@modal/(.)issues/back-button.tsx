'use client';

import { MoveLeftIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function BackButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.back()}
      className="flex items-centergap-2 text-navy-200 hover:text-navy-100 cursor-pointer"
    >
      <MoveLeftIcon className="size-4" />
      <span className="text-xs">Back to board</span>
    </button>
  );
}
