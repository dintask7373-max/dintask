import { create } from 'zustand';
import api from '@/lib/api';
import { toast } from 'sonner';

const useTaskStore = create((set, get) => ({
    tasks: [],
    loading: false,
    error: null,

    // Fetch Tasks
    fetchTasks: async () => {
        set({ loading: true });
        try {
            const res = await api('/tasks');
            if (res.success) {
                // Normalize tasks: add id field to match _id
                const normalizedTasks = res.data.map(task => ({
                    ...task,
                    id: task._id || task.id
                }));
                set({ tasks: normalizedTasks, loading: false });
            }
        } catch (error) {
            set({ error: error.message, loading: false });
            console.error("Failed to fetch tasks", error);
        }
    },

    // Add Task
    addTask: async (taskData) => {
        try {
            const res = await api('/tasks', {
                method: 'POST',
                body: taskData
            });
            if (res.success) {
                const normalizedTask = {
                    ...res.data,
                    id: res.data._id || res.data.id
                };
                set((state) => ({
                    tasks: [normalizedTask, ...state.tasks]
                }));
                return normalizedTask;
            }
        } catch (error) {
            toast.error(error.message || "Failed to add task");
            throw error;
        }
    },

    // Update Task
    updateTask: async (taskId, updatedData) => {
        try {
            // Optimistic Update
            set((state) => ({
                tasks: state.tasks.map((task) =>
                    task._id === taskId ? { ...task, ...updatedData } : task
                ),
            }));

            const res = await api(`/tasks/${taskId}`, {
                method: 'PUT',
                body: updatedData
            });

            if (!res.success) {
                toast.error("Failed to update task");
                get().fetchTasks(); // Revert
            }

        } catch (error) {
            toast.error("Failed to update task");
            get().fetchTasks(); // Revert
        }
    },

    // Delete Task
    deleteTask: async (taskId) => {
        try {
            const res = await api(`/tasks/${taskId}`, {
                method: 'DELETE'
            });
            if (res.success) {
                set((state) => ({
                    tasks: state.tasks.filter((task) => task._id !== taskId),
                }));
                toast.success("Task deleted");
            }
        } catch (error) {
            toast.error("Failed to delete task");
        }
    }
}));

export default useTaskStore;
