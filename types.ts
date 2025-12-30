export enum View {
  DASHBOARD = 'DASHBOARD',
  VAULT = 'VAULT',
  TASKS = 'TASKS',
}

export interface PasswordEntry {
  id: string;
  site: string;
  username: string;
  password: string; // In a real app, this would be encrypted
  updatedAt: number;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  createdAt: number;
}

export interface DashboardStats {
  totalPasswords: number;
  pendingTasks: number;
  completedTasks: number;
  systemHealth: number; // 0-100
}

export enum LoadingState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}