"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import type { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export function DateRangePicker({
  value,
  defaultValue,
  onValueChange,
  placeholder = "Pick a date range",
  numberOfMonths = 2,
  className,
  disabled,
}: {
  value?: DateRange
  defaultValue?: DateRange
  onValueChange?: (range: DateRange | undefined) => void
  placeholder?: string
  numberOfMonths?: number
  className?: string
  disabled?: boolean
}) {
  const [internal, setInternal] = React.useState<DateRange | undefined>(defaultValue)
  const range = value ?? internal

  const label = range?.from
    ? range.to
      ? `${format(range.from, "LLL d, y")} – ${format(range.to, "LLL d, y")}`
      : format(range.from, "LLL d, y")
    : placeholder

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className={cn("w-72 justify-start font-normal", !range?.from && "text-muted-foreground", className)}
        >
          <CalendarIcon className="opacity-60" />
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          defaultMonth={range?.from}
          selected={range}
          numberOfMonths={numberOfMonths}
          onSelect={(next) => {
            setInternal(next)
            onValueChange?.(next)
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
