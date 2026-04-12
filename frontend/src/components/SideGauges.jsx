import React from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { Fuel, Thermometer, Battery, Zap } from 'lucide-react';

export const FuelGauge = () => {
  const { theme } = useStore();
  const radius = 100;
  const circumference = 2 * Math.PI * radius;
  const arcLength = circumference * 0.25; // 90 degree arc
  
  return (
    <div className="flex flex-col items-end gap-2 pr-4 relative h-64 justify-center">
      <div className="flex flex-col items-end">
        <div className="flex items-center gap-2">
           <Fuel className="w-5 h-5 text-white/40" />
           <span className="text-3xl font-display font-black tracking-tighter text-white">58 l</span>
        </div>
        <div className="text-[10px] font-bold text-white/20 uppercase tracking-widest mt-1">
           12 l / 100 km
        </div>
        <div className="text-[10px] font-bold text-white/20 uppercase tracking-widest">
           → 416 km
        </div>
      </div>
      
      {/* Fuel Arc */}
      <svg width="60" height="200" viewBox="0 0 60 200" className="absolute -right-2 top-0">
        <path 
          d="M 50 20 A 100 100 0 0 0 50 180" 
          fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" strokeLinecap="round" 
        />
        <motion.path 
          d="M 50 20 A 100 100 0 0 0 50 180" 
          fill="none" stroke="#38BDF8" strokeWidth="8" strokeLinecap="round"
          strokeDasharray="160"
          animate={{ strokeDashoffset: 40 }} // Example 75% full
          transition={{ duration: 1.5 }}
        />
        <text x="35" y="15" fill="white" fillOpacity="0.4" fontSize="10" fontWeight="bold">F</text>
        <text x="25" y="100" fill="white" fillOpacity="0.4" fontSize="10" fontWeight="bold">1/2</text>
        <text x="35" y="195" fill="white" fillOpacity="0.4" fontSize="10" fontWeight="bold">E</text>
      </svg>
      
      <div className="mt-8 flex flex-col items-end">
        <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest mb-2">Distance</span>
        <div className="flex justify-between w-32 border-b border-white/5 pb-1">
           <span className="text-[10px] font-bold text-white/40 uppercase">Day</span>
           <span className="text-[10px] font-black">352 km</span>
        </div>
        <div className="flex justify-between w-32 pt-1">
           <span className="text-[10px] font-bold text-white/40 uppercase">Total</span>
           <span className="text-[10px] font-black">110 593 km</span>
        </div>
      </div>
    </div>
  );
};

export const TempGauge = () => {
  const { hardwareState } = useStore();
  const radius = 100;
  
  return (
    <div className="flex flex-col items-start gap-2 pl-4 relative h-64 justify-center">
      {/* Temp Arc */}
      <svg width="60" height="200" viewBox="0 0 60 200" className="absolute -left-2 top-0">
        <path 
          d="M 10 20 A 100 100 0 0 1 10 180" 
          fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" strokeLinecap="round" 
        />
        <motion.path 
          d="M 10 20 A 100 100 0 0 1 10 180" 
          fill="none" stroke="url(#tempGradient)" strokeWidth="8" strokeLinecap="round"
          strokeDasharray="160"
          animate={{ strokeDashoffset: 80 }} // Example 50%
          transition={{ duration: 1.5 }}
        />
        <defs>
          <linearGradient id="tempGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#38BDF8" />
          </linearGradient>
        </defs>
        <text x="20" y="15" fill="white" fillOpacity="0.4" fontSize="10" fontWeight="bold">130</text>
        <text x="30" y="100" fill="white" fillOpacity="0.4" fontSize="10" fontWeight="bold">90</text>
        <text x="20" y="195" fill="white" fillOpacity="0.4" fontSize="10" fontWeight="bold">50</text>
      </svg>

      <div className="flex flex-col items-start">
        <div className="flex items-center gap-3">
           <span className="text-3xl font-display font-black tracking-tighter text-white">90°C</span>
           <Thermometer className="w-5 h-5 text-white/40" />
        </div>
      </div>

      <div className="mt-12 flex flex-col items-start gap-4">
        <div className="flex items-center gap-3">
           <span className="text-xl font-display font-black text-white">13.5 v</span>
           <Battery className="w-5 h-5 text-white/40" />
        </div>
        
        {/* Battery Bar */}
        <div className="flex gap-1 h-6 items-end">
           {[...Array(5)].map((_, i) => (
             <div key={i} className={`w-2 rounded-sm ${i < 4 ? 'bg-[#38BDF8]' : 'bg-white/5'} h-${(i+1)*2}`} 
                  style={{ height: `${(i+1)*4}px` }} />
           ))}
        </div>
      </div>
    </div>
  );
};
