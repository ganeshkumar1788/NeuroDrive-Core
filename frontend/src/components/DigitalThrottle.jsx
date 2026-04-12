import React from 'react';
import { useStore } from '../store/useStore';
import { motion } from 'framer-motion';
import { Plus, Minus, Zap } from 'lucide-react';

export default function DigitalThrottle() {
  const digitalThrottle = useStore((state) => state.hardwareState.digitalThrottle);
  const setDigitalThrottle = useStore((state) => state.setDigitalThrottle);
  const theme = useStore((state) => state.theme);
  const isDark = theme === 'dark';

  const adjustThrottle = (amount) => {
    const newValue = Math.max(0, Math.min(255, digitalThrottle + amount));
    setDigitalThrottle(newValue);
  };

  return (
    <div className={`p-6 rounded-3xl border backdrop-blur-xl transition-all duration-500 ${isDark ? 'bg-white/5 border-white/5 shadow-2xl' : 'bg-white/40 border-slate-200 shadow-lg'}`}>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-yellow-500/20 rounded-xl">
          <Zap className="w-5 h-5 text-yellow-400 fill-yellow-400/20" />
        </div>
        <h3 className={`text-sm font-black tracking-widest uppercase ${isDark ? 'text-white/80' : 'text-slate-800'}`}>
          Digital Speed Node
        </h3>
      </div>

      <div className="flex items-center justify-between gap-6">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => adjustThrottle(-15)}
          className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-colors ${isDark ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-slate-100 border-slate-200 hover:bg-slate-200'}`}
        >
          <Minus className={`w-6 h-6 ${isDark ? 'text-white' : 'text-slate-900'}`} />
        </motion.button>

        <div className="flex-1 relative h-3 bg-slate-800/20 rounded-full overflow-hidden">
          <motion.div
            initial={false}
            animate={{ width: `${(digitalThrottle / 255) * 100}%` }}
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-yellow-500 to-orange-500 shadow-[0_0_20px_rgba(245,158,11,0.4)]"
          />
        </div>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => adjustThrottle(15)}
          className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-colors ${isDark ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-slate-100 border-slate-200 hover:bg-slate-200'}`}
        >
          <Plus className={`w-6 h-6 ${isDark ? 'text-white' : 'text-slate-900'}`} />
        </motion.button>
      </div>

      <div className="mt-4 flex justify-between items-end">
        <span className={`text-[10px] font-black tracking-widest uppercase opacity-40 ${isDark ? 'text-white' : 'text-slate-500'}`}>
          Software Bias
        </span>
        <span className={`text-2xl font-display font-black tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>
          {Math.round((digitalThrottle / 255) * 100)}%
        </span>
      </div>
    </div>
  );
}
