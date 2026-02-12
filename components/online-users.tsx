"use client";

import { Crown, Shield, User } from "lucide-react";
import { useEffect, useState } from "react";

interface OnlineUser {
  id: string;
  name: string | null;
  firstName: string | null;
  lastName: string | null;
  image: string | null;
  staticId: string | null;
  role: "MEMBER" | "MODERATOR" | "ADMIN";
}

export function OnlineUsers() {
  const [users, setUsers] = useState<OnlineUser[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOnlineUsers = async () => {
    try {
      const res = await fetch("/api/users/online");
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (error) {
      console.error("Failed to fetch online users", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOnlineUsers();
    const interval = setInterval(fetchOnlineUsers, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="text-gray-500 text-sm animate-pulse">Loading online users...</div>;
  }

  if (users.length === 0) {
    return <div className="text-gray-500 text-sm">No one is online.</div>;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
          Online — {users.length}
        </h3>
      </div>
      
      <div className="space-y-2">
        {users.map((user) => (
          <div key={user.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors group">
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center overflow-hidden border border-white/5">
                {user.image ? (
                  <img src={user.image} alt={user.name || "User"} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-4 h-4 text-gray-400" />
                )}
              </div>
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-[#09090b] rounded-full"></div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm text-gray-200 truncate">
                  {user.firstName && user.lastName 
                    ? `${user.firstName} ${user.lastName}` 
                    : user.name || "Unknown"}
                </span>
                {user.role === "ADMIN" && <Crown className="w-3 h-3 text-yellow-500 fill-yellow-500/20" />}
                {user.role === "MODERATOR" && <Shield className="w-3 h-3 text-blue-500 fill-blue-500/20" />}
              </div>
              {user.staticId && (
                <div className="text-xs text-gray-500">#{user.staticId}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
