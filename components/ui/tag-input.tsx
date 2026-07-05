"use client"

import * as React from "react"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

export function TagInput({
  value,
  defaultValue,
  onValueChange,
  placeholder = "Add a tag…",
  max,
  className,
  disabled,
}: {
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (value: string[]) => void
  placeholder?: string
  max?: number
  className?: string
  disabled?: boolean
}) {
  const [internal, setInternal] = React.useState<string[]>(defaultValue ?? [])
  const [draft, setDraft] = React.useState("")
  const tags = value ?? internal

  const commit = (next: string[]) => {
    setInternal(next)
    onValueChange?.(next)
  }

  const add = () => {
    const t = draft.trim()
    if (!t || tags.includes(t) || (max != null && tags.length >= max)) return
    commit([...tags, t])
    setDraft("")
  }

  const remove = (t: string) => commit(tags.filter((x) => x !== t))

  return (
    <div
      className={cn(
        "flex min-h-9 w-72 flex-wrap items-center gap-1 rounded-md border border-input bg-transparent px-2 py-1.5 text-sm shadow-xs transition-[color,box-shadow] focus-within:border-ring focus-within:ring-[length:var(--state-focus-ring-width,3px)] focus-within:ring-ring/50",
        disabled && "pointer-events-none opacity-50",
        className
      )}
    >
      {tags.map((t) => (
        <Badge key={t} variant="secondary" className="gap-0.5">
          {t}
          <button
            type="button"
            aria-label={`Remove ${t}`}
            className="rounded-full opacity-60 hover:opacity-100"
            onClick={() => remove(t)}
          >
            <X className="size-3" />
          </button>
        </Badge>
      ))}
      <input
        className="min-w-20 flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
        value={draft}
        disabled={disabled}
        placeholder={tags.length === 0 ? placeholder : ""}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault()
            add()
          } else if (e.key === "Backspace" && draft === "" && tags.length > 0) {
            remove(tags[tags.length - 1])
          }
        }}
        onBlur={add}
      />
    </div>
  )
}
