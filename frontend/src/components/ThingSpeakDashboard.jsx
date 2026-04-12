import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Bell, BatteryWarning, CheckCircle, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';

const EMOTION_MAP = {
  0: { label: 'Normal', color: 'text-emerald-400', glow: 'shadow-emerald-500/50', icon: CheckCircle },
  1: { label: 'Drowsy', color: 'text-amber-400', glow: 'shadow-amber-500/50', icon: BatteryWarning },
  2: { label: 'Angry', color: 'text-red-500', glow: 'shadow-red-500/50', icon: AlertTriangle }
};

const RGB_MAP = {
  1: { color: 'bg-emerald-500', label: 'SAFE (Green)' },
  2: { color: 'bg-amber-400', label: 'WARNING (Yellow)' },
  3: { color: 'bg-red-500', label: 'DANGER (Red)' }
};

export default function ThingSpeakDashboard() {
  const [data, setData] = useState({
    speed: 0,
    emotion: 0,
    buzzer: 0,
    rgb: 1,
    lastUpdated: null
  });
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('Connecting...');

  const fetchData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/data');
      if (!response.ok) throw new Error("Fetch failed");
      const result = await response.json();
      
      if (result.error) {
         setStatus('Error');
      } else {
         setData(result);
         setStatus('Online');
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setStatus('Offline');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(); // initial fetch
    const interval = setInterval(fetchData, 1000); // ⚡ 1 sec = near real-time
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-zinc-950 text-white">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
          <Activity size={48} className="text-cyan-400" />
        </motion.div>
        <span className="ml-4 tracking-widest text-xl font-light">INITIALIZING TELEMETRY...</span>
      </div>
    );
  }

  const { speed, emotion, buzzer, rgb, lastUpdated } = data;
  const isBuzzerActive = buzzer === 1;
  
  const EmotionIcon = EMOTION_MAP[emotion]?.icon || CheckCircle;

  return (
    <div className="min-h-screen w-full bg-zinc-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 to-black text-white p-6 md:p-12 relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 pb-6 border-b border-white/5 relative z-10">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
            NEURODRIVE AI
          </h1>
          <p className="text-zinc-500 font-mono text-sm mt-2 flex items-center gap-2">
            <Activity size={14} />
            LAST SYNC: {lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : 'AWAITING DATA'}
          </p>
        </div>
        <div className="flex items-center space-x-3 bg-white/5 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 mt-4 md:mt-0">
          <span className="relative flex h-3 w-3">
            {status === 'Online' && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            )}
            <span className={`relative inline-flex rounded-full h-3 w-3 ${status === 'Online' ? 'bg-cyan-500' : 'bg-red-500'}`}></span>
          </span>
          <span className="font-mono text-sm font-medium tracking-widest text-zinc-300">
            {status.toUpperCase()}
          </span>
        </div>
      </header>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
        
        {/* Speed Gauge Widget */}
        <div className="backdrop-blur-xl bg-white/[0.02] border border-white/10 rounded-3xl p-8 flex flex-col items-center justify-center relative overflow-hidden group hover:border-white/20 transition-colors">
          <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <Zap className="text-cyan-400 mb-6 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]" size={36} />
          <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500 mb-2">Vehicle Velocity</h2>
          <motion.div 
            key={speed}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-8xl font-black tabular-nums tracking-tighter text-white"
          >
            {speed}
          </motion.div>
          <div className="text-xs font-mono text-zinc-600 mt-2 tracking-widest">RAW UNITS</div>
          
          <div className="w-full h-1.5 bg-zinc-800 rounded-full mt-10 overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-cyan-400 to-blue-500"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min((speed / 4095) * 100, 100)}%` }} // Potentiometer scale
              transition={{ type: "spring", stiffness: 40, damping: 15 }}
            />
          </div>
        </div>

        {/* Emotion Indicator Widget */}
        <div className="backdrop-blur-xl bg-white/[0.02] border border-white/10 rounded-3xl p-8 flex flex-col items-center justify-center relative transition-colors shadow-2xl">
          <div className={`absolute inset-0 rounded-3xl opacity-20 blur-2xl transition-colors duration-1000 ${EMOTION_MAP[emotion]?.color.replace('text-', 'bg-')}`}></div>
          <motion.div
             key={`icon-${emotion}`}
             initial={{ scale: 0.5, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             transition={{ type: 'spring', bounce: 0.5 }}
          >
             <EmotionIcon className={`${EMOTION_MAP[emotion]?.color} mb-6 drop-shadow-lg`} size={56} />
          </motion.div>
          
          <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500 mb-2">Driver State</h2>
          <motion.div 
            key={`label-${emotion}`}
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className={`text-5xl font-extrabold tracking-tight ${EMOTION_MAP[emotion]?.color}`}
          >
            {EMOTION_MAP[emotion]?.label || 'Unknown'}
          </motion.div>
        </div>

        {/* System Status (RGB & Buzzer) */}
        <div className="backdrop-blur-xl bg-white/[0.02] border border-white/10 rounded-3xl p-8 flex flex-col justify-between hover:border-white/20 transition-colors">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500 mb-6">Hardware Output</h2>
            
            <div className="flex items-center space-x-5 p-5 rounded-2xl bg-black/40 border border-white/5">
              <ShieldCheck className="text-zinc-500" size={28} />
              <div className="flex-1">
                <div className="text-[10px] font-mono text-zinc-500 tracking-widest mb-1">CABIN LIGHTING (RGB)</div>
                <div className="font-bold tracking-wide text-zinc-200">{RGB_MAP[rgb]?.label || 'UNKNOWN'}</div>
              </div>
              <div className={`w-5 h-5 rounded-full shadow-[0_0_15px_rgba(0,0,0,0.5)] ${RGB_MAP[rgb]?.color} ${rgb === 3 && 'animate-pulse'}`} />
            </div>
          </div>

          <motion.div 
            className={`mt-4 flex items-center space-x-5 p-5 rounded-2xl border ${isBuzzerActive ? 'border-red-500/50 bg-red-950/30' : 'border-white/5 bg-black/40'}`}
            animate={isBuzzerActive ? { scale: [1, 1.02, 1] } : { scale: 1 }}
            transition={{ repeat: Infinity, duration: 0.8 }}
          >
            <Bell className={isBuzzerActive ? 'text-red-500 animate-bounce drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'text-zinc-600'} size={28} />
            <div>
              <div className="text-[10px] font-mono text-zinc-500 tracking-widest mb-1">BUZZER ALARM</div>
              <div className={`font-bold tracking-widest ${isBuzzerActive ? 'text-red-400' : 'text-zinc-600'}`}>
                {isBuzzerActive ? 'ENGAGED' : 'STANDBY'}
              </div>
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  );
}
