"use client"

import * as React from "react"
import { ChevronRight, File as FileIcon, Folder, FolderOpen } from "lucide-react"

import { cn } from "@/lib/utils"

export type TreeNode = { id: string; label: string; children?: TreeNode[] }

function TreeItem({
  node,
  depth,
  expanded,
  selected,
  onToggle,
  onSelect,
}: {
  node: TreeNode
  depth: number
  expanded: Set<string>
  selected: string | null
  onToggle: (id: string) => void
  onSelect: (id: string) => void
}) {
  const isBranch = !!node.children?.length
  const isOpen = expanded.has(node.id)
  return (
    <li role="treeitem" aria-expanded={isBranch ? isOpen : undefined} aria-selected={selected === node.id}>
      <button
        type="button"
        className={cn(
          "flex w-full items-center gap-1.5 rounded-md px-2 py-1 text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
          selected === node.id && "bg-accent text-accent-foreground"
        )}
        style={{ paddingLeft: 8 + depth * 16 }}
        onClick={() => {
          if (isBranch) onToggle(node.id)
          onSelect(node.id)
        }}
      >
        {isBranch ? (
          <ChevronRight className={cn("size-3.5 shrink-0 transition-transform", isOpen && "rotate-90")} />
        ) : (
          <span className="w-3.5" />
        )}
        {isBranch ? (
          isOpen ? (
            <FolderOpen className="size-4 shrink-0 text-muted-foreground" />
          ) : (
            <Folder className="size-4 shrink-0 text-muted-foreground" />
          )
        ) : (
          <FileIcon className="size-4 shrink-0 text-muted-foreground" />
        )}
        <span className="truncate">{node.label}</span>
      </button>
      {isBranch && isOpen && (
        <ul role="group">
          {node.children!.map((child) => (
            <TreeItem
              key={child.id}
              node={child}
              depth={depth + 1}
              expanded={expanded}
              selected={selected}
              onToggle={onToggle}
              onSelect={onSelect}
            />
          ))}
        </ul>
      )}
    </li>
  )
}

export function TreeView({
  data,
  defaultExpanded = [],
  onSelect,
  className,
}: {
  data: TreeNode[]
  defaultExpanded?: string[]
  onSelect?: (id: string) => void
  className?: string
}) {
  const [expanded, setExpanded] = React.useState(new Set(defaultExpanded))
  const [selected, setSelected] = React.useState<string | null>(null)

  return (
    <ul role="tree" className={cn("w-64 select-none", className)}>
      {data.map((node) => (
        <TreeItem
          key={node.id}
          node={node}
          depth={0}
          expanded={expanded}
          selected={selected}
          onToggle={(id) =>
            setExpanded((prev) => {
              const next = new Set(prev)
              if (next.has(id)) next.delete(id)
              else next.add(id)
              return next
            })
          }
          onSelect={(id) => {
            setSelected(id)
            onSelect?.(id)
          }}
        />
      ))}
    </ul>
  )
}
