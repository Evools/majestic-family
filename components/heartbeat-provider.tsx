"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";

export function HeartbeatProvider() {
  const { data: session } = useSession();

  useEffect(() => {
    if (!session?.user) return;

    const interval = setInterval(() => {
      fetch("/api/user/heartbeat", { method: "POST" });
    }, 60 * 1000); // Every minute

    // Initial beat
    fetch("/api/user/heartbeat", { method: "POST" });

    return () => clearInterval(interval);
  }, [session]);

  return null;
}
