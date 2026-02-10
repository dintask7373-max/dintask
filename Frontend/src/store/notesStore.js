import { create } from 'zustand';
import apiRequest from '@/lib/api';

const useNotesStore = create((set, get) => ({
    notes: [],
    loading: false,
    error: null,

    fetchNotes: async () => {
        set({ loading: true, error: null });
        try {
            const response = await apiRequest('/notes');
            if (response.success) {
                set({ notes: response.data, loading: false });
            }
        } catch (error) {
            set({ error: error.message, loading: false });
        }
    },

    addNote: async (note) => {
        set({ loading: true });
        try {
            const response = await apiRequest('/notes', {
                method: 'POST',
                body: note
            });
            if (response.success) {
                set((state) => ({
                    notes: [response.data, ...state.notes],
                    loading: false
                }));
            }
        } catch (error) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    updateNote: async (id, updatedData) => {
        set({ loading: true });
        try {
            const response = await apiRequest(`/notes/${id}`, {
                method: 'PUT',
                body: updatedData
            });
            if (response.success) {
                set((state) => ({
                    notes: state.notes.map((note) =>
                        (note._id === id || note.id === id) ? response.data : note
                    ),
                    loading: false
                }));
            }
        } catch (error) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    deleteNote: async (id) => {
        set({ loading: true });
        try {
            const response = await apiRequest(`/notes/${id}`, {
                method: 'DELETE'
            });
            if (response.success) {
                set((state) => ({
                    notes: state.notes.filter((note) => (note._id !== id && note.id !== id)),
                    loading: false
                }));
            }
        } catch (error) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    togglePin: async (id) => {
        const note = get().notes.find(n => n._id === id || n.id === id);
        if (!note) return;

        await get().updateNote(id, { isPinned: !note.isPinned });
        // After toggle pin, re-fetch or re-sort
        get().fetchNotes();
    }
}));

export default useNotesStore;
