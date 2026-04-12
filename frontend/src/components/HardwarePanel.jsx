import React from 'react';
import { useStore } from '../store/useStore';
import { motion } from 'framer-motion';
import { Volume2, Lightbulb, Activity, Shield, Eye, Zap } from 'lucide-react';

export default function HardwarePanel() {
  const hardwareState = useStore((state) => state.hardwareState);
  const theme = useStore((state) => state.theme);
  const { mode, pwm, buzzer, led, espStatus, score, emotion, statusMessage } = hardwareState;

  const isDark = theme === 'dark';
  
  const statusColor = espStatus === 'SERIAL MODE' ? 'text-blue-500' : 'text-orange-500';
  const getStatusMsgColor = () => {
    if (statusMessage === 'EMERGENCY' || statusMessage === 'DANGER') return 'text-red-500';
    if (statusMessage === 'CAUTION' || statusMessage === 'SAFETY DAMPING') return 'text-yellow-500';
    return 'text-emerald-500';
  };

  const getModeStyles = () => {
    switch (mode) {
      case 'CRITICAL': return 'bg-red-500/10 border-red-500/20 text-red-500';
      case 'FATIGUED': return 'bg-orange-500/10 border-orange-500/20 text-orange-500';
      case 'AGGRESSIVE': return 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500';
      default: return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
    }
  };

  // Improved font scaling to prevent truncation
  const getEmotionFontSize = (text) => {
    const len = text?.length || 0;
    if (len > 12) return 'text-2xl';
    if (len > 8) return 'text-3xl';
    if (len > 5) return 'text-4xl';
    return 'text-5xl';
  };

  return (
    <div className={`h-full flex flex-col p-8 overflow-y-auto custom-scrollbar transition-all duration-500 bg-transparent`}>
      
      {/* 🚀 TELEMETRY HEADER (Glassmorphic) */}
      <div className="flex items-start gap-5 mb-14">
        <div className={`p-4 rounded-2xl backdrop-blur-3xl ${isDark ? 'bg-blue-500/10 border border-white/5' : 'bg-blue-50 shadow-sm border border-blue-100'}`}>
          <Activity className="w-6 h-6 text-blue-500" />
        </div>
        <div className="flex flex-col gap-1">
          <span className={`text-[10px] font-black tracking-[0.4em] uppercase ${isDark ? 'text-white/30' : 'text-slate-400'}`}>
            Telemetry
          </span>
          <span className={`text-[10px] font-black tracking-widest uppercase ${statusColor}`}>
            {espStatus}
          </span>
          <span className={`text-xl font-black tracking-widest uppercase mt-1 ${getStatusMsgColor()} animate-pulse`}>
            {statusMessage}
          </span>
        </div>
      </div>

      {/* 📊 ROW-BY-ROW CORE STATS (Glassmorphic) */}
      <div className="flex flex-col gap-6 mb-12">
        
        {/* Safety Index Row */}
        <motion.div 
          whileHover={{ y: -5 }}
          className={`relative p-10 rounded-[3rem] border backdrop-blur-3xl transition-all duration-500 ${isDark ? 'bg-white/[0.05] border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)]' : 'bg-white/40 border-white/60 shadow-xl'}`}
        >
          <div className="flex items-center justify-between gap-6">
            <div className="flex flex-col gap-5 flex-1">
              <div className="flex items-center gap-3 opacity-40">
                <Shield className="w-5 h-5 text-emerald-500" />
                <span className={`text-[10px] font-black tracking-widest uppercase ${isDark ? 'text-white' : 'text-slate-900'}`}>Safety Index</span>
              </div>
              <div className={`h-1.5 w-full max-w-[200px] rounded-full overflow-hidden ${isDark ? 'bg-white/5' : 'bg-slate-200'}`}>
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${score}%` }}
                  className={`h-full bg-emerald-500 shadow-[0_0_20px_#10b981]`} 
                />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className={`text-6xl font-display font-black italic tracking-tighter leading-none ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {score}
              </span>
              <span className={`text-xs font-black tracking-widest uppercase opacity-20 ${isDark ? 'text-white' : 'text-slate-500'}`}>% SAFE</span>
            </div>
          </div>
        </motion.div>

        {/* Driver Emotion Row (Fixed Overflow) */}
        <motion.div 
          whileHover={{ y: -5 }}
          className={`relative p-10 rounded-[3rem] border backdrop-blur-3xl transition-all duration-500 ${isDark ? 'bg-white/[0.05] border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)]' : 'bg-white/40 border-white/60 shadow-xl'}`}
        >
          <div className="flex flex-col gap-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 opacity-40">
                <Eye className="w-5 h-5 text-blue-400" />
                <span className={`text-[10px] font-black tracking-widest uppercase ${isDark ? 'text-white' : 'text-slate-900'}`}>Driver Emotion</span>
              </div>
              <div className={`px-5 py-2 rounded-full border text-[10px] font-black tracking-[0.3em] uppercase transition-colors duration-500 ${getModeStyles()}`}>
                {mode} STATE
              </div>
            </div>
            
            <div className="flex justify-end">
              <span className={`${getEmotionFontSize(emotion)} font-display font-black italic tracking-tighter uppercase leading-none text-right truncate drop-shadow-2xl ${isDark ? 'text-white' : 'text-slate-900'}`}>
                {emotion || 'CALM'}
              </span>
            </div>
          </div>
        </motion.div>

      </div>

      {/* 🕹️ ACTUATOR ROWS (Glassmorphic) */}
      <div className="flex flex-col gap-4 mt-auto">
        <ActuatorRow 
          icon={<Lightbulb className="w-5 h-5" />} 
          label="Hologram LED" 
          value={led} 
          isDark={isDark} 
          color={led === 'RED' ? 'text-red-500' : led === 'BLUE' ? 'text-blue-400' : 'text-emerald-500'}
        />
        <ActuatorRow 
          icon={<Volume2 className="w-5 h-5" />} 
          label="Audio Warning" 
          value={buzzer ? (mode === 'CRITICAL' ? 'EMERGENCY' : 'CAUTION RINGING') : 'SILENT'} 
          isDark={isDark} 
          color={buzzer ? 'text-yellow-500 animate-pulse' : 'text-slate-500/30'}
        />
        <ActuatorRow 
          icon={<Zap className="w-5 h-5" />} 
          label="PWM Output" 
          value={`${Math.round((pwm / 255) * 100)}%`} 
          isDark={isDark} 
          color={isDark ? 'text-white/70' : 'text-slate-800'}
        />
      </div>

    </div>
  );
}

function ActuatorRow({ icon, label, value, isDark, color }) {
  return (
    <div className={`flex items-center justify-between p-7 rounded-[2.5rem] border backdrop-blur-md transition-all duration-300 ${isDark ? 'bg-white/[0.03] border-white/5 hover:bg-white/[0.06] hover:border-white/10' : 'bg-white/30 border-white/40 shadow-sm hover:shadow-md'}`}>
      <div className="flex items-center gap-6">
        <div className={`p-3 rounded-xl backdrop-blur-2xl ${isDark ? 'bg-white/5' : 'bg-slate-50'} opacity-80`}>
          {icon}
        </div>
        <span className={`text-[10px] font-black tracking-[0.4em] uppercase ${isDark ? 'text-white/30' : 'text-slate-400'}`}>
          {label}
        </span>
      </div>
      <span className={`text-xs font-black tracking-[0.4em] uppercase ${color}`}>
        {value}
      </span>
    </div>
  );
}
