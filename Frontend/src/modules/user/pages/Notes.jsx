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
            {/* Enhanced Background Visibility */}
            <div className="absolute inset-0 h-[320px] z-0 overflow-hidden">
                <img
                    src="/WLCOMPAGE .png"
                    alt="Background"
                    className="w-full h-full object-cover object-center opacity-70 dark:opacity-30 translate-y-[-10%]"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-white/80 to-white dark:from-slate-950/40 dark:via-slate-950/80 dark:to-slate-950" />
            </div>

            {/* Notes Content */}
            <div className="w-full max-w-[600px] mt-12 px-6 relative z-10 space-y-6">
                {/* Header Row */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                            My Notes
                        </h1>
                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                            Capture thoughts & reminders
                        </p>
                    </div>
                    <motion.div {...scaleOnTap}>
                        <Button
                            size="icon"
                            className="size-12 rounded-2xl bg-[#4461f2] hover:bg-[#3451e2] text-white shadow-lg shadow-[#4461f2]/20 transition-all border-none"
                            onClick={handleOpenAddPage}
                        >
                            <Plus size={24} />
                        </Button>
                    </motion.div>
                </div>

                {/* Search Bar */}
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-[#4461f2] transition-colors" />
                    <Input
                        placeholder="Search your notes..."
                        className="h-12 pl-11 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-slate-100 dark:border-slate-800 rounded-2xl shadow-sm focus:ring-4 focus:ring-[#4461f2]/10 transition-all font-bold text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Notes Feed */}
                <div ref={listRef} className="space-y-4">
                    <AnimatePresence mode="popLayout">
                        {loading && notes.length === 0 ? (
                            <div className="space-y-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-32 w-full bg-slate-50 dark:bg-slate-900 rounded-[1.5rem] animate-pulse" />
                                ))}
                            </div>
                        ) : filteredNotes.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="h-64 flex flex-col items-center justify-center text-slate-400 text-center px-8 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-[2.5rem] border-2 border-dashed border-slate-100 dark:border-slate-800"
                            >
                                <StickyNote size={48} className="opacity-10 mb-4 text-[#4461f2]" />
                                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-300">No notes found</h3>
                                <p className="text-[10px] mt-1 font-medium">Capture your first thought or search again.</p>
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
                                        "border-none shadow-[0_15px_35px_-8px_rgba(0,0,0,0.06)] bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-[1.5rem] overflow-hidden group hover:shadow-lg transition-all duration-300",
                                        note.isPinned && "ring-2 ring-primary-500/20 shadow-primary-500/5"
                                    )}>
                                        <CardContent className="p-4">
                                            <div className="flex justify-between items-start mb-1">
                                                <div className="flex items-center gap-2">
                                                    <Badge className="text-[7px] font-black uppercase tracking-[0.1em] px-1.5 py-0.5 bg-[#4461f2]/10 text-[#4461f2] border-none rounded-md">
                                                        {note.category}
                                                    </Badge>
                                                    {note.isPinned && (
                                                        <Pin size={10} className="text-primary-600 fill-primary-600" />
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className={cn(
                                                            "h-5 w-5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity",
                                                            note.isPinned ? "text-primary-600" : "text-slate-300"
                                                        )}
                                                        onClick={() => togglePin(note._id || note.id)}
                                                    >
                                                        <Pin size={10} className={note.isPinned ? "fill-primary-600" : ""} />
                                                    </Button>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-5 w-5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
                                                                <MoreVertical size={12} className="text-slate-400" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="rounded-2xl border-slate-100 dark:border-slate-800 p-1.5 shadow-xl">
                                                            <DropdownMenuItem
                                                                className="gap-3 text-xs font-bold rounded-xl cursor-pointer py-1.5"
                                                                onClick={() => handleEditClick(note)}
                                                            >
                                                                <Edit2 size={12} className="text-blue-500" /> Edit Note
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                className="gap-3 text-xs font-bold text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/10 rounded-xl cursor-pointer py-1.5"
                                                                onClick={() => handleDeleteNote(note._id || note.id)}
                                                            >
                                                                <Trash2 size={12} /> Delete
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </div>
                                            <h4 className="text-sm font-black text-slate-900 dark:text-white mb-0.5 leading-tight">
                                                <HighlightText text={note.title || ''} highlight={searchTerm} />
                                            </h4>
                                            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium line-clamp-3 leading-relaxed mb-1.5 whitespace-pre-wrap">
                                                <HighlightText text={note.content || ''} highlight={searchTerm} />
                                            </p>
                                            <div className="flex items-center gap-1.5 text-[8px] text-slate-400 font-bold uppercase tracking-wider italic">
                                                <Clock size={10} className="text-slate-300" />
                                                {note.createdAt ? format(new Date(note.createdAt), 'MMM dd, p') : 'Just now'}
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
