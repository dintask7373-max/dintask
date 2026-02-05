import React, { useState } from 'react';
import {
    Search,
    Plus,
    StickyNote,
    MoreVertical,
    Trash2,
    Edit2,
    Clock,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { format } from 'date-fns';

import { Card, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription
} from '@/shared/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";

import useNotesStore from '@/store/notesStore';
import { cn } from '@/shared/utils/cn';
import { fadeInUp, staggerContainer, scaleOnTap } from '@/shared/utils/animations';

const Notes = () => {
    const { notes, addNote, updateNote, deleteNote } = useNotesStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // State to track editing
    const [editingId, setEditingId] = useState(null);
    const [newNote, setNewNote] = useState({ title: '', content: '', category: 'General' });

    const [listRef] = useAutoAnimate();

    const filteredNotes = notes.filter(note =>
        note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.content.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSaveNote = () => {
        if (!newNote.title || !newNote.content) return;

        if (editingId) {
            // Update existing note
            updateNote(editingId, newNote);
        } else {
            // Create new note
            addNote(newNote);
        }

        // Reset state
        setNewNote({ title: '', content: '', category: 'General' });
        setEditingId(null);
        setIsAddModalOpen(false);
    };

    const handleEditClick = (note) => {
        setNewNote({
            title: note.title,
            content: note.content,
            category: note.category
        });
        setEditingId(note.id);
        setIsAddModalOpen(true);
    };

    const handleOpenAddModal = () => {
        setNewNote({ title: '', content: '', category: 'General' });
        setEditingId(null);
        setIsAddModalOpen(true);
    };

    const handleDeleteNote = (id) => {
        deleteNote(id);
    };

    return (
        <motion.div
            initial="initial"
            animate="animate"
            variants={staggerContainer}
            className="space-y-6"
        >
            <motion.div variants={fadeInUp} className="flex items-center justify-between px-1">
                <div className="space-y-1">
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">Notes</h2>
                    <p className="text-xs text-slate-500 font-medium">Quick thoughts and reminders</p>
                </div>
                <motion.div {...scaleOnTap}>
                    <Button
                        size="icon"
                        variant="ghost"
                        className="rounded-xl bg-slate-100 dark:bg-slate-800 focus:ring-0"
                        onClick={handleOpenAddModal}
                    >
                        <Plus size={20} className="text-primary-600" />
                    </Button>
                </motion.div>
            </motion.div>

            <motion.div variants={fadeInUp} className="relative">
                <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <Input
                    placeholder="Search your notes..."
                    className="pl-10 h-11 bg-white dark:bg-slate-900 border-none shadow-sm shadow-slate-200/50 dark:shadow-none rounded-2xl focus:ring-2 focus:ring-primary-500/20 transition-all font-medium text-xs"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </motion.div>

            <div ref={listRef} className="grid grid-cols-1 gap-4">
                {filteredNotes.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="h-64 flex flex-col items-center justify-center text-slate-400 text-center px-8 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl"
                    >
                        <StickyNote size={48} className="opacity-10 mb-4" />
                        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-300">No notes found</h3>
                        <p className="text-[11px] mt-1">Try searching for something else or create a new note.</p>
                    </motion.div>
                ) : (
                    filteredNotes.map((note, index) => (
                        <motion.div
                            key={note.id}
                            variants={fadeInUp}
                            custom={index}
                        >
                            <Card className="border-none shadow-sm shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-2xl overflow-hidden group hover:shadow-md transition-all">
                                <CardContent className="p-4">
                                    <div className="flex justify-between items-start mb-2">
                                        <Badge variant="secondary" className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/10 group-hover:text-primary-600 transition-colors">
                                            {note.category}
                                        </Badge>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg">
                                                    <MoreVertical size={14} className="text-slate-400" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="rounded-xl border-slate-100 dark:border-slate-800">
                                                <DropdownMenuItem
                                                    className="gap-2 text-xs font-medium rounded-lg cursor-pointer"
                                                    onClick={() => handleEditClick(note)}
                                                >
                                                    <Edit2 size={14} /> Edit Note
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="gap-2 text-xs font-medium text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/10 rounded-lg cursor-pointer"
                                                    onClick={() => handleDeleteNote(note.id)}
                                                >
                                                    <Trash2 size={14} /> Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1 leading-tight">{note.title}</h4>
                                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mb-3">
                                        {note.content}
                                    </p>
                                    <div className="flex items-center gap-1 text-[9px] text-slate-400 font-medium italic">
                                        <Clock size={10} />
                                        {format(new Date(note.createdAt), 'MMM dd, p')}
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))
                )}
            </div>

            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogContent className="sm:max-w-[425px] rounded-3xl border-none shadow-2xl bg-white dark:bg-slate-900">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black">{editingId ? 'Edit Note' : 'New Note'}</DialogTitle>
                        <DialogDescription className="text-xs font-medium text-slate-500">
                            {editingId ? 'Modify your existing note below.' : 'Capture your thoughts or reminders instantly.'}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Title</label>
                            <Input
                                placeholder="Meeting Notes..."
                                className="rounded-xl border-slate-100 dark:border-slate-800 h-11 bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-primary-500/20 transition-all text-sm font-bold"
                                value={newNote.title}
                                onChange={(e) => setNewNote({ ...newNote, title: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                            <div className="flex flex-wrap gap-2">
                                {['Idea', 'Work', 'Code', 'Meetings', 'General'].map(cat => (
                                    <button
                                        key={cat}
                                        type="button"
                                        onClick={() => setNewNote({ ...newNote, category: cat })}
                                        className={cn(
                                            "px-4 py-2 rounded-xl text-[10px] font-bold transition-all border",
                                            newNote.category === cat
                                                ? "bg-primary-600 text-white border-primary-600 shadow-lg shadow-primary-500/20"
                                                : "bg-white dark:bg-slate-900 text-slate-500 border-slate-100 dark:border-slate-800 hover:border-primary-200"
                                        )}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Content</label>
                            <textarea
                                className="w-full min-h-[120px] p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm font-medium focus:ring-2 focus:ring-primary-500/20 outline-none transition-all placeholder:text-slate-400 leading-relaxed"
                                placeholder="Type your notes here..."
                                value={newNote.content}
                                onChange={(e) => setNewNote({ ...newNote, content: e.target.value })}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            className="w-full rounded-xl h-12 font-black text-sm bg-primary-600 hover:bg-primary-700 active:scale-[0.98] transition-all shadow-lg shadow-primary-500/30"
                            onClick={handleSaveNote}
                        >
                            {editingId ? 'Update Note' : 'Save Note'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <motion.div
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                    delay: 0.5
                }}
                className="fixed bottom-28 right-4 z-50"
            >
                <motion.div {...scaleOnTap}>
                    <Button
                        size="icon"
                        className="h-14 w-14 rounded-full shadow-2xl shadow-primary-500/50 bg-primary-600 hover:bg-primary-700 transition-colors"
                        onClick={handleOpenAddModal}
                    >
                        <Plus size={28} />
                    </Button>
                </motion.div>
            </motion.div>
        </motion.div>
    );
};

export default Notes;
