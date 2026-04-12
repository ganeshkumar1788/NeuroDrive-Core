import React from 'react';
import Scene from './Scene';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { ChevronRight, ShieldCheck, Zap, Activity, Sun, Moon } from 'lucide-react';

export default function Hero() {
  const setMode = useStore((state) => state.setMode);
  const theme = useStore((state) => state.theme);
  const toggleTheme = useStore((state) => state.toggleTheme);

  const isDark = theme === 'dark';

  return (
    <div className={`relative w-full h-screen overflow-hidden transition-colors duration-500 ${theme === 'dark' ? 'bg-[#020617]' : 'bg-slate-50'}`}>
      {/* 3D Background */}
      <div className="absolute inset-0 z-0">
        <Scene />
      </div>

      {/* Cinematic Overlay */}
      <div className={`absolute inset-0 z-10 flex flex-col justify-between items-center py-20 transition-all duration-500 ${theme === 'dark' ? 'bg-gradient-to-b from-[#020617]/40 via-transparent to-[#020617]' : 'bg-gradient-to-b from-white/40 via-transparent to-white'}`}>
        
        {/* Top Branding & Theme Toggle */}
        <div className="w-full max-w-7xl px-8 flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`flex items-center gap-4 px-6 py-2 rounded-full border backdrop-blur-xl ${theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-white/80'}`}
          >
            <Activity className="w-5 h-5 text-[#38BDF8] animate-pulse" />
            <span className={`text-[10px] font-black tracking-[0.5em] uppercase ${theme === 'dark' ? 'text-white/80' : 'text-slate-600'}`}>NeuroDrive AI • v2.0</span>
          </motion.div>

          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={toggleTheme}
            className={`p-3 rounded-full border transition-all ${theme === 'dark' ? 'border-white/10 bg-white/5 hover:bg-white/10' : 'border-slate-200 bg-white hover:bg-slate-50 shadow-sm'}`}
          >
            {theme === 'dark' ? <Sun className="w-5 h-5 text-yellow-500" /> : <Moon className="w-5 h-5 text-slate-700" />}
          </motion.button>
        </div>

        {/* Main Content */}
        <div className="w-full max-w-7xl px-8 flex flex-col items-center text-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className={`text-7xl md:text-[10rem] font-display font-black leading-[0.85] tracking-tighter mb-8 italic ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              FUTURE <br/> 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#38BDF8] via-[#818CF8] to-[#38BDF8] animate-gradient-x">DRIVEN.</span>
            </h1>
          </motion.div>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className={`text-lg md:text-xl max-w-xl font-light tracking-wide mb-12 leading-relaxed ${theme === 'dark' ? 'text-white/40' : 'text-slate-500'}`}
          >
            Experience the next generation of emotion-aware vehicle intelligence. Real-time ESP32 telemetry meets neural eye tracking.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex flex-col items-center gap-8"
          >
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: theme === 'dark' ? "0 0 40px rgba(56, 189, 248, 0.4)" : "0 10px 30px rgba(0,0,0,0.1)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setMode('DASHBOARD')}
              className={`group relative flex items-center justify-center gap-4 px-12 py-5 rounded-full text-lg font-black uppercase tracking-widest transition-all duration-500 overflow-hidden ${theme === 'dark' ? 'bg-white text-black' : 'bg-slate-900 text-white'}`}
            >
              <div className={`absolute inset-0 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ${theme === 'dark' ? 'bg-[#38BDF8]' : 'bg-slate-700'}`} />
              <span className="relative z-10 transition-colors duration-500">Initialize Dashboard</span>
              <ChevronRight className="relative z-10 w-6 h-6 group-hover:translate-x-2 transition-all duration-500" />
            </motion.button>

            <div className={`flex gap-12 ${theme === 'dark' ? 'text-white/30' : 'text-slate-300'}`}>
               {[
                 { icon: ShieldCheck, label: "Safety First" },
                 { icon: Zap, label: "0ms Latency" },
                 { icon: Activity, label: "Live Sync" }
               ].map((item, i) => (
                 <div key={i} className="flex items-center gap-2 group cursor-help">
                   <item.icon className="w-4 h-4 group-hover:text-[#38BDF8] transition-colors" />
                   <span className={`text-[10px] font-bold tracking-widest uppercase group-hover:text-slate-600 transition-colors ${theme === 'dark' ? 'group-hover:text-white' : ''}`}>{item.label}</span>
                 </div>
               ))}
            </div>
          </motion.div>
        </div>

        {/* Bottom Scroll Indicator */}
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className={`w-px h-16 bg-gradient-to-b from-transparent to-transparent ${theme === 'dark' ? 'via-white/20' : 'via-slate-300'}`}
        />
      </div>
    </div>
  );
}
