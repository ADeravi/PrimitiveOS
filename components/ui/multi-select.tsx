"use client"

import * as React from "react"
import { Check, ChevronsUpDown, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { ComboboxOption } from "@/components/ui/combobox"

export function MultiSelect({
  options,
  value,
  defaultValue,
  onValueChange,
  placeholder = "Select…",
  searchPlaceholder = "Search…",
  maxShown = 3,
  className,
  disabled,
}: {
  options: ComboboxOption[]
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (value: string[]) => void
  placeholder?: string
  searchPlaceholder?: string
  maxShown?: number
  className?: string
  disabled?: boolean
}) {
  const [open, setOpen] = React.useState(false)
  const [internal, setInternal] = React.useState<string[]>(defaultValue ?? [])
  const selected = value ?? internal

  const commit = (next: string[]) => {
    setInternal(next)
    onValueChange?.(next)
  }

  const toggle = (v: string) =>
    commit(selected.includes(v) ? selected.filter((s) => s !== v) : [...selected, v])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn("min-h-9 h-auto w-72 justify-between font-normal", className)}
        >
          <span className="flex flex-wrap items-center gap-1">
            {selected.length === 0 && <span className="text-muted-foreground">{placeholder}</span>}
            {selected.slice(0, maxShown).map((v) => (
              <Badge
                key={v}
                variant="secondary"
                className="gap-0.5"
                onClick={(e) => {
                  e.stopPropagation()
                  toggle(v)
                }}
              >
                {options.find((o) => o.value === v)?.label ?? v}
                <X className="size-3 opacity-60" />
              </Badge>
            ))}
            {selected.length > maxShown && (
              <Badge variant="outline">+{selected.length - maxShown}</Badge>
            )}
          </span>
          <ChevronsUpDown className="shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0">
        <Command>
          <CommandInput placeholder={searchPlaceholder} />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup>
              {options.map((o) => (
                <CommandItem key={o.value} value={o.value} disabled={o.disabled} onSelect={toggle}>
                  <Check
                    className={cn("size-4", selected.includes(o.value) ? "opacity-100" : "opacity-0")}
                  />
                  {o.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
