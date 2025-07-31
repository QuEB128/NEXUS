#include <Wire.h>
#include "MAX30105.h"
#include "heartRate.h"
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <OneWire.h>
#include <DallasTemperature.h>

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1
#define GRAPH_Y 38
#define GRAPH_HEIGHT 20

#define ONE_WIRE_BUS 2

MAX30105 particleSensor;
OneWire oneWire(ONE_WIRE_BUS);
DallasTemperature sensors(&oneWire);
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

int waveform[SCREEN_WIDTH];
int frame = 0;

float temperature = 0;
int pulse = 0;
int spo2 = 0;

void setup() {
  Serial.begin(115200); // Data sent to Raspberry Pi
  Wire.begin();

  // OLED
  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println(F("SSD1306 init failed"));
    while (1);
  }

  display.clearDisplay();
  display.display();

  // DS18B20
  sensors.begin();

  // MAX30102
  if (!particleSensor.begin(Wire, I2C_SPEED_STANDARD)) {
    Serial.println("MAX30102 not found. Check wiring.");
    while (1);
  }
  particleSensor.setup();
  particleSensor.setPulseAmplitudeRed(0x0A); // turn Red LED to low
  particleSensor.setPulseAmplitudeIR(0x1F);  // turn IR LED to medium
}

void loop() {
  // Read temperature
  sensors.requestTemperatures();
  temperature = sensors.getTempCByIndex(0);

  // Read pulse
  long irValue = particleSensor.getIR();
  if (checkForBeat(irValue)) {
    static unsigned long lastBeat = 0;
    unsigned long now = millis();
    int beatInterval = now - lastBeat;
    lastBeat = now;
    pulse = 60000 / beatInterval;
  }

  // SpO2 (approximate, not medical-grade)
  spo2 = map(irValue, 50000, 100000, 95, 100);
  spo2 = constrain(spo2, 90, 100);

  // Update display + waveform
  updateWaveform();
  drawDisplay();

  // Send to Raspberry Pi
  Serial.print("TEMP:");
  Serial.print(temperature, 1);
  Serial.print(",PULSE:");
  Serial.print(pulse);
  Serial.print(",SpO2:");
  Serial.println(spo2);

  delay(100); // match Raspberry Pi read timing
}

void updateWaveform() {
  for (int i = 0; i < SCREEN_WIDTH - 1; i++) {
    waveform[i] = waveform[i + 1];
  }

  int y;
  if (frame % 20 < 4) {
    y = GRAPH_Y - 8 + frame % 4 * 2;
  } else if (frame % 20 < 8) {
    y = GRAPH_Y + (frame % 4);
  } else {
    y = GRAPH_Y + random(-1, 2);
  }
  waveform[SCREEN_WIDTH - 1] = y;
  frame++;
}

void drawDisplay() {
  display.clearDisplay();
  display.setTextSize(1);
  display.setTextColor(SSD1306_WHITE);

  display.setCursor(0, 0);
  display.print("TEMP:");
  display.setCursor(40, 0);
  display.print(temperature, 1);
  display.print((char)247);
  display.print("C");

  display.setCursor(0, 10);
  display.print("PULSE:");
  display.setCursor(40, 10);
  display.print(pulse);
  display.print(" BPM");

  display.setCursor(0, 20);
  display.print("SpO2:");
  display.setCursor(40, 20);
  display.print(spo2);
  display.print(" %");

  for (int i = 1; i < SCREEN_WIDTH; i++) {
    display.drawLine(i - 1, waveform[i - 1], i, waveform[i], SSD1306_WHITE);
  }

  display.setCursor(5, 52);
  display.print("VITAL SIGNS MONITOR");
  display.display();
}
