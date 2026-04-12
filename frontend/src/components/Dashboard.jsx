import React, { useEffect, useRef, useState, Suspense } from 'react';
import CameraFeed from './CameraFeed';
import CenterGauge from './CenterGauge';
import HardwarePanel from './HardwarePanel';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Wifi, Battery, MapPin, Sun, Moon } from 'lucide-react';
import { ShaderGradientCanvas, ShaderGradient } from 'shadergradient';

export default function Dashboard() {
  const hardwareState = useStore((state) => state.hardwareState);
  const theme = useStore((state) => state.theme);
  const toggleTheme = useStore((state) => state.toggleTheme);
  const { mode, buzzer } = hardwareState;

  const audioCtxRef = useRef(null);
  const oscillatorRef = useRef(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  const isDark = theme === 'dark';

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDateTime = (date) => {
    const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${day} ${month} ${year} ${hours}:${minutes}:${seconds}`;
  };

  useEffect(() => {
    const handleFirstInteraction = () => {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      window.removeEventListener('mousedown', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };
    window.addEventListener('mousedown', handleFirstInteraction);
    window.addEventListener('keydown', handleFirstInteraction);
    return () => {
      window.removeEventListener('mousedown', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };
  }, []);

  useEffect(() => {
    if (buzzer) {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      
      if (audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }

      if (!oscillatorRef.current) {
        oscillatorRef.current = audioCtxRef.current.createOscillator();
        oscillatorRef.current.type = 'sawtooth';
        oscillatorRef.current.frequency.setValueAtTime(880, audioCtxRef.current.currentTime);
        
        const lfo = audioCtxRef.current.createOscillator();
        lfo.type = 'square';
        lfo.frequency.value = 5;
        
        const gainNode = audioCtxRef.current.createGain();
        gainNode.gain.value = 0.5; // Base volume
        
        lfo.connect(gainNode.gain);
        lfo.start();
        
        oscillatorRef.current.connect(gainNode);
        gainNode.connect(audioCtxRef.current.destination);
        oscillatorRef.current.start();
      }
    } else {
      if (oscillatorRef.current) {
        try {
          oscillatorRef.current.stop();
          oscillatorRef.current.disconnect();
        } catch (e) {}
        oscillatorRef.current = null;
      }
    }
  }, [buzzer]);

  return (
    <div className={`w-full h-screen transition-colors duration-500 font-sans overflow-hidden p-6 relative ${theme === 'dark' ? 'bg-[#020617] text-white' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Dynamic Shader Gradient Background */}
      <div className={`absolute inset-0 z-0 transition-opacity duration-1000 ${!isDark ? 'blur-3xl scale-110' : 'opacity-100'}`}>
        <ShaderGradientCanvas 
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
          pointerEvents="none"
        >
          <Suspense fallback={null}>
            {isDark ? (
              // Dark Mode Gradient (waterPlane)
              <ShaderGradient 
                animate="on" 
                axesHelper="on" 
                bgColor1="#000000" 
                bgColor2="#000000" 
                brightness={1} 
                cAzimuthAngle={180} 
                cDistance={2.8} 
                cPolarAngle={80} 
                cameraZoom={9.1} 
                color1="#606080" 
                color2="#8d7dca" 
                color3="#212121" 
                destination="onCanvas" 
                embedMode="off" 
                envPreset="city" 
                format="gif" 
                fov={45} 
                frameRate={10} 
                gizmoHelper="hide" 
                grain="on" 
                lightType="3d" 
                pixelDensity={1} 
                positionX={0} 
                positionY={0} 
                positionZ={0} 
                range="disabled" 
                rangeEnd={40} 
                rangeStart={0} 
                reflection={0.1} 
                rotationX={50} 
                rotationY={0} 
                rotationZ={-60} 
                shader="defaults" 
                type="waterPlane" 
                uAmplitude={0} 
                uDensity={1.5} 
                uFrequency={0} 
                uSpeed={0.3} 
                uStrength={1.5} 
                uTime={8} 
                wireframe={false} 
              />
            ) : (
              // Light Mode Gradient (waterPlane)
              <ShaderGradient 
                animate="on" 
                axesHelper="off" 
                bgColor1="#000000" 
                bgColor2="#000000" 
                brightness={1.2} 
                cAzimuthAngle={170} 
                cDistance={4.4} 
                cPolarAngle={70} 
                cameraZoom={1} 
                color1="#94ffd1" 
                color2="#6bf5ff" 
                color3="#ffffff" 
                destination="onCanvas" 
                embedMode="off" 
                envPreset="city" 
                format="gif" 
                fov={45} 
                frameRate={10} 
                gizmoHelper="hide" 
                grain="off" 
                lightType="3d" 
                pixelDensity={1} 
                positionX={0} 
                positionY={0.9} 
                positionZ={-0.3} 
                range="disabled" 
                rangeEnd={40} 
                rangeStart={0} 
                reflection={0.1} 
                rotationX={45} 
                rotationY={0} 
                rotationZ={0} 
                shader="defaults" 
                type="waterPlane" 
                uAmplitude={0} 
                uDensity={1.2} 
                uFrequency={0} 
                uSpeed={0.2} 
                uStrength={3.4} 
                uTime={0} 
                wireframe={false} 
              />
            )}
          </Suspense>
        </ShaderGradientCanvas>
      </div>

      {/* Cinematic Scanline Overlay */}
      <div className="absolute inset-0 pointer-events-none z-50 opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]" />

      {/* Background Ambience & Glows */}
      <div className={`absolute inset-0 opacity-20 pointer-events-none transition-all duration-1000 z-[1] ${
        mode === 'CRITICAL' || mode === 'FATIGUED' 
          ? 'bg-[radial-gradient(circle_at_50%_50%,#ef4444,transparent)]' 
          : theme === 'dark' 
            ? 'bg-[radial-gradient(circle_at_50%_50%,#1e1b4b,transparent)]' 
            : 'bg-[radial-gradient(circle_at_50%_50%,#cbd5e1,transparent)]'
      }`} />

      {/* Safety Alert Overlay */}
      <AnimatePresence>
        {(mode === 'FATIGUED' || mode === 'CRITICAL') && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] pointer-events-none border-[30px] border-red-500/20 animate-pulse flex items-center justify-center backdrop-blur-[2px]"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.1, opacity: 0 }}
              className="bg-red-600/90 backdrop-blur-2xl px-16 py-8 rounded-3xl border border-red-400/50 shadow-[0_0_150px_rgba(220,38,38,0.6)] flex flex-col items-center gap-6"
            >
              <AlertTriangle className="w-20 h-20 text-white animate-bounce" />
              <div className="text-center">
                <h2 className="text-5xl font-black tracking-tighter text-white uppercase italic">{mode} ALERT</h2>
                <div className="h-1 w-full bg-white/20 mt-4 rounded-full overflow-hidden">
                  <motion.div 
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="h-full w-1/2 bg-white"
                  />
                </div>
                <p className="text-red-100 font-bold tracking-[0.3em] uppercase text-xs mt-4">
                  {mode === 'CRITICAL' ? 'EMERGENCY BRAKING ACTIVATED' : 'IMMEDIATE FATIGUE WARNING'}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative h-full w-full flex flex-col gap-6 z-10">
        {/* Top Header Section */}
        <header className="flex justify-between items-center px-4">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-6"
          >
             <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur opacity-25 animate-pulse" />
                <div className={`relative px-4 py-1.5 rounded-full border backdrop-blur-xl flex items-center gap-3 ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-white/80 border-slate-200 shadow-sm'}`}>
                  <Wifi className="w-4 h-4 text-blue-400 animate-pulse" />
                  <span className="text-[10px] font-black tracking-[0.4em] uppercase opacity-70">NeuroDrive Core</span>
                </div>
             </div>
             
             <div className="flex gap-4 opacity-40">
                <div className="flex items-center gap-2">
                   <Wifi className="w-3 h-3" />
                   <span className="text-[8px] font-bold uppercase tracking-widest">v2.4.0-STABLE</span>
                </div>
                <div className="flex items-center gap-2">
                   <Battery className="w-3 h-3" />
                   <span className="text-[8px] font-bold uppercase tracking-widest">SYNC: SERIAL/COM3</span>
                </div>
             </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center"
          >
            <div className={`text-4xl font-display font-black tracking-tighter italic ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
            <span className="text-[9px] font-bold tracking-[0.5em] uppercase opacity-30 mt-1">{formatDateTime(currentTime).split(' ').slice(0,3).join(' ')}</span>
          </motion.div>

          <div className="flex items-center gap-4">
             <div className="flex flex-col items-end mr-4">
                <span className="text-[8px] font-black tracking-widest uppercase opacity-30">Weather System</span>
                <div className="flex items-center gap-2">
                   <Sun className="w-3 h-3 text-yellow-500" />
                   <span className="text-[10px] font-bold tracking-widest">24°C</span>
                </div>
             </div>
             <motion.button 
               whileHover={{ scale: 1.1, rotate: 180 }}
               whileTap={{ scale: 0.9 }}
               onClick={toggleTheme}
               className={`p-3 rounded-full border backdrop-blur-md transition-all ${theme === 'dark' ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white border-slate-200 hover:bg-slate-50 shadow-sm'}`}
             >
               {theme === 'dark' ? <Sun className="w-4 h-4 text-yellow-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
             </motion.button>
          </div>
        </header>

        {/* Dashboard Grid */}
        <div className="flex-1 grid grid-cols-12 gap-6 min-h-0 z-10">
          {/* Left Column - Telemetry */}
          <div className="col-span-3 flex flex-col gap-6">
             <div className={`flex-1 backdrop-blur-xl rounded-[2.5rem] border p-8 overflow-hidden relative transition-all duration-500 ${
               isDark ? 'bg-black/20 border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]' : 'bg-white/30 border-white/40 shadow-[0_8px_32px_0_rgba(31,38,135,0.1)]'
             }`}>
                <HardwarePanel />
             </div>
             
             {/* Bottom Controls */}
             <div className={`backdrop-blur-xl rounded-3xl border p-6 transition-all duration-500 ${
               isDark ? 'bg-black/20 border-white/10' : 'bg-white/30 border-white/40 shadow-sm'
             }`}>
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest opacity-40">
                   <div className="flex items-center gap-3">
                      <div className="w-1 h-1 rounded-full bg-current" />
                      <span>Hologram LED</span>
                   </div>
                   <span className={hardwareState.led === 'GREEN' ? 'text-green-400' : hardwareState.led === 'BLUE' ? 'text-blue-400' : 'text-red-400'}>
                      {hardwareState.led}
                   </span>
                </div>
                <div className="mt-4 flex justify-between items-center text-[10px] font-black uppercase tracking-widest opacity-40">
                   <div className="flex items-center gap-3">
                      <div className="w-1 h-1 rounded-full bg-current" />
                      <span>Audio Warning</span>
                   </div>
                   <span className="opacity-80">{hardwareState.buzzer ? 'ACTIVE' : 'SILENT'}</span>
                </div>
             </div>
          </div>

          {/* Center Column - Gauges */}
          <div className="col-span-6 flex flex-col items-center justify-center relative">
             <CenterGauge />
             {/* Futuristic HUD Borders */}
             <div className="absolute inset-0 pointer-events-none">
                <div className={`absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 ${theme === 'dark' ? 'border-blue-500/30' : 'border-slate-300'}`} />
                <div className={`absolute top-0 right-0 w-20 h-20 border-t-2 border-r-2 ${theme === 'dark' ? 'border-blue-500/30' : 'border-slate-300'}`} />
                <div className={`absolute bottom-0 left-0 w-20 h-20 border-b-2 border-l-2 ${theme === 'dark' ? 'border-blue-500/30' : 'border-slate-300'}`} />
                <div className={`absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 ${theme === 'dark' ? 'border-blue-500/30' : 'border-slate-300'}`} />
             </div>
          </div>

          {/* Right Column - Vision & Navigation */}
          <div className="col-span-3 flex flex-col gap-6">
             <div className="flex-1 flex flex-col gap-6">
                <div className={`flex-[1.5] backdrop-blur-xl rounded-[2.5rem] border overflow-hidden relative group transition-all duration-500 ${
                  isDark ? 'bg-black/20 border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]' : 'bg-white/30 border-white/40 shadow-[0_8px_32px_0_rgba(31,38,135,0.1)]'
                }`}>
                   <CameraFeed />
                </div>
                
                <div className={`flex-1 backdrop-blur-xl rounded-[2.5rem] border p-8 flex flex-col transition-all duration-500 ${
                  isDark ? 'bg-black/20 border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]' : 'bg-white/30 border-white/40 shadow-[0_8px_32px_0_rgba(31,38,135,0.1)]'
                }`}>
                   <div className="flex justify-between items-start mb-6">
                      <div className="flex flex-col">
                         <span className="text-[8px] font-black tracking-widest uppercase opacity-30 mb-1">Navigation Core</span>
                         <span className="text-xl font-display font-black tracking-tighter uppercase italic opacity-90">Sector 7-G</span>
                      </div>
                      <div className="p-2 rounded-lg bg-blue-500/10">
                         <Wifi className="w-4 h-4 text-blue-400" />
                      </div>
                   </div>

                   <div className="mt-auto">
                      <div className="flex justify-between items-end mb-2">
                         <span className="text-[8px] font-black tracking-widest uppercase opacity-20">System Health</span>
                         <span className="text-[10px] font-bold opacity-60">98.2%</span>
                      </div>
                      <div className="h-1.5 w-full bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                         <div className="h-full w-[98%] bg-gradient-to-r from-blue-600 to-purple-600" />
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-3 mt-6">
                      <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-white/5">
                         <span className="text-[8px] font-black tracking-widest uppercase opacity-20 block mb-1">CPU Load</span>
                         <span className="text-sm font-black opacity-80">12%</span>
                      </div>
                      <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-white/5">
                         <span className="text-[8px] font-black tracking-widest uppercase opacity-20 block mb-1">Link Latency</span>
                         <span className="text-sm font-black opacity-80">2ms</span>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Alert Overlay */}
      <AnimatePresence>
        {buzzer && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="absolute bottom-32 left-1/2 -translate-x-1/2 w-full max-w-2xl z-50 px-6"
          >
            <div className="bg-red-500/10 backdrop-blur-2xl border border-red-500/30 rounded-[2rem] p-8 shadow-[0_0_100px_rgba(239,68,68,0.2)] flex flex-col items-center text-center gap-4 relative overflow-hidden">
               {/* Animated scanning line */}
               <motion.div 
                 animate={{ y: [-100, 300] }}
                 transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                 className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-20"
               />
               
               <div className="bg-red-500 p-4 rounded-full shadow-[0_0_30px_rgba(239,68,68,0.5)]">
                  <AlertTriangle className="w-8 h-8 text-white animate-bounce" />
               </div>
               
               <div className="flex flex-col gap-1">
                  <h2 className="text-2xl font-display font-black text-red-500 tracking-[0.2em] uppercase italic">Fatigue Detected</h2>
                  <p className="text-white/60 text-sm font-medium tracking-wide uppercase">System has engaged autonomous safety protocols</p>
               </div>

               <div className="flex items-center gap-8 mt-4">
                  <div className="flex flex-col items-center">
                     <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Motor PWM</span>
                     <span className="text-xl font-display font-black text-red-500">23</span>
                  </div>
                  <div className="w-px h-8 bg-white/10" />
                  <div className="flex flex-col items-center">
                     <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Status</span>
                     <span className="text-xl font-display font-black text-red-500 uppercase">{mode}</span>
                  </div>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
