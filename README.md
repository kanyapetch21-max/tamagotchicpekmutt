# 🐾 PulsePet – Cute Minimal Tamagotchi
**Interactive Web Game Prototype → Verilog FPGA Implementation**  
**Course:** CPE222 Digital Electronics and Logic Design – KMUTT Final Project  
**Target Hardware:** Digilent Nexys A7-100T FPGA (Xilinx Artix-7)

---

## 🌸 Overview

**PulsePet** is an adorable, Japanese kawaii minimalist Tamagotchi virtual pet game designed as a functional web prototype and hardware specification for the **Nexys A7-100T FPGA board** using Verilog HDL and 640×480 VGA output.

The web prototype implements the complete game logic, character animations, digital logic rescue system, and simulated FPGA hardware inputs/outputs before transferring to synthesizable hardware.

---

## 🎮 How to Play Locally

### Option 1: Direct Browser Play (Zero Dependencies!)
Simply double-click or open **`index.html`** in any modern web browser (Google Chrome, Microsoft Edge, Firefox, Safari).
```
file:///C:/Users/plammy/Desktop/DigitalCircuit/tamagotchicpekmutt/index.html
```

### Option 2: Built-in Lightweight Node Server
Run the zero-dependency local HTTP server:
```sh
node serve.cjs
```
Open **`http://localhost:3000`** in your browser.

### Option 3: Full Vite Dev Server (with TanStack Start)
```sh
npm install
npm run dev
```

---

## ✨ Features Implemented

### 1. Visual Design & Kawaii Aesthetic
- **Soft Pastel Color Palette**: Background `#FFF9F3`, Pastel Pink `#F8BBD0`, Cream `#FFF1D6`, Mint Green `#BFE8D5`, Lavender `#DCC6F5`, Deep Plum Text `#5C5265`.
- **Original Vector Pet**: Scalable SVG character with chubby rounded body, rosy cheeks, stubby arms & feet, and animated expressions.
- **8 Dynamic Expressions**:
  - `Happy`: bouncing, joyful closed eyes `^ ^`, wide open smile `:D`, sparkles.
  - `Normal`: gentle calm smile, automatic periodic blinking.
  - `Hungry`: sad droopy mouth, pleading teary eyes.
  - `Sick`: tired droopy eyelids, sweat droplet.
  - `Sleeping`: peaceful closed eyes `u u`, floating `Zzz`.
  - `Dizzy`: spinning spiral eyes `@ @`, circling stars, wobbling animation.
  - `Critical`: trembling body, distressed eyes `> <`, emergency heartbeat.
  - `Dead / Game Over`: peaceful resting expression `- -` with halo and angel cloud.
- **Idle Animations**: Subtle breathing (scale oscillation), ear wiggles, ground shadow pulsing.

### 2. 640×480 VGA Screen Layout (Nexys A7 Emulation)
- Top Section: Logo, Pet Name, Pet Age, and 3 rounded pastel status bars (Hunger, Happiness, Health) with live numeric percentages.
- Center Section: Adorable pet in pastel room, speech bubble with contextual messages, floating emojis, room decors.
- Bottom Section: 4 interactive care buttons:
  - 🍙 **Feed**: Floating onigiri, chewing animation, +25 Hunger, nom-nom sound.
  - 🎾 **Play**: Jumping animation, +25 Happiness, heart/star bursts, happy chime.
  - 💊 **Medicine**: Healing pill animation, +30 Health, recovery sparkles, heal chime.
  - 🌙 **Sleep / Wake**: Day/night pastel transition, floating `Zzz`, health regeneration.

### 3. Pet Stats System
- Three 0–100 stats: **Hunger**, **Happiness**, and **Health**.
- Dynamic decay timer ticks:
  - `Normal Mode`: stats decay every 3.0s (relaxing play).
  - `Fast Mode`: stats decay every 0.6s (instant demonstration mode).
- Automatic critical detection: when `Health <= 15`, activates the ICU emergency warning!

### 4. Pet Customization
- Pet Name input: max 6 characters (matches FPGA 6-character ROM).
- 4 Pastel Color Palettes: Pastel Pink, Cream, Mint Green, Lavender.
- Live interactive preview with instant recoloring.

### 5. ICU Rescue System (Main Feature)
- **Stage 1 – Critical Warning**:
  - Soft pink emergency border strobe.
  - 10-second countdown displayed on screen and on the virtual 7-segment display.
  - Warning beeps synthesized via Web Audio API.
  - If player administers medicine before countdown reaches 0, health stabilizes and emergency is averted!
  - If countdown expires, transfers to ICU mode.
- **Stage 2 – ICU Rescue Minigame**:
  - Hospital room visual: Medical bed with sick pet under a mint blanket.
  - Live ECG oscilloscope heartbeat monitor drawn on `<canvas>`.
  - 3-Round Combinational Logic Challenge:
    - Round 1: Single/dual gate logic (e.g. `SW2 XOR SW5 = 1`).
    - Round 2: Two-gate combinational logic (e.g. `(SW1 AND SW4) OR SW7 = 1`).
    - Round 3: Multi-switch digital circuit challenge (e.g. `(SW2 XOR SW7) AND (SW11 OR SW14) = 1`).
  - **16 Virtual Switches (`SW0` to `SW15`)**:
    - Modeled directly on the Nexys A7's 16 physical slide switches.
    - Click to toggle (UP=1, DOWN=0) with tactile click sound and green LED indicator.
    - Live real-time evaluation preview showing current Boolean state.
  - Rules:
    - 3 consecutive rounds to save the pet.
    - One incorrect answer causes immediate rescue failure and Game Over!
    - 3 correct answers triggers **Rescue Success**: health restored to 75%, victory fanfare, pet jumps off bed happily!

### 6. Realistic Nexys A7-100T Hardware Simulation Board
- **5 Directional Tactile Push Buttons (Diamond Pattern)**:
  - `● BTNC` (Center - Pin `N17`): Confirm / Feed / Start Game
  - `▲ BTNU` (Up - Pin `M18`): Play Action (+25 Happiness)
  - `◀ BTNL` (Left - Pin `P17`): Medicine Action (+30 Health / Abort ICU Alert)
  - `▶ BTNR` (Right - Pin `M17`): Sleep / Wake Toggle
  - `▼ BTND` (Down - Pin `P18`): Motion Shake (ADXL362 SPI trigger)
  - `CPU_RESETN` (Red button - Pin `C12`): Hardware Master Reset
- **16 Slide Switches (`SW15`..`SW0`) & 16 User LEDs (`LED15`..`LED0`)**:
  - Arranged along the bottom edge of the board with bright green LED indicators when UP (`1`).
  - Directly connected to the ICU combinational logic solver.
- **8-Digit Multiplexed 7-Segment Display (`AN7`..`AN0`)**:
  - Displays `PET- 0001` in normal mode, `Err- 10.0` in ICU emergency, `r-01 0000` in minigame.
- **Interactive Hardware Manual (`📖 คู่มือบอร์ด Nexys A7`)**:
  - Built-in popup modal explaining pin mappings, Verilog `.xdc` pins, switch logic, and hardware guide in Thai.
- **Virtual Tri-Color RGB LED (`LED16`)**:
  - Green = Healthy & Happy, Amber = Hungry / Hot, Blue = Cold (< 20°C), Blinking Red = ICU Emergency.
- **Temperature Sensor (ADT7420 I2C)**:
  - Slider (15°C to 40°C) triggering shiver/sweat and RGB LED changes.
- **Web Audio Sound Synthesizer**:
  - Pure Web Audio API chiptune sound generator (eating crunch, happy arpeggio, healing chime, warning alarm, heartbeat, victory fanfare, error buzzer, switch click).
  - Audio mute/unmute toggle.

### 7. Developer Test Panel
- Collapsible testing panel for quick demonstration:
  - Set Hunger (0, 50, 100)
  - Set Happiness (0, 50, 100)
  - Set Health (10, 50, 100)
  - "🚨 Trigger ICU Warning" button (Health = 10)
  - "🏥 Launch ICU Minigame Directly" button
  - "🔄 Reset All Stats" button

---

## 📁 Project Directory Structure

```
PulsePet/
│
├── index.html                  # Standalone pure HTML5 web entry point
├── serve.cjs                   # Zero-dependency local preview server
├── test_game_logic.cjs         # Automated verification test suite (11/11 tests pass)
│
├── css/
│   ├── style.css               # Pastel design, 640x480 VGA viewport, switches, 7-seg
│   ├── animations.css          # SVG pet keyframes: breathing, bouncing, chewing, dizzy
│   └── responsive.css          # Aspect ratio scaling & responsive layout
│
├── js/
│   ├── main.js                 # App coordinator, screen switcher, hardware output drivers
│   ├── gameState.js            # Master 8-state FSM matching Verilog FSM
│   ├── petStats.js             # Hunger, Happiness, Health counters with tick decay
│   ├── petActions.js           # Feed, Play, Medicine, Sleep, Wake care actions
│   ├── petAnimation.js         # Scalable SVG character renderer & expressions
│   ├── logicPuzzle.js          # Combinational logic puzzle generator & 16-switch evaluator
│   ├── icuSystem.js            # 10s countdown warning & 3-round ICU minigame
│   ├── sensorSimulation.js     # ADXL362 accelerometer & ADT7420 temperature simulation
│   └── audio.js                # Web Audio API chiptune synthesizer
│
├── fpga/
│   ├── README.md               # Nexys A7 FPGA hardware architecture specification
│   ├── constraints/
│   │   └── nexys_a7_100t.xdc   # Master Xilinx pin constraints for Artix-7
│   └── rtl/
│       ├── game_fsm.v          # Synthesizable 8-state master FSM in Verilog
│       └── icu_logic_evaluator.v # Synthesizable Boolean logic puzzle engine for SW[15:0]
│
└── public/                     # Static mirror for Vite / Lovable dev server
```

---

## 🧪 Automated Test Verification

Run the verification test suite:
```sh
node test_game_logic.cjs
```
Results:
```
🧪 Starting PulsePet Automated Test Suite...
  ✓ PASS: FSM: Initial state is WELCOME
  ✓ PASS: FSM: Transitions to CUSTOMIZE, NORMAL, SLEEP, ICU_WARN, ICU_GAME, RESCUE_SUCCESS, GAME_OVER
  ✓ PASS: FSM: Pet Name Clamping (max 6 chars, uppercase)
  ✓ PASS: Stats: Initial bounds and clamping
  ✓ PASS: Stats: Care Action Stat Deltas
  ✓ PASS: Stats: ICU trigger when health <= 15
  ✓ PASS: Logic: 16 Switches toggle properly
  ✓ PASS: Logic: Every puzzle in all 3 pools has at least one valid solution
  ✓ PASS: Logic: Boolean Evaluator Correctness (XOR, AND, OR, NOT)
  ✓ PASS: Sensors: Temperature clamping and thresholds
  ✓ PASS: Sensors: Gentle shake wakes sleeping pet

🎉 Test Suite Finished: 11 of 11 tests passed successfully!
```
