"use client";

import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

interface SignOutButtonProps {
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
    className?: string;
}

export function SignOutButton({ variant = "outline", className }: SignOutButtonProps) {
    return (
        <Button 
            variant={variant}
            onClick={() => signOut({ callbackUrl: "/login" })}
            className={className || "w-full border-[#1f1f1f] bg-transparent text-gray-400 hover:text-white hover:bg-white/5"}
        >
            <LogOut className="w-4 h-4 mr-2" />
            Выйти
        </Button>
    );
}
