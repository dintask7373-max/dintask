import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Search,
    Plus,
    StickyNote,
    MoreVertical,
    Trash2,
    Edit2,
    Clock,
    Pin,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { format } from 'date-fns';

import { Card, CardContent } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Badge } from '@/shared/components/ui/badge';
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
    const navigate = useNavigate();
    const { notes, loading, fetchNotes, deleteNote, togglePin } = useNotesStore();
    const [searchTerm, setSearchTerm] = useState('');

    const [listRef] = useAutoAnimate();

    React.useEffect(() => {
        fetchNotes();
    }, [fetchNotes]);

    const filteredNotes = notes.filter(note =>
        note.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.content?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleEditClick = (note) => {
        navigate(`/employee/notes/edit/${note._id || note.id}`);
    };

    const handleOpenAddPage = () => {
        navigate('/employee/notes/new');
    };

    const handleDeleteNote = async (id) => {
        if (window.confirm('Delete this note permanentely?')) {
            await deleteNote(id);
        }
    };

    // Helper to highlight search matches
    const HighlightText = ({ text, highlight }) => {
        // Strip HTML if it's there (safeguard for old notes)
        const plainText = (text || '').replace(/<[^>]*>/g, '');

        if (!highlight.trim()) {
            return <span>{plainText}</span>;
        }
        const regex = new RegExp(`(${highlight})`, 'gi');
        const parts = plainText.split(regex);

        return (
            <span>
                {parts.map((part, i) =>
                    part.toLowerCase() === highlight.toLowerCase() ? (
                        <span key={i} className="bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 px-0.5 rounded shadow-[0_0_10px_rgba(234,179,8,0.1)]">
                            {part}
                        </span>
                    ) : (
                        part
                    )
                )}
            </span>
        );
    };

    return (
        <div className="min-h-screen w-full bg-white dark:bg-slate-950 relative flex flex-col items-center justify-start font-sans overflow-x-hidden pb-20">
            {/* -- Premium Header Section -- */}
            <div className="relative w-full overflow-hidden flex justify-center">
                <div className="absolute inset-0 z-0">
                    <img
                        src="/WLCOMPAGE .png"
                        alt="Background"
                        className="w-full h-full object-cover object-center pointer-events-none"
                    />
                    <div className="absolute inset-0 bg-slate-950/40 dark:bg-black/60 pointer-events-none" />
                </div>

                <div className="relative z-10 w-full max-w-[600px] px-6 pt-10 pb-8">
                    <div className="flex items-start justify-between">
                        <div className="flex flex-col">
                            <h1 className="text-2xl font-black text-white tracking-tight leading-none">
                                My Notes
                            </h1>
                            <p className="text-[10px] font-bold text-white/60 uppercase tracking-widest mt-2">
                                Thoughts & Reminders
                            </p>
                        </div>
                        <motion.button
                            {...scaleOnTap}
                            onClick={handleOpenAddPage}
                            className="text-white/80 hover:text-white transition-colors"
                        >
                            <Plus size={28} strokeWidth={2.5} />
                        </motion.button>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="w-full max-w-[600px] px-6 mt-4 relative z-20 space-y-4">
                {/* Enhanced Compact Search Bar */}
                <div className="relative group mx-auto w-full">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 group-focus-within:text-[#4461f2] transition-colors" />
                    <input
                        placeholder="Quick search..."
                        className="w-full h-10 pl-10 pr-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-full shadow-[0_4px_12px_-4px_rgba(0,0,0,0.05)] border transition-all font-bold text-xs outline-none focus:border-[#4461f2] dark:focus:border-[#4461f2] dark:text-white"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Compact Notes Feed */}
                <div ref={listRef} className="space-y-3">
                    <AnimatePresence mode="popLayout">
                        {loading && notes.length === 0 ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-24 w-full bg-slate-50 dark:bg-slate-900 rounded-2xl animate-pulse" />
                                ))}
                            </div>
                        ) : filteredNotes.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="h-48 flex flex-col items-center justify-center text-slate-400 text-center px-8 bg-white dark:bg-slate-900/50 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm"
                            >
                                <StickyNote size={32} className="opacity-20 mb-3 text-[#4461f2]" />
                                <h3 className="text-xs font-bold text-slate-900 dark:text-slate-300">Nothing here</h3>
                                <p className="text-[9px] mt-1 font-medium opacity-60 uppercase tracking-widest">Start jotting down</p>
                            </motion.div>
                        ) : (
                            filteredNotes.map((note, index) => (
                                <motion.div
                                    key={note._id || note.id}
                                    variants={fadeInUp}
                                    custom={index}
                                    layout
                                >
                                    <Card className={cn(
                                        "border border-slate-100 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 rounded-2xl overflow-hidden group hover:shadow-md hover:border-slate-200 dark:hover:border-slate-700 transition-all duration-300",
                                        note.isPinned && "ring-1 ring-blue-500/20"
                                    )}>
                                        <CardContent className="p-3">
                                            <div className="flex justify-between items-start mb-0.5">
                                                <Badge className="text-[7px] font-black uppercase tracking-[0.1em] px-1.5 py-0.5 bg-[#4461f2]/5 text-[#4461f2] border-none rounded-md">
                                                    {note.category}
                                                </Badge>
                                                <div className="flex items-center gap-0.5">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className={cn(
                                                            "h-6 w-6 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity",
                                                            note.isPinned ? "text-[#4461f2]" : "text-slate-300"
                                                        )}
                                                        onClick={() => togglePin(note._id || note.id)}
                                                    >
                                                        <Pin size={10} className={note.isPinned ? "fill-[#4461f2]" : ""} />
                                                    </Button>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-6 w-6 rounded-lg">
                                                                <MoreVertical size={12} className="text-slate-400" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="rounded-xl border-slate-100 dark:border-slate-800 p-1 shadow-lg">
                                                            <DropdownMenuItem
                                                                className="gap-2 text-[10px] font-black rounded-lg cursor-pointer py-1.5 uppercase"
                                                                onClick={() => handleEditClick(note)}
                                                            >
                                                                <Edit2 size={10} className="text-blue-500" /> Edit
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                className="gap-2 text-[10px] font-black text-rose-500 focus:text-rose-500 focus:bg-rose-50 dark:focus:bg-rose-900/10 rounded-lg cursor-pointer py-1.5 uppercase"
                                                                onClick={() => handleDeleteNote(note._id || note.id)}
                                                            >
                                                                <Trash2 size={10} /> Delete
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-0.5 pointer-events-none">
                                                <h4 className="text-xs font-black text-slate-800 dark:text-white leading-tight tracking-tight">
                                                    <HighlightText text={note.title || ''} highlight={searchTerm} />
                                                </h4>
                                                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium line-clamp-2 leading-relaxed whitespace-pre-wrap">
                                                    <HighlightText text={note.content || ''} highlight={searchTerm} />
                                                </p>
                                            </div>

                                            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-50 dark:border-slate-800/50">
                                                <div className="flex items-center gap-1 text-[8px] text-slate-400 font-black uppercase tracking-widest leading-none">
                                                    <Clock size={8} className="text-slate-300" />
                                                    {note.createdAt ? format(new Date(note.createdAt), 'MMM dd') : 'Recent'}
                                                </div>
                                                {note.isPinned && (
                                                    <Pin size={8} className="text-[#4461f2]/50 fill-[#4461f2]/50" />
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default Notes;
