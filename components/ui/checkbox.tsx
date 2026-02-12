import { Check } from "lucide-react"
import * as React from "react"

import { cn } from "@/lib/utils"

export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, ...props }, ref) => {
    return (
      <label className="flex items-center gap-3 cursor-pointer group">
        <div className="relative">
          <input
            type="checkbox"
            className="sr-only peer"
            ref={ref}
            {...props}
          />
          <div className={cn(
            "w-5 h-5 rounded border-2 border-[#1f1f1f] bg-[#0f0f0f] transition-all",
            "peer-checked:bg-[#e81c5a] peer-checked:border-[#e81c5a]",
            "peer-focus-visible:ring-2 peer-focus-visible:ring-[#e81c5a]/50",
            "group-hover:border-[#e81c5a]/50",
            className
          )}>
            <Check className={cn(
              "w-3 h-3 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
              "opacity-0 peer-checked:opacity-100 transition-opacity"
            )} />
          </div>
        </div>
        {label && (
          <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
            {label}
          </span>
        )}
      </label>
    )
  }
)
Checkbox.displayName = "Checkbox"

export { Checkbox }
