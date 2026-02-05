import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Search, FileText, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { fadeInUp } from '@/shared/utils/animations';
import { motion, AnimatePresence } from 'framer-motion';

const HelpCenter = () => {
    const navigate = useNavigate();
    const [selectedArticle, setSelectedArticle] = React.useState(null);

    const articles = [
        {
            title: 'Getting Started with DinTask',
            category: 'Basics',
            content: "Welcome to the future of productivity! DinTask is designed to help you organize your life and work seamlessly. To get started, first ensure your profile is fully set up in the 'Account' section. Once done, you can join a workspace provided by your admin. Your main dashboard will provide a 'Task Home' view where you can see all your active and pending assignments. Don't forget to explore the sidebar for your personalized calendar and notes!"
        },
        {
            title: 'How to create your first task',
            category: 'Tasks',
            content: "Creating tasks is the core of DinTask. Look for the floating '+' icon or the 'Add Task' button in your sidebar. When creating a task, you can specify high-priority levels, set precise due dates, and even add tags for better categorization. Once a task is created, it will appear in your Task Home, where you can move it through different stages of completion until it's finished."
        },
        {
            title: 'Managing your profile settings',
            category: 'Account',
            content: "Your profile is your identity on DinTask. Navigate to 'Profile' from the bottom menu to find your account settings. Here, you can upload a high-quality avatar, update your legal name, and verify your workplace location. These details help your team identify you during collaboration. You can also manage your workspace memberships and view your current subscription plan from this central hub."
        },
        {
            title: 'Understanding role permissions',
            category: 'Teams',
            content: "DinTask uses a hierarchical permission system to keep things secure. 'Employees' focus on task execution and personal productivity. 'Managers' have the added ability to assign work and supervise team progress. 'Admins' control the entire workspace settings and billing, while 'SuperAdmins' oversee the global system platform. If you find you're missing a button, check with your workspace administrator about your role."
        },
        {
            title: 'Syncing your calendar',
            category: 'Integrations',
            content: "Never miss a deadline again by syncing your external calendars. DinTask supports integration with Google Calendar and Microsoft Outlook. To sync, go to your 'Calendar' tab and look for the 'Sync' icon. Once authorized, your tasks with due dates will automatically appear on your external scheduling apps, and your meetings will show up in the DinTask daily planner view."
        },
        {
            title: 'Notification preferences',
            category: 'Settings',
            content: "Control how often you're alerted by customizing your notification settings. You can find these in Profile > Notifications. Choose between 'Real-time Push' for instant alerts, 'Email Digests' for a daily summary, or 'Quiet Mode' if you need focused deep-work time. You can also selectively mute specific channels, like task updates or team mentions, to reduce digital noise."
        },
    ];

    return (
        <div className="bg-background-light dark:bg-background-dark min-h-screen pb-10">
            {/* Header */}
            <div className="sticky top-0 z-20 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md">
                <div className="flex items-center p-4 justify-between max-w-[600px] mx-auto">
                    <button
                        onClick={() => selectedArticle ? setSelectedArticle(null) : navigate(-1)}
                        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h2 className="text-lg font-bold">{selectedArticle ? 'Article' : 'Help Center'}</h2>
                    <div className="w-10"></div>
                </div>
            </div>

            <main className="max-w-[600px] mx-auto px-6 pt-4">
                <AnimatePresence mode="wait">
                    {!selectedArticle ? (
                        <motion.div
                            key="list"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="space-y-8"
                        >
                            <div className="text-center space-y-2 py-4">
                                <h1 className="text-2xl font-black text-slate-900 dark:text-white">How can we help?</h1>
                                <div className="relative max-w-sm mx-auto">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                    <Input
                                        placeholder="Search articles..."
                                        className="pl-10 h-10 bg-white dark:bg-slate-900 border-none shadow-sm rounded-xl focus-visible:ring-primary-500"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest ml-1">Popular Articles</h3>
                                <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-3xl overflow-hidden">
                                    <CardContent className="p-0 divide-y divide-slate-50 dark:divide-slate-800">
                                        {articles.map((article, idx) => (
                                            <div
                                                key={idx}
                                                onClick={() => setSelectedArticle(article)}
                                                className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-500">
                                                        <FileText size={16} />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-900 dark:text-white">{article.title}</p>
                                                        <p className="text-[10px] text-slate-400">{article.category}</p>
                                                    </div>
                                                </div>
                                                <ChevronRight size={16} className="text-slate-300 group-hover:text-primary transition-colors" />
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="detail"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6 py-6"
                        >
                            <div className="space-y-2">
                                <p className="text-[10px] font-black uppercase text-primary tracking-widest">{selectedArticle.category}</p>
                                <h1 className="text-3xl font-black text-slate-900 dark:text-white leading-tight">
                                    {selectedArticle.title}
                                </h1>
                            </div>

                            <div className="flex items-center gap-3 py-4 border-y border-slate-100 dark:border-slate-800">
                                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold">DT</div>
                                <div>
                                    <p className="text-xs font-bold">DinTask Support Team</p>
                                    <p className="text-[10px] text-slate-400">Updated 2 days ago</p>
                                </div>
                            </div>

                            <div className="prose dark:prose-invert max-w-none">
                                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                                    {selectedArticle.content}
                                </p>
                            </div>

                            <div className="p-6 bg-slate-50 dark:bg-slate-900/50 rounded-3xl mt-12 space-y-4">
                                <p className="text-xs font-bold text-center">Was this article helpful?</p>
                                <div className="flex justify-center gap-4">
                                    <button className="px-6 py-2 rounded-xl bg-white dark:bg-slate-800 shadow-sm text-xs font-bold hover:bg-slate-100 transition-colors">ðŸ‘ Yes</button>
                                    <button className="px-6 py-2 rounded-xl bg-white dark:bg-slate-800 shadow-sm text-xs font-bold hover:bg-slate-100 transition-colors">ðŸ‘Ž No</button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};

export default HelpCenter;
