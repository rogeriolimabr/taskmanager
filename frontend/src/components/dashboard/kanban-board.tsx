"use client"

import { useState } from "react"
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core"
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable"
import { type Task, TaskStatus } from "@/types/task"
import { TaskColumn } from "./task-column"
import { TaskCard } from "./task-card"

interface KanbanBoardProps {
  tasks: Task[]
  onStatusChange: (taskId: number, newStatus: TaskStatus) => void
  onEditTask: (task: Task) => void
  onDeleteTask: (taskId: number) => void
}

export function KanbanBoard({ tasks, onStatusChange, onEditTask, onDeleteTask }: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Reduzido para ser mais sensível
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id.toString())
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    setActiveId(null)

    if (!over) return

    // Se o container de destino for diferente do container atual
    if (over.id !== active.data.current?.status) {
      const taskId = Number(active.id)
      const newStatus = over.id as TaskStatus

      onStatusChange(taskId, newStatus)
    }
  }

  const getTasksByStatus = (status: TaskStatus) => {
    return tasks.filter((task) => task.status === status)
  }

  // Encontrar a tarefa ativa
  const activeTask = activeId ? tasks.find((task) => task.id.toString() === activeId) : null

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter} // Alterado para closestCenter para melhor detecção
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TaskColumn
          title="Pendentes"
          status={TaskStatus.PENDING}
          tasks={getTasksByStatus(TaskStatus.PENDING)}
          onEditTask={onEditTask}
          onDeleteTask={onDeleteTask}
        />

        <TaskColumn
          title="Concluídas"
          status={TaskStatus.COMPLETED}
          tasks={getTasksByStatus(TaskStatus.COMPLETED)}
          onEditTask={onEditTask}
          onDeleteTask={onDeleteTask}
        />
      </div>

      <DragOverlay>
        {activeTask ? (
          <div className="w-full opacity-80">
            <TaskCard task={activeTask} onEdit={() => {}} onDelete={() => {}} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
