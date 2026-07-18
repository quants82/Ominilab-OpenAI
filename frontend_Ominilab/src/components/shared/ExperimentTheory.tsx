import React from 'react';
import { Info, ListChecks, Cpu, PlugZap } from 'lucide-react';

interface TheoryEntry {
  theory: string;
  hardware: string[];
  setup: string[];
  steps: string[];
}

const theories: Record<string, TheoryEntry> = {
  'harmonic-motion': {
    theory: 'For ideal simple harmonic motion, acceleration is proportional to displacement and points toward equilibrium: a = -ω²x. The period is T = 2π√(m/k).',
    hardware: [
      'ESP32 board (ESP32-C3 Super Mini recommended) powered by a small USB power bank that oscillates with the mass.',
      'BMI160 accelerometer, I2C address 0x69, sampled at 200 Hz in the ±2 g range.',
      'Wiring on ESP32-C3: SCL → GPIO 9, SDA → GPIO 8 (classic ESP32: SCL → GPIO 22, SDA → GPIO 21), plus 3.3 V and GND.',
      'A spring fixed to a stand with a hanging mass (about 50–200 g); tape the sensor and battery rigidly to the mass.',
    ],
    setup: [
      'Flash the "Harmonic Motion" firmware from the Flash ESP32 page (desktop Chrome or Edge).',
      'On first boot join the "Ominilab-Setup-…" Wi-Fi hotspot and enter your Wi-Fi name, password, and backend host in the portal; the board restarts.',
      'Read the device ID starting with ESP32-SHM2- from the serial monitor or setup page.',
      'Enter the device ID above, press Connect, and keep the mass perfectly still while the sensor calibrates.',
    ],
    steps: ['Press Start measuring, pull the mass 3–5 cm from equilibrium, and release it vertically.', 'Let at least six full cycles accumulate so the period converges.', 'Read T, ω, and A, and compare the reconstructed x(t), v(t), and a(t) curves.', 'Optionally vary the mass or spring in the T²–m / T²–1/k survey, export CSV, and ask the AI assistant.'],
  },
  'specific-heat': {
    theory: 'Electrical energy Q = Pt raises the water temperature. Ignoring losses, the specific heat capacity is c = Q/(mΔT). A linear fit improves the estimate.',
    hardware: [
      'ESP32 board with a waterproof DS18B20 temperature probe on GPIO 4 (OneWire, 4.7 kΩ pull-up to 3.3 V).',
      'INA226 voltage/current monitor, I2C address 0x40 (SDA → GPIO 21, SCL → GPIO 22), with its shunt in series with the heater.',
      'A low-voltage immersion heater (or power resistor) driven by a separate DC supply, an insulated cup, and a stirrer.',
      'Optional: 16×2 I2C LCD (0x27/0x3F) for local readout and a push button on GPIO 23.',
    ],
    setup: [
      'Flash the "Specific Heat" firmware, complete the one-time Wi-Fi portal, and note the ESP32-SH- device ID.',
      'Weigh the water, pour it into the insulated cup, and immerse both the probe and the heater without touching the walls.',
      'Enter the device ID, press Connect, and type the water mass in kilograms.',
    ],
    steps: ['Stir gently and record the starting temperature.', 'Switch on the heater and record points across a 10–15 °C rise, stirring before each reading.', 'Stop heating; fit the temperature–time line and read the average electrical power.', 'Compute c = P/(m·slope) and compare it with the accepted 4186 J/(kg·K).'],
  },
  induction: {
    theory: 'Faraday’s law states that the induced emf is proportional to the rate of change of magnetic flux: ε = -dΦ/dt. The sign follows Lenz’s law.',
    hardware: [
      'ESP32 board with an ADS1115 16-bit ADC on I2C (SDA → GPIO 21, SCL → GPIO 22).',
      'An induction coil (several hundred turns) wired to the ADS1115 input.',
      'A strong bar or neodymium magnet to move through the coil.',
      'Two indicator LEDs on GPIO 18 and GPIO 19 that light with the polarity of the induced voltage.',
    ],
    setup: [
      'Flash the "Electromagnetic Induction" firmware and complete the one-time Wi-Fi portal.',
      'Note the ESP32-Induction- device ID, enter it above, and press Connect.',
      'Confirm the live trace responds when you nudge the magnet near the coil.',
    ],
    steps: ['Move the magnet into and out of the coil at different speeds.', 'Compare pulse direction when the magnet enters versus leaves, and when the pole is reversed.', 'Use pause, pan, and zoom to measure peak voltage and pulse duration.', 'Relate faster motion to larger peaks and shorter pulses via ε = -dΦ/dt.'],
  },
  capacitor: {
    theory: 'For an RC circuit, capacitor voltage changes exponentially. During charging, Uc = U0(1-e^(-t/RC)); during discharge, Uc = U0e^(-t/RC).',
    hardware: [
      'ESP32 board with an INA226 monitor, I2C address 0x40 (SDA → GPIO 21, SCL → GPIO 22), measuring the capacitor voltage and current.',
      'A large capacitor (for example a supercapacitor or big electrolytic) with a known series charging resistor.',
      'A switch that selects the charge path (through the supply) or the discharge path (through the load).',
      'An indicator LED on GPIO 2 whose brightness follows the capacitor voltage.',
    ],
    setup: [
      'Flash the "Capacitor" firmware and complete the one-time Wi-Fi portal.',
      'Note the ESP32-Capacitor- device ID, enter it above, and press Connect.',
      'Start with the capacitor fully discharged (hold the discharge position until the voltage reads near zero).',
    ],
    steps: ['Flip the switch to charge and watch the exponential voltage rise and decaying current.', 'Flip to discharge and record the mirrored curve.', 'Estimate the time constant τ = RC from the graph and compare it with the component values.', 'Use the charge and stored-energy views to connect Q = CU and E = ½CU².'],
  },
  'lamp-va': {
    theory: 'A filament lamp is a nonlinear conductor: as the filament heats up, its resistance rises, so the I-V curve bends and I grows more slowly than V.',
    hardware: [
      'ESP32 board with an INA226 monitor (2 mΩ shunt, I2C address 0x40; SDA → GPIO 21, SCL → GPIO 22) in series with the lamp.',
      'A small incandescent lamp (for example 2.5–6 V).',
      'An adjustable DC supply or a potentiometer used to sweep the lamp voltage.',
      'An indicator LED on GPIO 2 that brightens with the measured voltage.',
    ],
    setup: [
      'Flash the "Lamp I-V" firmware and complete the one-time Wi-Fi portal.',
      'Note the ESP32-Lamp- device ID, enter it above, and press Connect.',
      'Set the supply to its minimum before starting.',
    ],
    steps: ['Increase the voltage in small steps; at each step press Record point to store the live V and I.', 'Collect points from zero up to the rated lamp voltage.', 'Fit the nonlinear power-law curve and inspect the instantaneous resistance rising with V.', 'Save the curve, then repeat with another lamp and compare the two curves.'],
  },
  'resistor-va': {
    theory: 'An ohmic resistor keeps an approximately constant resistance, so its I-V graph is a straight line through the origin with slope 1/R (Ohm’s law: I = V/R).',
    hardware: [
      'ESP32 board with an INA226 monitor (2 mΩ shunt, I2C address 0x40; SDA → GPIO 21, SCL → GPIO 22) in series with the resistor.',
      'A fixed resistor of known nominal value (a few ohms to a few hundred ohms).',
      'An adjustable DC supply or a potentiometer used to sweep the voltage.',
      'An indicator LED on GPIO 2 that brightens with the measured voltage.',
    ],
    setup: [
      'Flash the "Resistor I-V" firmware and complete the one-time Wi-Fi portal.',
      'Note the ESP32-Resistor- device ID, enter it above, and press Connect.',
      'Set the supply to its minimum before starting.',
    ],
    steps: ['Increase the voltage in small steps; at each step press Record point to store the live V and I.', 'Collect at least five well-spaced points.', 'Fit the linear regression and read the resistance from the slope.', 'Compare the measured resistance with the nominal value and discuss the deviation.'],
  },
};

export function ExperimentTheory({ id }: { id: string }) {
  const data = theories[id];
  if (!data) return null;
  return <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
    <div className="grid gap-8 md:grid-cols-2">
      <div>
        <h3 className="flex items-center gap-2 text-lg font-black text-slate-900"><Info className="text-blue-600" size={20}/>Physics principle</h3>
        <p className="mt-4 rounded-2xl bg-slate-50 p-5 text-sm leading-relaxed text-slate-600">{data.theory}</p>
      </div>
      <div>
        <h3 className="flex items-center gap-2 text-lg font-black text-slate-900"><Cpu className="text-violet-600" size={20}/>Hardware &amp; wiring</h3>
        <ul className="mt-4 space-y-2">
          {data.hardware.map((item) => <li key={item} className="flex gap-2 text-sm leading-relaxed text-slate-600"><span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-violet-400"/>{item}</li>)}
        </ul>
      </div>
      <div>
        <h3 className="flex items-center gap-2 text-lg font-black text-slate-900"><PlugZap className="text-amber-600" size={20}/>Setup &amp; connection</h3>
        <ol className="mt-4 space-y-3">
          {data.setup.map((step, index) => <li key={step} className="flex gap-3 text-sm leading-relaxed text-slate-600"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-black text-amber-700">{index + 1}</span>{step}</li>)}
        </ol>
      </div>
      <div>
        <h3 className="flex items-center gap-2 text-lg font-black text-slate-900"><ListChecks className="text-emerald-600" size={20}/>Procedure</h3>
        <ol className="mt-4 space-y-3">
          {data.steps.map((step, index) => <li key={step} className="flex gap-3 text-sm leading-relaxed text-slate-600"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-black text-blue-700">{index + 1}</span>{step}</li>)}
        </ol>
      </div>
    </div>
  </section>;
}
