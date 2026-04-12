import React, { useRef, useEffect, useState } from 'react';
import { useStore } from '../store/useStore';
import { Camera, Eye, ZapOff } from 'lucide-react';
import { updateEyesState } from '../api/api';
import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

export default function CameraFeed() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const requestRef = useRef(null);
  const faceLandmarkerRef = useRef(null);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [visionReady, setVisionReady] = useState(false);
  const [cameraError, setCameraError] = useState(false);
  
  const mode = useStore((state) => state.hardwareState.mode);

  // Tracking state for eyes
  const closedTimerRef = useRef(0);
  const timeStartClosedRef = useRef(0);
  const lastVideoTime = useRef(-1);
  const blinkHistoryRef = useRef([]); // Moving average for accuracy
  const lastUpdateRef = useRef(0); // Throttle API calls

  useEffect(() => {
    async function initVision() {
      setIsModelLoading(true);
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.34/wasm"
        );
        const landmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
            delegate: "GPU"
          },
          outputFaceBlendshapes: true,
          runningMode: "VIDEO",
          numFaces: 1,
          minFaceDetectionConfidence: 0.5,
          minFacePresenceConfidence: 0.5,
          minTrackingConfidence: 0.5
        });
        faceLandmarkerRef.current = landmarker;
        setIsModelLoading(false);
      } catch (err) {
        console.error("Failed to init FaceLandmarker:", err);
        setIsModelLoading(false); // Ensure loading state is cleared
      }
    }
    
    initVision();

    return () => {
      if (faceLandmarkerRef.current) {
        faceLandmarkerRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    let retryCount = 0;
    const maxRetries = 3;

    async function startCamera() {
      if (streamRef.current) return; // Already started
      
      // Clean up any existing stream first
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: true // Simplified constraints for maximum compatibility
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          const playPromise = videoRef.current.play();
          if (playPromise !== undefined) {
            playPromise.catch(e => {
              console.warn("Auto-play prevented:", e);
            });
          }
        }
        streamRef.current = stream;
        setCameraError(false);
      } catch (err) {
        console.error(`Camera attempt ${retryCount + 1} failed:`, err);
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
           // If denied, stop auto-retrying and wait for manual button click
           setCameraError(true);
           setIsModelLoading(false);
        } else if (retryCount < maxRetries) {
          retryCount++;
          setTimeout(startCamera, 1000);
        } else {
          setCameraError(true);
          setIsModelLoading(false);
        }
      }
    }
    startCamera();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, []);

  const onVideoPlaying = () => {
    setVisionReady(true);
    requestRef.current = requestAnimationFrame(predictWebcam);
  };

  const predictWebcam = async () => {
    if (!faceLandmarkerRef.current || !videoRef.current || videoRef.current.readyState < 2) {
      requestRef.current = requestAnimationFrame(predictWebcam);
      return;
    }

    const startTimeMs = performance.now();
    if (lastVideoTime.current !== videoRef.current.currentTime) {
      lastVideoTime.current = videoRef.current.currentTime;
      
      const results = faceLandmarkerRef.current.detectForVideo(videoRef.current, startTimeMs);

      // Analyze Blendshapes for fatigue detection
      if (results.faceBlendshapes && results.faceBlendshapes.length > 0) {
        const categories = results.faceBlendshapes[0].categories;
        const eyeBlinkLeft = categories.find(c => c.categoryName === 'eyeBlinkLeft')?.score || 0;
        const eyeBlinkRight = categories.find(c => c.categoryName === 'eyeBlinkRight')?.score || 0;

        // Smooth blinking scores for accuracy
        // Use MAX of both eyes to be more sensitive to closure (if one eye is closed, trigger)
        blinkHistoryRef.current.push(Math.max(eyeBlinkLeft, eyeBlinkRight));
        if (blinkHistoryRef.current.length > 10) blinkHistoryRef.current.shift();
        const avgBlink = blinkHistoryRef.current.reduce((a, b) => a + b, 0) / blinkHistoryRef.current.length;

        // Draw Mesh logic inside canvas (specifically the eyes)
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");

        // Clear canvas before drawing
        if (canvas && ctx) {
          canvas.width = videoRef.current.videoWidth;
          canvas.height = videoRef.current.videoHeight;
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }

        if (canvas && ctx && results.faceLandmarks) {
          for (const landmarks of results.faceLandmarks) {
            const rightEyeIndices = [33, 160, 158, 133, 153, 144];
            const leftEyeIndices = [362, 385, 387, 263, 373, 380];

            ctx.fillStyle = mode === 'CRITICAL' || mode === 'FATIGUED' ? '#ef4444' : '#38BDF8';
            ctx.shadowColor = mode === 'CRITICAL' || mode === 'FATIGUED' ? '#ef4444' : '#38BDF8';
            ctx.shadowBlur = 15;
            [...rightEyeIndices, ...leftEyeIndices].forEach((index) => {
               const pos = landmarks[index];
               ctx.beginPath();
               ctx.arc(pos.x * canvas.width, pos.y * canvas.height, 4, 0, 2 * Math.PI);
               ctx.fill();
            });
            ctx.shadowBlur = 0;

            // Draw connecting lines for a high-tech "mesh" look
            ctx.strokeStyle = mode === 'CRITICAL' || mode === 'FATIGUED' ? 'rgba(239, 68, 68, 0.4)' : 'rgba(56, 189, 248, 0.4)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(landmarks[33].x * canvas.width, landmarks[33].y * canvas.height);
            ctx.lineTo(landmarks[133].x * canvas.width, landmarks[133].y * canvas.height);
            ctx.moveTo(landmarks[362].x * canvas.width, landmarks[362].y * canvas.height);
            ctx.lineTo(landmarks[263].x * canvas.width, landmarks[263].y * canvas.height);
            ctx.stroke();
          }
        }

        // Send eye status to robust backend engine
        // Threshold optimization: Using smoothed avgBlink for more accurate results
        const BLINK_THRESHOLD = 0.45; // Adjusted for better balance
        const isClosedNow = avgBlink > BLINK_THRESHOLD;

        // Visual debug indicator on canvas if needed
        if (ctx && canvas) {
            const statusColor = isClosedNow ? 'rgba(239, 68, 68, 0.8)' : 'rgba(56, 189, 248, 0.4)';
            ctx.fillStyle = statusColor;
            ctx.fillRect(10, 10, 180, 45);
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 14px Arial';
            ctx.fillText(`EYE: ${isClosedNow ? 'CLOSED' : 'OPEN'}`, 15, 28);
            ctx.font = '12px Arial';
            ctx.fillText(`Score: ${(avgBlink * 100).toFixed(0)}%`, 15, 45);
            
            // Add a progress bar for the FATIGUED trigger (5s/10s)
            if (isClosedNow && timeStartClosedRef.current > 0) {
               const elapsed = (performance.now() - timeStartClosedRef.current) / 1000;
               const progress = Math.min(1, elapsed / 5);
               ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
               ctx.fillRect(10, 60, 180, 5);
               ctx.fillStyle = '#ef4444';
               ctx.fillRect(10, 60, 180 * progress, 5);
            }
        }

        // Throttle API calls to 10hz to avoid flooding
        const now = performance.now();
        if (now - lastUpdateRef.current > 100) {
           lastUpdateRef.current = now;
           
           if (isClosedNow) {
              if (timeStartClosedRef.current === 0) {
                  timeStartClosedRef.current = performance.now();
              }
              const durationSec = (performance.now() - timeStartClosedRef.current) / 1000;
              updateEyesState(false, durationSec);
           } else {
              timeStartClosedRef.current = 0;
              updateEyesState(true, 0);
           }
        }
      } else {
        // No face detected - treat as eyes open but reset closure timer
        timeStartClosedRef.current = 0;
        const now = performance.now();
        if (now - lastUpdateRef.current > 100) {
           lastUpdateRef.current = now;
           updateEyesState(true, 0);
        }
        blinkHistoryRef.current = [];
      }
    }
    
    // Loop
    requestRef.current = requestAnimationFrame(predictWebcam);
  };

  const retryCamera = async () => {
    setCameraError(false);
    setIsModelLoading(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      streamRef.current = stream;
      setCameraError(false);
    } catch (err) {
      console.error("Manual camera retry failed:", err);
      setCameraError(true);
      setIsModelLoading(false);
    }
  };

  const getBorderColor = () => {
    switch(mode) {
      case 'CALM': return 'border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.5)]';
      case 'AGGRESSIVE': return 'border-yellow-500 shadow-[0_0_30px_rgba(234,179,8,0.5)]';
      case 'FATIGUED': return 'border-[#e60000] shadow-[0_0_30px_rgba(230,0,0,0.6)] animate-pulse';
      case 'CRITICAL': return 'border-[#e60000] shadow-[0_0_40px_rgba(230,0,0,0.8)] animate-pulse';
      default: return 'border-transparent';
    }
  };

  return (
    <div className={`relative w-full h-full rounded-2xl overflow-hidden border transition-all duration-500 ${getBorderColor()} group`}>
      {/* Video element for MediaPipe */}
      <video
        ref={videoRef}
        className={`absolute inset-0 w-full h-full object-cover grayscale brightness-75 group-hover:grayscale-0 group-hover:brightness-100 transition-all duration-700 ${visionReady ? 'opacity-100' : 'opacity-30'}`}
        onPlaying={onVideoPlaying}
        playsInline
        muted
        autoPlay
      />
      
      {/* HUD Canvas for landmarks */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
      />

      {/* Camera Overlay HUD */}
      <div className="absolute inset-0 z-20 p-4 flex flex-col justify-between pointer-events-none">
        <div className="flex justify-between items-start">
           <div className="bg-black/40 backdrop-blur-xl px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${visionReady ? 'bg-red-500 animate-pulse' : 'bg-slate-500'}`} />
              <span className="text-[10px] font-black tracking-widest uppercase text-white/90">AI Neural Vision</span>
           </div>
           {visionReady && (
             <div className="bg-blue-500/20 backdrop-blur-xl px-3 py-1.5 rounded-lg border border-blue-500/30 flex items-center gap-2">
                <span className="text-[10px] font-black tracking-widest uppercase text-blue-400">Live Feed</span>
             </div>
           )}
        </div>
      </div>

      {/* Status States */}
      {(isModelLoading || cameraError) && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-[#020617]/90 backdrop-blur-sm gap-4 p-6 text-center">
          {isModelLoading && !cameraError ? (
            <>
              <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
              <p className="text-[10px] font-black tracking-[0.3em] uppercase text-white/60">Calibrating Neural Vision...</p>
            </>
          ) : (
            <div className="flex flex-col items-center">
              <Camera className="w-8 h-8 text-red-500 mb-2" />
              <span className="text-[10px] font-bold tracking-widest text-white/80 uppercase mb-1">Camera Access Blocked</span>
              <span className="text-[8px] text-white/40 uppercase mb-4 text-center max-w-[200px]">Permission denied or hardware not found. Please enable access to continue.</span>
              <button 
                onClick={retryCamera}
                className="pointer-events-auto px-6 py-2 bg-white text-black text-[8px] font-black uppercase tracking-[0.2em] rounded-full hover:bg-blue-400 hover:text-white transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)]"
              >
                Enable Camera
              </button>
            </div>
          )}
        </div>
      )}

      {/* Bottom Scanlines Effect */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.03),rgba(0,255,0,0.01),rgba(0,0,128,0.03))] z-20 bg-[length:100%_4px,3px_100%]" />
    </div>
  );
}
