import React from 'react';
import { useStore } from '../store/useStore';
import { updateHardwareState } from '../api/api';
import { AlertOctagon, Heart, Zap, Coffee } from 'lucide-react';

export default function ControlPanel() {
  const { emotion } = useStore((state) => state.hardwareState);

  const setEmotion = (newEmotion) => {
    updateHardwareState({ emotion: newEmotion });
  };

  const triggerEmergency = () => {
    updateHardwareState({ emotion: 'CRITICAL', override: 'EMERGENCY_STOP' });
  };

  return (
    <div className="glass-panel-dark p-6">
      <h2 className="text-sm font-semibold text-slate-400 tracking-widest uppercase mb-4">State Forcing (Override)</h2>
      
      <div className="grid grid-cols-3 gap-2 mb-4">
        <button 
          onClick={() => setEmotion('CALM')}
          className={`px-3 py-4 rounded-xl border flex flex-col items-center gap-2 transition-all duration-300 ${emotion === 'CALM' ? 'bg-c_green/20 border-c_green shadow-neon-green text-c_green' : 'bg-black/20 border-white/5 text-slate-400 hover:text-white'}`}
        >
          <Heart className="w-5 h-5" />
          <span className="text-[10px] font-bold tracking-widest">CALM</span>
        </button>

        <button 
          onClick={() => setEmotion('AGGRESSIVE')}
          className={`px-3 py-4 rounded-xl border flex flex-col items-center gap-2 transition-all duration-300 ${emotion === 'AGGRESSIVE' ? 'bg-c_yellow/20 border-c_yellow shadow-neon-yellow text-c_yellow' : 'bg-black/20 border-white/5 text-slate-400 hover:text-white'}`}
        >
          <Zap className="w-5 h-5" />
          <span className="text-[10px] font-bold tracking-widest">AGGR.</span>
        </button>

        <button 
          onClick={() => setEmotion('FATIGUE')}
          className={`px-3 py-4 rounded-xl border flex flex-col items-center gap-2 transition-all duration-300 ${emotion === 'FATIGUE' ? 'bg-c_blue/20 border-c_blue shadow-neon-blue text-c_blue' : 'bg-black/20 border-white/5 text-slate-400 hover:text-white'}`}
        >
          <Coffee className="w-5 h-5" />
          <span className="text-[10px] font-bold tracking-widest">FATIGUE</span>
        </button>
      </div>

      <button 
        onClick={triggerEmergency}
        className="w-full py-4 rounded-xl border border-c_red bg-c_red/20 text-c_red hover:bg-c_red hover:text-white hover:shadow-neon-red flex items-center justify-center gap-2 transition-all duration-300"
      >
        <AlertOctagon className="w-5 h-5" />
        <span className="text-sm font-bold tracking-widest">EMERGENCY STOP (CRITICAL)</span>
      </button>
    </div>
  );
}
