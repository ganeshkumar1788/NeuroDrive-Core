const express = require('express');
const cors = require('cors');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 5000; 
const SERIAL_PORT = 'COM9'; 
const THINGSPEAK_READ_KEY = 'FKDIGTV6GDVH3VA5';
const THINGSPEAK_CHANNEL = '3338284';

// Real-Time System Cache
let latestData = {
  speed: 0,
  emotion: "CALM",
  buzzer: 0,
  led: "GREEN",
  statusMessage: "SAFE",
  score: 100,
  espStatus: "CLOUD MODE" // Default to Cloud
};

let eyeTracker = {
  eyes_open: true,
  eye_closed_duration: 0 
};

let serialInput = {
  pot: 0,
  mode: "CALM",
  lastHeard: 0
};

let tsInput = {
  pot: 0,
  mode_flag: 0
};

// --- SERIAL MANAGEMENT (ULTRA RESONANCE) ---
let port;
let parser;

function initSerial() {
  if (port && port.isOpen) return;

  try {
    port = new SerialPort({ path: SERIAL_PORT, baudRate: 115200, autoOpen: false });
    parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

    port.open((err) => {
      if (err) {
        console.log(`📡 Serial: COM9 not found. Fallback active.`);
        latestData.espStatus = "CLOUD MODE";
      } else {
        console.log(`✅ Serial: COM9 Connected! Real-time active.`);
        latestData.espStatus = "SERIAL MODE";
      }
    });

    parser.on('data', (data) => {
      try {
        const json = JSON.parse(data);
        if (json.pot !== undefined) {
          serialInput.pot = json.pot;
          serialInput.mode = json.mode || "CALM";
          serialInput.lastHeard = Date.now();
          latestData.espStatus = "SERIAL MODE";
        }
      } catch (e) {
        // Garbage data on line - ignore
      }
    });

    port.on('close', () => {
      console.log(`📡 Serial: Connection lost. Switching to CLOUD.`);
      latestData.espStatus = "CLOUD MODE";
    });

  } catch (e) {
    console.error("Serial Init Error:", e.message);
  }
}

// Start Serial and background reconnector
initSerial();
setInterval(() => {
  if (!port || !port.isOpen) {
    initSerial();
  }
}, 5000);

// --- API ENDPOINTS ---

app.post("/api/update", (req, res) => {
  // Direct ESP32 HTTP push (Optional high speed path)
  const { speed, emotion, buzzer, led } = req.body;
  if (speed !== undefined) latestData.speed = speed;
  if (emotion !== undefined) latestData.emotion = emotion;
  latestData.espStatus = "SERIAL MODE";
  res.sendStatus(200);
});

app.get("/api/data", (req, res) => {
  res.json(latestData);
});

// Input from ThingSpeak (15s Loop)
setInterval(async () => {
  try {
    const response = await fetch(`https://api.thingspeak.com/channels/${THINGSPEAK_CHANNEL}/feeds.json?api_key=${THINGSPEAK_READ_KEY}&results=1`);
    const data = await response.json();
    if (data.feeds && data.feeds.length > 0) {
      const latest = data.feeds[0];
      tsInput.pot = parseInt(latest.field1) || 0;
      tsInput.mode_flag = parseInt(latest.field2) || 0;
      console.log(`☁️ Cloud Sync: Pot=${tsInput.pot}, ModeFlag=${tsInput.mode_flag}`); 
    }
  } catch (err) {
    console.error('☁️ Cloud Sync Error:', err.message);
  }
}, 15000);

app.post('/eyes', (req, res) => {
  const { eyes_open, eye_closed_duration } = req.body;
  if (eyes_open !== undefined) eyeTracker.eyes_open = eyes_open;
  if (eye_closed_duration !== undefined) eyeTracker.eye_closed_duration = eye_closed_duration;
  res.json({ success: true });
});

// --- CLOSED LOOP INTELLIGENT PROCESSING (10Hz) ---
setInterval(() => {
  // 1. DATA SOURCE SELECTION (FAILOVER ENGINE + HYBRID BLENDING)
  const isSerialAlive = (Date.now() - serialInput.lastHeard < 3000) && (port && port.isOpen);
  
  let hardwarePot = 0;
  let currentModeFlag = 0;

  if (isSerialAlive) {
    hardwarePot = serialInput.pot;
    currentModeFlag = (serialInput.mode === "AGGRESSIVE") ? 1 : 0;
    latestData.espStatus = "SERIAL MODE";
  } else {
    hardwarePot = tsInput.pot;
    currentModeFlag = tsInput.mode_flag;
    latestData.espStatus = "CLOUD MODE";
  }

  // BLEND: Recovered currentPot (Hardware only)
  const currentPot = hardwarePot;

  // 2. CONVERSION TO DASHBOARD SCALE (180 KM/H)
  const rawSpeed = (currentPot / 255) * 180;
  let targetSpeed = 0;

  // 3. PRIORITY LOGIC (CRITICAL > FATIGUED > CAUTION > AGGRESSIVE > CALM)
  if (eyeTracker.eye_closed_duration >= 15) {
    latestData.mode = "CRITICAL";
    targetSpeed = 0;
    latestData.led = "RED";
    latestData.buzzer = 1;
    latestData.score = 15;
    latestData.statusMessage = "EMERGENCY";
  } 
  else if (eyeTracker.eye_closed_duration >= 10) {
    latestData.mode = "FATIGUED";
    targetSpeed = 18; // PWM 23 equivalent
    latestData.led = "RED";
    latestData.buzzer = 1; // 🔥 RANG BUZZER (User Request)
    latestData.score = 40;
    latestData.statusMessage = "DANGER";
  }
  // 🔥 NEW: Immediate Safety Damping (15% reduction)
  else if (eyeTracker.eyes_open === false) {
    latestData.mode = "CAUTION";
    targetSpeed = rawSpeed * 0.85; // 15% Reduction
    latestData.led = "RED";
    latestData.buzzer = 1; // User requested "even 10 sec it need to rang" - starting early is safer
    latestData.score = 65;
    latestData.statusMessage = "SAFETY DAMPING";
  }
  else if (currentModeFlag === 1 && eyeTracker.eyes_open === true) {
    latestData.mode = "AGGRESSIVE";
    // Full Performance Unlocked: Scale potential to 180 KM/H (Full 255 PWM)
    const minS = (100/255)*180; // Min Aggressive speed
    const maxS = 180; // Full Speed Unlocked
    targetSpeed = Math.max(minS, Math.min(maxS, rawSpeed));
    latestData.led = "BLUE";
    latestData.buzzer = 0;
    latestData.score = 70;
    latestData.statusMessage = "FULL AGGRESSIVE PERFORMANCE";
  }
  else if (currentModeFlag === 0 && eyeTracker.eyes_open === true) {
    latestData.mode = "CALM";
    targetSpeed = rawSpeed;
    latestData.led = "GREEN";
    latestData.buzzer = 0;
    latestData.score = 95;
    latestData.statusMessage = "SAFE";
  }
  else {
    // Transition/Blink
    targetSpeed = rawSpeed;
    latestData.score = 85;
    latestData.statusMessage = isSerialAlive ? "MONITORING" : "FAILOVER ACTIVE";
  }

  latestData.speed = Math.floor(targetSpeed);
  latestData.pwm = Math.round((targetSpeed / 180) * 255);
  latestData.emotion = latestData.mode === "CALM" ? "CALM" : latestData.mode === "AGGRESSIVE" ? "STRESSED" : "DROWSY";

  // 4. OUTPUT TO HARDWARE (CENTRAL COMMAND OVERRIDE)
  if (isSerialAlive && port && port.isOpen) {
    const payload = {
      mode: latestData.mode,
      pwm: latestData.pwm,
      led: latestData.led,
      buzzer: latestData.buzzer
    };
    port.write(JSON.stringify(payload) + '\n');
  }

}, 100);

app.listen(PORT, () => {
  console.log(`🧠 Intelligent Controller Online | Port: ${PORT}`);
});
