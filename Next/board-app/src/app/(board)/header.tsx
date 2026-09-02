import { Input } from '@/components/input';
import { LogInIcon, SearchIcon } from 'lucide-react';

export function Header() {
  return (
    <div className="max-w-225 mx-auto w-full flex items-center justify-between">
      <div className="space-y-1">
        <h1 className="font-semibold text-xl">Product Roadmap</h1>
        <p className="text-sm text-navy-100">
          Follow the development of our entire platform
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <SearchIcon className="absolute size-4 text-navy-200 left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />

          <Input
            type="text"
            placeholder="Search for features..."
            className="w-67.5 pl-8"
          />
        </div>

        <button
          type="button"
          className="size-8 rounded-full border border-navy-500 flex items-center justify-center hover:bg-navy-600 transition-colors duration-150 cursor-pointer"
        >
          <LogInIcon className="size-3.5 text-navy-200" />
        </button>
      </div>
    </div>
  );
}
