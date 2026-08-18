import { Dog } from 'lucide-react';
import Link from 'next/link';

export function Logo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-4 bg-[#2E2C30] w-fit p-3 rounded-br-lg"
    >
      <div className="w-8 h-8 bg-background-brand rounded flex items-center justify-center">
        <Dog className="" />
      </div>

      <span className="text-label-large-size font-bold text-content-brand uppercase">
        Mundo pet
      </span>
    </Link>
  );
}
