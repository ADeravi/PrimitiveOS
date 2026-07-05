"use client"

import * as React from "react"
import { File as FileIcon, Upload, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const fmtSize = (b: number) =>
  b > 1024 * 1024 ? `${(b / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(b / 1024))} KB`

export function Dropzone({
  onFilesChange,
  accept,
  multiple = true,
  className,
}: {
  onFilesChange?: (files: File[]) => void
  accept?: string
  multiple?: boolean
  className?: string
}) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const [files, setFiles] = React.useState<File[]>([])
  const [over, setOver] = React.useState(false)

  const commit = (next: File[]) => {
    setFiles(next)
    onFilesChange?.(next)
  }

  const addFiles = (list: FileList | null) => {
    if (!list) return
    commit(multiple ? [...files, ...Array.from(list)] : Array.from(list).slice(0, 1))
  }

  return (
    <div className={cn("w-full space-y-2", className)}>
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload files"
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border p-8 text-center transition-colors",
          over ? "border-ring bg-accent" : "hover:bg-muted/50"
        )}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault()
          setOver(true)
        }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setOver(false)
          addFiles(e.dataTransfer.files)
        }}
      >
        <Upload className="size-6 text-muted-foreground" />
        <p className="text-sm font-medium text-foreground">
          Drop files here or <span className="text-primary underline underline-offset-4">browse</span>
        </p>
        <p className="text-xs text-muted-foreground">
          {accept ? `Accepts ${accept}` : "Any file type"}{multiple ? " · multiple allowed" : ""}
        </p>
        <input
          ref={inputRef}
          type="file"
          className="sr-only"
          accept={accept}
          multiple={multiple}
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>
      {files.length > 0 && (
        <ul className="space-y-1">
          {files.map((f, i) => (
            <li
              key={`${f.name}-${i}`}
              className="flex items-center gap-2 rounded-md border border-border px-2.5 py-1.5 text-sm"
            >
              <FileIcon className="size-4 text-muted-foreground" />
              <span className="flex-1 truncate">{f.name}</span>
              <span className="text-xs text-muted-foreground">{fmtSize(f.size)}</span>
              <Button
                variant="ghost"
                size="icon"
                className="size-6"
                aria-label={`Remove ${f.name}`}
                onClick={() => commit(files.filter((_, j) => j !== i))}
              >
                <X className="size-3.5" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
