import { create } from 'zustand'

export const useStore = create((set) => ({
  mode: 'CINEMATIC', // CINEMATIC, DASHBOARD
  theme: localStorage.getItem('theme') || 'dark',
  hardwareState: {
    mode: 'CALM',
    speed: 0,
    pwm: 0,
    buzzer: 0,
    led: 'OFF',
    emotion: 'NEUTRAL',
    espStatus: 'OFFLINE',
    score: 0,
    pot: 0,
    eyes_open: true,
    eye_closed_duration: 0
  },
  logs: [],
  setMode: (mode) => set({ mode }),
  toggleTheme: () => set((state) => {
    const newTheme = state.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', newTheme);
    return { theme: newTheme };
  }),
  setHardwareState: (newState) => set((state) => ({ hardwareState: { ...state.hardwareState, ...newState } })),
  addLog: (message) => set((state) => {
    const newLog = { time: new Date().toLocaleTimeString(), message };
    return { logs: [newLog, ...state.logs].slice(0, 50) };
  })
}))
