import { cn } from "@/lib/utils"
import * as React from "react"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-xl border border-[#2e2e36] bg-[#1e1e24] px-4 py-2 text-sm ring-offset-[#121216] file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[#a1a1aa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e81c5a] disabled:cursor-not-allowed disabled:opacity-50 transition-all",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
