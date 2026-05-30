import { create } from 'zustand';
import * as tasksApi from '../api/tasks';

export const useTaskStore = create((set, get) => ({
  tasks:     [],
  isLoading: false,
  error:     null,

  /** Fetch all tasks for the current user */
  fetchTasks: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await tasksApi.getTasks();
      set({ tasks: res.data.data, isLoading: false });
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to load tasks.';
      set({ error: msg, isLoading: false });
    }
  },

  /** Create a new task; optimistically append on success */
  addTask: async (data) => {
    const res = await tasksApi.createTask(data);
    const newTask = res.data.data;
    set((s) => ({ tasks: [newTask, ...s.tasks] }));
    return newTask;
  },

  /** Update an existing task */
  editTask: async (id, data) => {
    const res = await tasksApi.updateTask(id, data);
    const updated = res.data.data;
    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === id ? updated : t)),
    }));
    return updated;
  },

  /** Delete a task */
  removeTask: async (id) => {
    await tasksApi.deleteTask(id);
    set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) }));
  },

  /** Clear error */
  clearError: () => set({ error: null }),
}));
