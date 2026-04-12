import React, { useEffect } from 'react';
import { useStore } from './store/useStore';
import { startHardwarePolling } from './api/api';
import Hero from './components/Hero';
import Dashboard from './components/Dashboard';

export default function App() {
  const mode = useStore((state) => state.mode);
  const theme = useStore((state) => state.theme);

  useEffect(() => {
    // Start interval to ping the node backend Decision Engine
    startHardwarePolling();
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }, [theme]);

  return (
    <div className={`min-h-screen relative overflow-hidden text-slate-900 dark:text-white transition-colors duration-300 ${theme === 'dark' ? 'bg-[#020617]' : 'bg-slate-50'} font-sans`}>
      {/* 🔮 CINEMATIC BLURRED GRADIENT BACKGROUND */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[30%] -left-[10%] w-[70%] h-[70%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute top-[20%] -right-[10%] w-[60%] h-[60%] bg-cyan-600/10 rounded-full blur-[100px]" />
        <div className="absolute -bottom-[20%] left-[20%] w-[50%] h-[50%] bg-indigo-600/10 rounded-full blur-[120px]" />
      </div>

      {/* Main Content Overlay */}
      <div className="relative z-10 w-full h-full">
        {mode === 'CINEMATIC' ? <Hero /> : <Dashboard />}
      </div>
    </div>
  );
}
