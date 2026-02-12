"use client";

import { SessionProvider } from "next-auth/react";

import { HeartbeatProvider } from "@/components/heartbeat-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <HeartbeatProvider />
      {children}
    </SessionProvider>
  );
}
