"use client"

import type React from "react"

import { type Task, TaskStatus } from "@/types/task"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit, Trash2 } from "lucide-react"
import { formatDate } from "@/lib/utils"

interface TaskCardProps {
  task: Task
  onEdit: (e?: React.MouseEvent) => void
  onDelete: (e?: React.MouseEvent) => void
}

export function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  const getStatusBadgeClass = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.PENDING:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case TaskStatus.COMPLETED:
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      default:
        return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300"
    }
  }

  const getStatusLabel = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.PENDING:
        return "Pendente"
      case TaskStatus.COMPLETED:
        return "Concluído"
      default:
        return status
    }
  }

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onEdit(e)
  }

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete(e)
  }

  return (
    <Card className="cursor-grab active:cursor-grabbing">
      <CardContent className="p-4">
        <div className="space-y-2">
          <div className="flex justify-between items-start">
            <h4 className="font-medium">{task.title}</h4>
            <span className={`text-xs px-2 py-1 rounded-full ${getStatusBadgeClass(task.status)}`}>
              {getStatusLabel(task.status)}
            </span>
          </div>

          {task.description && <p className="text-sm text-slate-600 dark:text-slate-400">{task.description}</p>}

          {task.created_at && (
            <p className="text-xs text-slate-500 dark:text-slate-500">Criado em: {formatDate(task.created_at)}</p>
          )}

          {task.completed_at && task.status === TaskStatus.COMPLETED && (
            <p className="text-xs text-slate-500 dark:text-slate-500">Concluído em: {formatDate(task.completed_at)}</p>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-2 pt-0 flex justify-end gap-2">
        <Button variant="ghost" size="icon" onClick={handleEditClick} className="cursor-pointer" data-no-dnd="true">
          <Edit className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={handleDeleteClick} className="cursor-pointer" data-no-dnd="true">
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}
