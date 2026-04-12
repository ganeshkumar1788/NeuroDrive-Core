#include <ArduinoJson.h>
#include <HTTPClient.h>
#include <WiFi.h>

// WiFi Configuration
const char *ssid = "Ganesh";
const char *password = "123456789";

// PIN DEFINITIONS
const int POT_PIN = 34;
const int ENA_PIN = 25;
const int IN1_PIN = 26;
const int IN2_PIN = 27;
const int BUZZER_PIN = 33;
const int PIN_RED = 14;
const int PIN_GREEN = 12;
const int PIN_BLUE = 13;

// VARIABLES
int pot_raw = 0;
int pot_pwm = 0;
String local_mode = "CALM";
int final_pwm = 0;

// Vision Data (From Dashboard)
bool rx_eyes_open = true;
float rx_eye_duration = 0.0;
int rx_pwm = 0; 
String rx_led = "GREEN";
int rx_buzzer = 0;

void setup() {
  Serial.begin(115200);

  // WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
  }

  // Motor
  pinMode(ENA_PIN, OUTPUT);
  pinMode(IN1_PIN, OUTPUT);
  pinMode(IN2_PIN, OUTPUT);
  digitalWrite(IN1_PIN, HIGH);
  digitalWrite(IN2_PIN, LOW);

  // Actuators
  pinMode(PIN_RED, OUTPUT);
  pinMode(PIN_GREEN, OUTPUT);
  pinMode(PIN_BLUE, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);

  // PWM setup
  ledcAttach(ENA_PIN, 20000, 8);
}

void loop() {
  // -------- 1. READ SENSORS --------
  pot_raw = analogRead(POT_PIN);
  pot_pwm = map(pot_raw, 0, 4095, 0, 255);
  local_mode = (pot_pwm <= 170) ? "CALM" : "AGGRESSIVE";

  // -------- 2. RECEIVE VISION TELEMETRY --------
  if (Serial.available() > 0) {
    String input = Serial.readStringUntil('\n');
    StaticJsonDocument<256> doc;
    DeserializationError error = deserializeJson(doc, input);

    if (!error) {
      if (doc.containsKey("eyes_open")) rx_eyes_open = doc["eyes_open"];
      if (doc.containsKey("eye_duration")) rx_eye_duration = doc["eye_duration"];
      if (doc.containsKey("pwm")) rx_pwm = doc["pwm"];
      if (doc.containsKey("led")) rx_led = doc["led"].as<String>();
      if (doc.containsKey("buzzer")) rx_buzzer = doc["buzzer"];
    }
  }

  // -------- 3. EDGE MOTOR CONTROL PRIORITY ENGINE --------
  String display_mode = local_mode;

  // PRIORITY: CRITICAL (15s+)
  if (rx_eye_duration >= 15.0) {
    display_mode = "CRITICAL";
    final_pwm = 0;
    setLED("RED");
    digitalWrite(BUZZER_PIN, HIGH);
  }
  // PRIORITY: FATIGUED (10s+ AND AGGRESSIVE)
  else if (rx_eye_duration >= 10.0 && local_mode == "AGGRESSIVE") {
    display_mode = "FATIGUED";
    final_pwm = 23; 
    setLED("RED");
    digitalWrite(BUZZER_PIN, HIGH);
  }
  // NEW PRIORITY: SAFETY SYNC (EYES CLOSED)
  else if (!rx_eyes_open) {
    display_mode = "CAUTION";
    // Sync with Server Speedometer: Use rx_pwm provided by dashboard
    final_pwm = rx_pwm; 
    setLED("RED");
    digitalWrite(BUZZER_PIN, rx_buzzer);
  }
  // PRIORITY: AGGRESSIVE (EYES OPEN)
  else if (local_mode == "AGGRESSIVE" && rx_eyes_open) {
    display_mode = "AGGRESSIVE";
    final_pwm = constrain(pot_pwm, 120, 150);
    setLED("BLUE");
    digitalWrite(BUZZER_PIN, LOW);
  }
  // PRIORITY: CALM (EYES OPEN)
  else if (local_mode == "CALM" && rx_eyes_open) {
    display_mode = "CALM";
    final_pwm = pot_pwm;
    setLED("GREEN");
    digitalWrite(BUZZER_PIN, LOW);
  }

  // -------- 4. APPLY OUTPUTS --------
  ledcWrite(ENA_PIN, final_pwm);

  // -------- 5. SEND TELEMETRY TO DASHBOARD --------
  StaticJsonDocument<128> sensorDoc;
  sensorDoc["pot"] = pot_pwm;
  sensorDoc["mode"] = local_mode;
  serializeJson(sensorDoc, Serial);
  Serial.println();

  // -------- 6. MANDATORY DEBUG OUTPUT --------
  Serial.printf("ADC: %d | PWM: %d | Mode: %s | Final PWM: %d\n", 
                pot_raw, pot_pwm, display_mode.c_str(), final_pwm);

  delay(50);
}

// LED Utility
void setLED(String color) {
  if (color == "RED") {
    digitalWrite(PIN_RED, HIGH); digitalWrite(PIN_GREEN, LOW); digitalWrite(PIN_BLUE, LOW);
  } else if (color == "BLUE") {
    digitalWrite(PIN_RED, LOW); digitalWrite(PIN_GREEN, LOW); digitalWrite(PIN_BLUE, HIGH);
  } else if (color == "GREEN") {
    digitalWrite(PIN_RED, LOW); digitalWrite(PIN_GREEN, HIGH); digitalWrite(PIN_BLUE, LOW);
  }
}