"use client"

import { useDraggable } from "@dnd-kit/core"
import { CSS } from "@dnd-kit/utilities"
import type { Task } from "@/types/task"
import { TaskCard } from "./task-card"

interface DraggableTaskCardProps {
  task: Task
  onEdit: () => void
  onDelete: () => void
}

export function DraggableTaskCard({ task, onEdit, onDelete }: DraggableTaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id.toString(),
    data: {
      task,
      status: task.status,
    },
  })

  const style = transform
    ? {
        transform: CSS.Translate.toString(transform),
        zIndex: isDragging ? 999 : undefined,
      }
    : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`${isDragging ? "opacity-50" : "opacity-100"} touch-manipulation transition-opacity duration-200`}
    >
      <TaskCard
        task={task}
        onEdit={(e) => {
          e?.stopPropagation()
          onEdit()
        }}
        onDelete={(e) => {
          e?.stopPropagation()
          onDelete()
        }}
      />
    </div>
  )
}
