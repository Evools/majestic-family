"use client";

import { SessionProvider } from "next-auth/react";

import { HeartbeatProvider } from "@/components/heartbeat-provider";
import { NotificationProvider } from "@/components/ui/notifications/notification-context";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <NotificationProvider>
        <HeartbeatProvider />
        {children}
      </NotificationProvider>
    </SessionProvider>
  );
}
