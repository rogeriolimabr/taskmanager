"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { KanbanBoard } from "@/components/dashboard/kanban-board"
import { TaskForm } from "@/components/dashboard/task-form"
import { api } from "@/lib/api"
import { type Task, TaskStatus } from "@/types/task"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

export default function DashboardPage() {
    const [tasks, setTasks] = useState<Task[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isTaskFormOpen, setIsTaskFormOpen] = useState(false)
    const [editingTask, setEditingTask] = useState<Task | null>(null)
    const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!isAuthLoading && !isAuthenticated) {
            router.push("/login")
        } else if (isAuthenticated) {
            fetchTasks()
        }
    }, [isAuthenticated, isAuthLoading, router])

    const fetchTasks = async () => {
        try {
            const data = await api.getTasks()
            setTasks(data)
        } catch {
            toast("Erro ao carregar tarefas",
                {
                    description: "Não foi possível carregar suas tarefas",
                })
        } finally {
            setIsLoading(false)
        }
    }

    const handleCreateTask = async (taskData: { title: string; description: string }) => {
        try {
            const newTask = await api.createTask({
                ...taskData,
                status: TaskStatus.PENDING,
            })
            setTasks([...tasks, newTask])
            setIsTaskFormOpen(false)
            toast("Tarefa criada",
                {
                    description: "Sua tarefa foi criada com sucesso",
                })
        } catch {
            toast("Erro ao criar tarefa",
                {
                    description: "Não foi possível criar a tarefa",
                })
        }
    }

    const handleUpdateTask = async (taskId: number, taskData: Partial<Task>) => {
        try {
            const updatedTask = await api.updateTask(taskId, taskData)
            setTasks(tasks.map((task) => (task.id === taskId ? updatedTask : task)))
            setEditingTask(null)
            setIsTaskFormOpen(false)
            toast("Tarefa atualizada",
                {
                    description: "Sua tarefa foi atualizada com sucesso",
                })
        } catch {
            toast("Erro ao atualizar tarefa",
                {
                    description: "Não foi possível atualizar a tarefa",
                })
        }
    }

    const handleDeleteTask = async (taskId: number) => {
        try {
            await api.deleteTask(taskId)
            setTasks(tasks.filter((task) => task.id !== taskId))
            toast("Tarefa removida",
                {
                    description: "Sua tarefa foi removida com sucesso",
                })
        } catch {
            toast("Erro ao remover tarefa",
                {
                    description: "Não foi possível remover a tarefa",
                })
        }
    }

    const handleStatusChange = async (taskId: number, newStatus: TaskStatus) => {
        try {
            const taskToUpdate = tasks.find((task) => task.id === taskId)
            if (!taskToUpdate) return

            const updatedTask = await api.updateTask(taskId, { status: newStatus })
            setTasks(tasks.map((task) => (task.id === taskId ? updatedTask : task)))
        } catch {
            toast("Erro ao atualizar status",
                {
                    description: "Não foi possível atualizar o status da tarefa",
                })
        }
    }

    const openEditForm = (task: Task) => {
        setEditingTask(task)
        setIsTaskFormOpen(true)
    }

    if (isAuthLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
            <DashboardHeader
                user={user}
                onNewTask={() => {
                    setEditingTask(null)
                    setIsTaskFormOpen(true)
                }}
            />

            <main className="container mx-auto p-4 pt-8">
                {isLoading ? (
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                ) : (
                    <KanbanBoard
                        tasks={tasks}
                        onStatusChange={handleStatusChange}
                        onEditTask={openEditForm}
                        onDeleteTask={handleDeleteTask}
                    />
                )}
            </main>

            <TaskForm
                isOpen={isTaskFormOpen}
                onClose={() => {
                    setIsTaskFormOpen(false)
                    setEditingTask(null)
                }}
                onSubmit={editingTask ? (data) => handleUpdateTask(editingTask.id, data) : handleCreateTask}
                task={editingTask}
            />
        </div>
    )
}
