import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, StickyNote, Tag, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { cn } from "@/shared/utils/cn";
import useNotesStore from '@/store/notesStore';
import { scaleOnTap } from '@/shared/utils/animations';

const AddNote = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { notes, addNote, updateNote, fetchNotes } = useNotesStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'General'
  });

  useEffect(() => {
    if (id) {
      const existingNote = notes.find(n => (n._id || n.id) === id);
      if (existingNote) {
        setFormData({
          title: existingNote.title,
          content: existingNote.content,
          category: existingNote.category || 'General'
        });
      } else {
        fetchNotes();
      }
    }
  }, [id, notes, fetchNotes]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.content) {
      toast.error('Title and content are required');
      return;
    }

    setIsSubmitting(true);

    try {
      if (id) {
        await updateNote(id, formData);
        toast.success('Note updated successfully');
      } else {
        await addNote(formData);
        toast.success('Note added successfully');
      }
      navigate('/employee/notes');
    } catch (error) {
      console.error('Failed to save note:', error);
      toast.error('Failed to save note');
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = ['Idea', 'Work', 'Meetings', 'Tasks', 'General'];

  return (
    <div className="bg-white dark:bg-slate-950 min-h-screen pb-32">
<<<<<<< HEAD
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center p-4 justify-between max-w-[600px] mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-lg font-black tracking-tight">{id ? 'Edit Note' : 'New Note'}</h2>
          <div className="w-10"></div>
        </div>
      </div>

      <div className="max-w-[600px] mx-auto px-6 pt-8 space-y-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category Selection */}
          <div className="space-y-3">
            <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Category</Label>
            <div className="flex flex-wrap gap-2">
=======
      {/* -- Premium Static Header -- */}
      <div className="sticky top-0 z-20 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center p-4 justify-between max-w-[600px] mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="size-10 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-900 rounded-full transition-all group active:scale-95"
          >
            <ArrowLeft size={22} className="text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
          </button>
          <div className="flex flex-col items-center">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#4461f2] mb-0.5">Drafting</h2>
            <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
              {id ? 'Refine Note' : 'New Note'}
            </h1>
          </div>
          <div className="size-10" /> {/* Spacer */}
        </div>
      </div>

      <div className="max-w-[600px] mx-auto px-6 pt-10">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Category Selection: Liquid Design with Scroll */}
          <div className="space-y-4">
            <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 opacity-70">
              Select Context
            </Label>
            <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar pb-2 -mx-2 px-2">
>>>>>>> 10a9f42c3551230e4fe982ac2d6c00a53eac9b94
              {categories.map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setFormData({ ...formData, category: cat })}
                  className={cn(
<<<<<<< HEAD
                    "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border",
                    formData.category === cat
                      ? "bg-[#4461f2] text-white border-[#4461f2] shadow-lg shadow-[#4461f2]/20"
                      : "bg-slate-50 dark:bg-slate-900 text-slate-400 border-slate-100 dark:border-slate-800 hover:border-[#4461f2]/30"
=======
                    "px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all border-[1.5px] shrink-0",
                    formData.category === cat
                      ? "bg-[#4461f2] text-white border-[#4461f2] shadow-lg shadow-[#4461f2]/20 scale-105"
                      : "bg-white dark:bg-slate-900 text-slate-400 border-slate-100 dark:border-slate-800 hover:border-[#4461f2]/30"
>>>>>>> 10a9f42c3551230e4fe982ac2d6c00a53eac9b94
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

<<<<<<< HEAD
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Note Title</Label>
              <Input
                placeholder="What's on your mind?"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="h-14 text-lg font-bold bg-slate-50 dark:bg-slate-900 border-none shadow-sm rounded-2xl focus:ring-2 focus:ring-[#4461f2]/20"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Content</Label>
              <Textarea
                placeholder="Start typing your thoughts..."
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="min-h-[250px] bg-slate-50 dark:bg-slate-900 border-none shadow-sm rounded-2xl focus:ring-2 focus:ring-[#4461f2]/20 resize-none pt-4 text-sm font-medium leading-relaxed"
=======
          {/* Writing Surface */}
          <div className="flex flex-col gap-6">
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 opacity-70">Title</Label>
              <Input
                placeholder="A title for your thought..."
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="h-16 text-xl font-black bg-slate-50/50 dark:bg-slate-900/50 border-none shadow-sm rounded-[1.5rem] focus:ring-4 focus:ring-[#4461f2]/5 transition-all px-6 placeholder:text-slate-300 dark:placeholder:text-slate-700"
              />
            </div>

            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1 opacity-70">Content</Label>
              <Textarea
                placeholder="Dive into your ideas..."
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                className="min-h-[350px] bg-slate-50/50 dark:bg-slate-900/50 border-none shadow-sm rounded-[2rem] focus:ring-4 focus:ring-[#4461f2]/5 transition-all resize-none p-6 text-base font-medium leading-relaxed placeholder:text-slate-300 dark:placeholder:text-slate-700"
>>>>>>> 10a9f42c3551230e4fe982ac2d6c00a53eac9b94
              />
            </div>
          </div>

<<<<<<< HEAD
          <div className="pt-6">
=======
          {/* Actions */}
          <div className="pt-8">
>>>>>>> 10a9f42c3551230e4fe982ac2d6c00a53eac9b94
            <motion.div {...scaleOnTap}>
              <Button
                type="submit"
                disabled={isSubmitting}
<<<<<<< HEAD
                className="w-full h-14 bg-[#4461f2] hover:bg-[#3451e2] text-white font-black rounded-2xl shadow-xl shadow-[#4461f2]/30 flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
              >
                {isSubmitting ? (
                  <span className="animate-pulse">Saving...</span>
                ) : (
                  <>
                    <CheckCircle2 size={24} />
                    <span>{id ? 'Update Note' : 'Save Note'}</span>
=======
                className="w-full h-16 bg-[#4461f2] hover:bg-[#3451e2] text-white font-black rounded-3xl shadow-2xl shadow-[#4461f2]/30 flex items-center justify-center gap-3 transition-all relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span className="uppercase tracking-widest text-xs">Syncing...</span>
                  </div>
                ) : (
                  <>
                    <CheckCircle2 size={24} strokeWidth={2.5} />
                    <span className="text-sm uppercase tracking-[0.15em]">{id ? 'Save Changes' : 'Publish Note'}</span>
>>>>>>> 10a9f42c3551230e4fe982ac2d6c00a53eac9b94
                  </>
                )}
              </Button>
            </motion.div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddNote;
