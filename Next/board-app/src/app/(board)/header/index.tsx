import { SearchInput } from './search-input';
import { UserButton } from './user-button';

export function Header() {
  return (
    <div className="max-w-225 mx-auto w-full flex items-center justify-between">
      <div className="space-y-1">
        <h1 className="font-semibold text-xl">Product Roadmap</h1>
        <p className="text-sm text-navy-100">
          Follow the development of our entire platform
        </p>
      </div>

      <SearchInput />
      <UserButton />
    </div>
  );
}
