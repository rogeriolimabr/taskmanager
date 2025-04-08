"use client"

import { useDroppable } from "@dnd-kit/core"
import type { Task, TaskStatus } from "@/types/task"
import { DraggableTaskCard } from "./draggable-task-card"

interface TaskColumnProps {
  title: string
  status: TaskStatus
  tasks: Task[]
  onEditTask: (task: Task) => void
  onDeleteTask: (taskId: number) => void
}

export function TaskColumn({ title, status, tasks, onEditTask, onDeleteTask }: TaskColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
  })

  return (
    <div
      ref={setNodeRef}
      className={`bg-slate-100 dark:bg-slate-800 rounded-lg p-4 min-h-[400px] transition-all duration-200 ${
        isOver ? "ring-2 ring-primary bg-slate-200 dark:bg-slate-700" : ""
      }`}
    >
      <h3 className="font-medium text-lg mb-4">
        {title} ({tasks.length})
      </h3>

      <div className="space-y-3">
        {tasks.length === 0 ? (
          <div className="flex items-center justify-center h-32 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg">
            <p className="text-slate-500 dark:text-slate-400 text-center py-4">Arraste tarefas para esta coluna</p>
          </div>
        ) : (
          tasks.map((task) => (
            <DraggableTaskCard
              key={task.id}
              task={task}
              onEdit={() => onEditTask(task)}
              onDelete={() => onDeleteTask(task.id)}
            />
          ))
        )}
      </div>
    </div>
  )
}
