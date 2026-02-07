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
            const res = await api.get('/tasks');
            if (res.data.success) {
                // Normalize tasks: add id field to match _id
                const normalizedTasks = res.data.data.map(task => ({
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
            const res = await api.post('/tasks', taskData);
            if (res.data.success) {
                const normalizedTask = {
                    ...res.data.data,
                    id: res.data.data._id || res.data.data.id
                };
                set((state) => ({
                    tasks: [normalizedTask, ...state.tasks]
                }));
                // toast handled in component usually, but can be here too
                return normalizedTask;
            }
        } catch (error) {
            toast.error(error.response?.data?.error || "Failed to add task");
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

            const res = await api.put(`/tasks/${taskId}`, updatedData);

            // Revert if failed? For now assume success or toast error
            if (!res.data.success) {
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
            const res = await api.delete(`/tasks/${taskId}`);
            if (res.data.success) {
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
