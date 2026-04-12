#include <ArduinoJson.h>
#include <HTTPClient.h>
#include <WiFi.h>

// WiFi & ThingSpeak Configuration
const char *ssid = "Ganesh";
const char *password = "123456789";
const String apiKey = "TEW8NUPDZEFWQPYO";
const char *serverPath = "http://api.thingspeak.com/update";

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
String current_led_state = "GREEN";
int current_buzzer_state = 0;

unsigned long lastTSUpdate = 0;
const long tsInterval = 15000; // 15 sec

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

  // LED + Buzzer
  pinMode(PIN_RED, OUTPUT);
  pinMode(PIN_GREEN, OUTPUT);
  pinMode(PIN_BLUE, OUTPUT);
  pinMode(BUZZER_PIN, OUTPUT);

  // PWM setup
  ledcAttach(ENA_PIN, 20000, 8);
}

void loop() {
  // -------- 1. READ POT --------
  pot_raw = analogRead(POT_PIN);
  pot_pwm = map(pot_raw, 0, 4095, 0, 255);
  local_mode = (pot_pwm <= 170) ? "CALM" : "AGGRESSIVE";

  // -------- 2. SEND SENSOR DATA --------
  StaticJsonDocument<128> sensorDoc;
  sensorDoc["pot"] = pot_pwm;
  sensorDoc["mode"] = local_mode;
  serializeJson(sensorDoc, Serial);
  Serial.println();

  // -------- 3. RECEIVE CONTROL & OVERRIDE --------
  if (Serial.available() > 0) {
    String input = Serial.readStringUntil('\n');
    StaticJsonDocument<256> controlDoc;
    DeserializationError error = deserializeJson(controlDoc, input);

    if (!error) {
      String rx_mode = controlDoc["mode"] | "CALM";
      int rx_pwm = controlDoc["pwm"] | 0;
      current_led_state = controlDoc["led"] | "GREEN";
      current_buzzer_state = controlDoc["buzzer"] | 0;

      // MISSION CRITICAL OVERRIDE (Dashboard controlled speed)
      final_pwm = rx_pwm; 

      // LED Control
      if (current_led_state == "GREEN") {
        digitalWrite(PIN_RED, LOW); digitalWrite(PIN_GREEN, HIGH); digitalWrite(PIN_BLUE, LOW);
      } else if (current_led_state == "BLUE") {
        digitalWrite(PIN_RED, LOW); digitalWrite(PIN_GREEN, LOW); digitalWrite(PIN_BLUE, HIGH);
      } else if (current_led_state == "RED") {
        digitalWrite(PIN_RED, HIGH); digitalWrite(PIN_GREEN, LOW); digitalWrite(PIN_BLUE, LOW);
      }

      // Buzzer
      digitalWrite(BUZZER_PIN, (current_buzzer_state == 1) ? HIGH : LOW);
    }
  }

  // Apply final PWM
  ledcWrite(ENA_PIN, final_pwm);

  // -------- 4. DEBUG (EXTENDED TELEMETRY) --------
  Serial.printf("ADC: %d | Pot PWM: %d | Mode: %s | Motor: %d | LED: %s | Buzzer: %d\n", 
                pot_raw, pot_pwm, local_mode.c_str(), final_pwm, current_led_state.c_str(), current_buzzer_state);

  // -------- 5. THINGSPEAK --------
  if (millis() - lastTSUpdate >= tsInterval) {
    if (WiFi.status() == WL_CONNECTED) {
      WiFiClient client;
      HTTPClient http;
      int modeCode = (local_mode == "CALM") ? 0 : 1;
      String url = String(serverPath) + "?api_key=" + apiKey +
                   "&field1=" + String(pot_pwm) + "&field2=" + String(modeCode);
      http.begin(client, url);
      http.GET();
      http.end();
      lastTSUpdate = millis();
    }
  }

  delay(50);
}