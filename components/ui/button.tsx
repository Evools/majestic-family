import { cn } from "@/lib/utils"
import * as React from "react"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "secondary" | "link" | "destructive"
  size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-lg font-medium transition-all focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50 active:scale-95 uppercase tracking-wide text-xs",
          {
            "bg-[#e81c5a] text-white hover:bg-[#c21548]": variant === "default",
            "border border-white/10 bg-black/20 hover:bg-white/5 hover:text-white hover:border-white/20 backdrop-blur-sm": variant === "outline",
            "hover:bg-white/5 hover:text-white text-gray-400": variant === "ghost",
            "bg-white/5 text-white hover:bg-white/10 border border-transparent": variant === "secondary",
            "text-[#e81c5a] hover:underline": variant === "link",
            "bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20": variant === "destructive",
            "h-10 px-5": size === "default",
            "h-8 px-3": size === "sm",
            "h-12 px-8 text-sm": size === "lg",
            "h-10 w-10": size === "icon",
          },
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
