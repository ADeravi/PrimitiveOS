"use client"

import * as React from "react"
import { Eye, EyeOff } from "lucide-react"

import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

function strengthOf(pw: string) {
  let score = 0
  if (pw.length >= 8) score++
  if (pw.length >= 12) score++
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score++
  if (/\d/.test(pw) && /[^a-zA-Z0-9]/.test(pw)) score++
  return score // 0..4
}

const LABELS = ["Too short", "Weak", "Fair", "Good", "Strong"]
const COLORS = [
  "var(--destructive)",
  "var(--destructive)",
  "var(--warning)",
  "var(--info)",
  "var(--success)",
]

export function PasswordInput({
  showStrength,
  className,
  onChange,
  ...props
}: React.ComponentProps<typeof Input> & { showStrength?: boolean }) {
  const [visible, setVisible] = React.useState(false)
  const [pw, setPw] = React.useState(String(props.defaultValue ?? ""))
  const score = strengthOf(typeof props.value === "string" ? props.value : pw)

  return (
    <div className="w-full space-y-1.5">
      <div className="relative">
        <Input
          {...props}
          type={visible ? "text" : "password"}
          className={cn("pr-9", className)}
          onChange={(e) => {
            setPw(e.target.value)
            onChange?.(e)
          }}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label={visible ? "Hide password" : "Show password"}
          className="absolute right-0 top-0 h-full w-9 text-muted-foreground hover:bg-transparent"
          onClick={() => setVisible((v) => !v)}
        >
          {visible ? <EyeOff /> : <Eye />}
        </Button>
      </div>
      {showStrength && (
        <div className="space-y-1">
          <div className="flex gap-1">
            {[1, 2, 3, 4].map((seg) => (
              <div
                key={seg}
                className="h-1 flex-1 rounded-full bg-muted"
                style={seg <= score ? { background: COLORS[score] } : undefined}
              />
            ))}
          </div>
          <p className="text-xs text-muted-foreground">{LABELS[score]}</p>
        </div>
      )}
    </div>
  )
}
