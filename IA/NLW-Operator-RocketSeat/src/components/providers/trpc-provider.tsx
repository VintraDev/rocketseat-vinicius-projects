"use client";

import { TRPCReactProvider } from "@/trpc/client";

export function AppProviders(props: { children: React.ReactNode }) {
  return <TRPCReactProvider>{props.children}</TRPCReactProvider>;
}
