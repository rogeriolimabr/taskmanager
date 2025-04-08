export enum TaskStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED"
}

export interface Task {
  id: number
  title: string
  description?: string
  status: TaskStatus
  created_at: string
  completed_at?: string
  owner_id: number
}
