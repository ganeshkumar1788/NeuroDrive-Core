import React from 'react';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';

export default function CenterGauge() {
  const hardwareState = useStore((state) => state.hardwareState);
  const theme = useStore((state) => state.theme);
  const { speed, mode } = hardwareState;
  
  const isDark = theme === 'dark';
  const isAlert = mode === 'CRITICAL' || mode === 'FATIGUED';
  const accentColor = isAlert ? '#ef4444' : '#38BDF8';

  return (
    <div className="relative w-full h-full flex items-center justify-center scale-110">
      
      {/* Outer Rotating HUD Rings */}
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        className="absolute w-[520px] h-[520px] rounded-full border border-dashed border-white/5 opacity-20"
      />
      <motion.div 
        animate={{ rotate: -360 }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute w-[480px] h-[480px] rounded-full border-2 border-white/5 border-t-blue-500/20 opacity-30"
      />

      {/* Main Gauge Container */}
      <div className="relative w-[420px] h-[420px] rounded-full flex items-center justify-center">
        
        {/* Dynamic Glow & Pulse Background */}
        <motion.div 
          animate={{ 
            boxShadow: isAlert 
              ? ['0 0 100px rgba(239, 68, 68, 0.2)', '0 0 150px rgba(239, 68, 68, 0.4)', '0 0 100px rgba(239, 68, 68, 0.2)']
              : isDark ? '0 0 80px rgba(56, 189, 248, 0.1)' : '0 0 40px rgba(0,0,0,0.05)',
            scale: isAlert ? [1, 1.02, 1] : 1
          }}
          transition={{ repeat: isAlert ? Infinity : 0, duration: 1 }}
          className={`absolute inset-0 rounded-full border transition-all duration-700 backdrop-blur-3xl ${isDark ? 'bg-[#020617]/40 border-white/5 shadow-2xl' : 'bg-white/40 border-white/40 shadow-xl'}`}
        />

        {/* Dynamic Speed Particles/Ticks */}
        {[...Array(60)].map((_, i) => {
          const isActive = (speed / 180) * 60 > i;
          return (
            <div 
              key={i} 
              className="absolute inset-2 pointer-events-none"
              style={{ transform: `rotate(${i * 6 - 180}deg)` }}
            >
              <motion.div 
                animate={{ 
                  height: isActive ? 12 : 4,
                  opacity: isActive ? 1 : 0.1,
                  backgroundColor: isActive ? accentColor : '#fff'
                }}
                className="w-0.5 rounded-full transition-all duration-300"
                style={{ 
                  boxShadow: isActive ? `0 0 10px ${accentColor}` : 'none'
                }}
              />
            </div>
          );
        })}

        {/* Main Speed Value with Advanced Animation */}
        <div className="relative flex flex-col items-center z-10">
          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center"
          >
            <AnimatePresence mode="wait">
              <motion.span 
                key={Math.round(speed)}
                initial={{ y: 10, opacity: 0, filter: 'blur(10px)' }}
                animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                className={`text-[12rem] font-display font-black leading-[0.8] italic tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}
                style={{
                  textShadow: isAlert ? '0 0 40px rgba(239, 68, 68, 0.5)' : 'none'
                }}
              >
                {Math.round(speed)}
              </motion.span>
            </AnimatePresence>
            <div className="flex flex-col items-center mt-4">
               <div className={`h-px w-24 bg-gradient-to-r from-transparent ${isAlert ? 'via-red-500/40' : 'via-blue-500/40'} to-transparent`} />
               <span className={`text-sm font-black tracking-[0.8em] uppercase mt-2 opacity-40 ${isDark ? 'text-white' : 'text-slate-500'}`}>KM / H</span>
            </div>
          </motion.div>
        </div>

        {/* Speed Progress Arc (SVG) with Enhanced Glow */}
        <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none p-4">
          <circle
            cx="50%"
            cy="50%"
            r="48%"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="4 4"
            className="text-white/5"
          />
          <motion.circle
            cx="50%"
            cy="50%"
            r="48%"
            fill="none"
            stroke={accentColor}
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray="1000"
            animate={{ 
              strokeDashoffset: 1000 - (speed / 180) * 1000,
              strokeWidth: isAlert ? [12, 16, 12] : 12
            }}
            transition={{ 
              strokeDashoffset: { type: 'spring', damping: 15 },
              strokeWidth: { repeat: Infinity, duration: 1 }
            }}
            className={isAlert ? 'drop-shadow-[0_0_20px_rgba(239,68,68,0.6)]' : 'drop-shadow-[0_0_15px_rgba(56,189,248,0.5)]'}
          />
        </svg>

      </div>
    </div>
  );
}
