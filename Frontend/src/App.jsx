import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from '@/shared/components/ui/sonner';
import AppRouter from './router/AppRouter';
import useAuthStore from './store/authStore';
import './index.css';

function App() {
  const { isAuthenticated, fetchProfile } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile();
    }
  }, [isAuthenticated, fetchProfile]);

  return (
    <BrowserRouter>
      <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
        <AppRouter />
        <Toaster richColors position="top-right" />
      </div>
    </BrowserRouter>
  );
}

export default App;
