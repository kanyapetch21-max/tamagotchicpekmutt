# PulsePet – FPGA Hardware Implementation Architecture
**Course:** CPE222 Digital Electronics and Logic Design  
**Target Platform:** Digilent Nexys A7-100T (Xilinx Artix-7 `XC7A100T-1CSG324C`)  
**Development Tool:** Xilinx Vivado ML Edition (Verilog HDL)

---

## 1. System Overview

PulsePet is a complete virtual pet system implemented in synthesizable Verilog HDL.
The design bridges interactive digital pet simulation with core logic design concepts:
- Finite State Machines (FSM)
- Combinational Boolean Logic Evaluation (AND, OR, XOR, NOT)
- VGA 640×480 @ 60Hz Video Generator
- Synchronous Counters with Clock Enables
- Time-Division Multiplexed 7-Segment Display Controller
- Pulse Width Modulation (PWM) Tri-Color RGB LED Driver
- SPI Protocol Master for ADXL362 3-Axis Accelerometer

---

## 2. Nexys A7 Hardware Mapping Table

| Web Prototype Feature | Nexys A7 Hardware Element | Pin / Port | Function in Verilog |
| :--- | :--- | :--- | :--- |
| **System Clock** | 100 MHz Oscillator | `E3` (`CLK100MHZ`) | Master synchronous clock |
| **System Reset** | CPU Reset Button | `C12` (`CPU_RESETN`) | Active-low global synchronous reset |
| **Feed / Confirm** | Center Push Button | `N17` (`BTNC`) | Feed action / Confirm ICU logic answer |
| **Play** | Up Push Button | `M18` (`BTNU`) | Play action (+25 Happiness) |
| **Medicine** | Left Push Button | `P17` (`BTNL`) | Medicine action (+30 Health) |
| **Sleep / Wake** | Right Push Button | `M17` (`BTNR`) | Toggle sleep/wake mode |
| **Manual Shake** | Down Push Button | `P18` (`BTND`) | Fallback shake input (if no SPI) |
| **16 Logic Switches** | 16 Slide Switches | `J15`..`V10` (`SW[15:0]`) | Combinational puzzle inputs |
| **16 Switch Status** | 16 Green LEDs | `H17`..`V11` (`LED[15:0]`) | Live feedback of switch states |
| **Pet Status LED** | RGB LED 16 | `N15`, `M16`, `R12` | Red (Critical), Green (OK), Blue (Cold) |
| **Pet Age / Countdown** | 8-Digit 7-Seg Display | `T10`..`L18`, `J17`..`U13` | Shows pet age or ICU 10.0s countdown |
| **VGA 640×480 Video** | 12-Bit Color VGA DAC | `A3`..`D8`, `B11`, `B12` | 640×480 @ 60Hz screen rendering |
| **Motion Sensor** | ADXL362 3-Axis Accel | `E15`, `F14`, `F15`, `D15` | SPI bus motion detection |
| **Temperature Sensor**| ADT7420 I2C Sensor | `C14`, `C15` | Ambient temperature sensing |

---

## 3. Verilog Module Hierarchy

```
pulsepet_top (Top-Level Integration)
├── clk_divider_25mhz       (MMCM / Clock Wizard: 100MHz -> 25.175MHz VGA clock)
├── button_debouncers       (Debounce BTNC, BTNU, BTNL, BTNR, BTND with 20ms filter)
├── game_fsm                (8-State FSM matching gameState.js)
├── pet_stats_core          (Hunger, Happiness, Health 7-bit counters with tick enables)
├── icu_logic_evaluator     (Combinational Boolean logic engine for SW[15:0])
├── vga_controller          (640x480 @ 60Hz timing generator: HSYNC, VSYNC, X, Y)
├── graphics_renderer       (Sprite coordinate comparisons, status bars, room tiles)
├── seven_seg_controller    (1kHz multiplexer for 8 cathode digits: Age, Timer, Rounds)
├── rgb_pwm_controller      (PWM driver for tri-color status indicator LED16)
└── adxl362_spi_master      (SPI state machine reading X/Y/Z motion registers)
```

---

## 4. VGA 640×480 @ 60Hz Timing Specification

- **Pixel Clock:** `25.175 MHz` (Derived from 100 MHz oscillator)
- **Horizontal Timing (Pixels):**
  - Visible Area: 640
  - Front Porch: 16
  - Sync Pulse: 96
  - Back Porch: 48
  - Total Line: 800 pixels
- **Vertical Timing (Lines):**
  - Visible Area: 480
  - Front Porch: 10
  - Sync Pulse: 2
  - Back Porch: 33
  - Total Frame: 525 lines

---

## 5. FSM State Encoding

```verilog
parameter S_WELCOME        = 3'b000; // Screen 1
parameter S_CUSTOMIZE      = 3'b001; // Screen 2
parameter S_NORMAL         = 3'b010; // Screen 3
parameter S_SLEEP          = 3'b011; // Screen 4
parameter S_ICU_WARN       = 3'b100; // Screen 5 (10s Countdown)
parameter S_ICU_GAME       = 3'b101; // Screen 6 (3-Round Logic Rescue)
parameter S_RESCUE_SUCCESS = 3'b110; // Screen 7
parameter S_GAME_OVER      = 3'b111; // Screen 8
```

---

## 6. How the JavaScript Prototype Translates to Verilog

1. **`js/gameState.js` → `fpga/rtl/game_fsm.v`**:  
   Direct 1:1 mapping of states, transitions, reset conditions, and flags.
2. **`js/logicPuzzle.js` → `fpga/rtl/icu_logic_evaluator.v`**:  
   Pure combinational logic evaluating `sw[15:0]` bitwise operations (`&`, `|`, `^`, `~`).
3. **`js/petStats.js` → `pet_stats_core.v`**:  
   Clamped saturating registers `[6:0]` (0 to 100) incremented/decremented on 1 Hz / 0.5 Hz clock enable pulses.
4. **`js/petAnimation.js` → `graphics_renderer.v`**:  
   Bounding-box hit testers and pixel ROM address generators based on `(x, y)` VGA scan coordinates.
5. **`js/audio.js` → `buzzer_pwm.v`**:  
   Square wave frequencies driving the mono audio PWM output pin on PMOD or onboard audio jack.

