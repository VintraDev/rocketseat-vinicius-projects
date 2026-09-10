'use client';

import { authClient } from '@/lib/auth-client';
import { Loader2Icon, LogInIcon } from 'lucide-react';

export function UserButton() {
  const { data: session, isPending } = authClient.useSession();

  async function handleSignIn() {
    authClient.signIn.social({ provider: 'github', callbackURL: '/' });
  }

  async function handleSignOut() {
    await authClient.signOut();
  }

  return (
    <>
      {isPending ? (
        <div className="size-8 rounded-full border border-navy-500 flex items-center">
          <Loader2Icon className="size-3.5 text-navy-200 animate-spin" />
        </div>
      ) : session?.user ? (
        <div>
          <button
            type="button"
            onClick={handleSignOut}
            className="size-8 rounded-full border border-navy-500 flex items-center justify-center hover:bg-navy-600 transition-colors duration-150 cursor-pointer"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={session.user.image ?? ''}
              alt={session.user.name}
              className="size-8 rounded-full"
            />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleSignIn}
          className="size-8 rounded-full border border-navy-500 flex items-center justify-center hover:bg-navy-600 transition-colors duration-150 cursor-pointer"
        >
          <LogInIcon className="size-3.5 text-navy-200" />
        </button>
      )}
    </>
  );
}
