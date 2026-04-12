import { useStore } from '../store/useStore';

const API_BASE = 'http://localhost:5000';

export const startHardwarePolling = () => {
  setInterval(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/data`);
      if (res.ok) {
        const data = await res.json();
        
        // Update the global store with real-time data from backend cache
        useStore.getState().setHardwareState(data);
        
      }
    } catch (err) {
      // Set status to offline if backend is unreachable
      useStore.getState().setHardwareState({ espStatus: 'OFFLINE' });
    }
  }, 200); // ⚡ 200ms Ultra-fast polling for zero-latency dashboard
};

export const updateEyesState = async (eyesOpen, durationSec) => {
  try {
    await fetch(`${API_BASE}/eyes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eyes_open: eyesOpen,
        eye_closed_duration: durationSec
      })
    });
  } catch (err) {
    console.error('Failed to post eye data');
  }
};
