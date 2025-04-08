import type { Task, TaskStatus } from "@/types/task"
import type { User } from "@/types/user"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

const getAuthHeaders = () => {
  const token = localStorage.getItem("token")
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

export const api = {
  async login(email: string, password: string) {
    const response = await fetch(`${API_URL}/api/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      throw new Error("Login failed")
    }

    return response.json()
  },

  async register(userData: { name: string; email: string; password: string }) {
    const response = await fetch(`${API_URL}/api/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    })

    if (!response.ok) {
      throw new Error("Registration failed")
    }

    return response.json()
  },

  async getCurrentUser(): Promise<User> {
    const response = await fetch(`${API_URL}/api/me`, {
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Failed to get user data")
    }

    return response.json()
  },

  async getTasks(): Promise<Task[]> {
    const response = await fetch(`${API_URL}/api/tasks`, {
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Failed to fetch tasks")
    }

    return response.json()
  },

  async createTask(taskData: { title: string; description: string; status: TaskStatus }): Promise<Task> {
    const response = await fetch(`${API_URL}/api/tasks/`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(taskData),
    })

    if (!response.ok) {
      throw new Error("Failed to create task")
    }

    return response.json()
  },

  async updateTask(taskId: number, taskData: Partial<Task>): Promise<Task> {
    const response = await fetch(`${API_URL}/api/tasks/${taskId}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(taskData),
    })

    if (!response.ok) {
      throw new Error("Failed to update task")
    }

    return response.json()
  },

  async deleteTask(taskId: number): Promise<Task> {
    const response = await fetch(`${API_URL}/api/tasks/${taskId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    })

    if (!response.ok) {
      throw new Error("Failed to delete task")
    }

    return response.json()
  },
}
