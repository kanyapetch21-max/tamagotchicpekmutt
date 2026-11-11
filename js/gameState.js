/**
 * PulsePet Game State Machine
 * Mirrors the Verilog Finite State Machine (FSM) architecture planned for Nexys A7:
 *
 * Verilog State Encoding Reference:
 * parameter S_WELCOME        = 3'b000; // 0
 * parameter S_CUSTOMIZE      = 3'b001; // 1
 * parameter S_NORMAL         = 3'b010; // 2
 * parameter S_SLEEP          = 3'b011; // 3
 * parameter S_ICU_WARN       = 3'b100; // 4
 * parameter S_ICU_GAME       = 3'b101; // 5
 * parameter S_RESCUE_SUCCESS = 3'b110; // 6
 * parameter S_GAME_OVER      = 3'b111; // 7
 */

const GameStates = {
    WELCOME: 'WELCOME',
    CUSTOMIZE: 'CUSTOMIZE',
    NORMAL: 'NORMAL',
    SLEEP: 'SLEEP',
    ICU_WARN: 'ICU_WARN',
    ICU_GAME: 'ICU_GAME',
    RESCUE_SUCCESS: 'RESCUE_SUCCESS',
    GAME_OVER: 'GAME_OVER'
};

class GameStateManager {
    constructor() {
        this.currentState = GameStates.WELCOME;
        this.previousState = null;
        this.listeners = [];

        // Pet Profile
        this.petName = 'PULSE';
        this.petColor = 'pink'; // 'pink' | 'cream' | 'mint' | 'lavender'
        this.petAge = 1; // Days
        this.petAgeMinutes = 0;

        // Flags & Modes
        this.speedMode = 'NORMAL'; // 'NORMAL' | 'FAST'
        this.isDizzy = false;
        this.isEating = false;
        this.isPlaying = false;
        this.isHealed = false;
        this.temperature = 24; // Celsius (15 to 40)
    }

    onStateChange(callback) {
        this.listeners.push(callback);
    }

    setState(newState, payload = {}) {
        if (!GameStates[newState]) {
            console.error(`Invalid state transition attempted: ${newState}`);
            return;
        }

        const oldState = this.currentState;
        this.previousState = oldState;
        this.currentState = newState;

        console.log(`[FSM] State Transition: ${oldState} -> ${newState}`, payload);

        this.listeners.forEach(cb => {
            try {
                cb(newState, oldState, payload);
            } catch (err) {
                console.error('Error in state change callback:', err);
            }
        });
    }

    getState() {
        return this.currentState;
    }

    setPetName(name) {
        // Enforce max 6 chars, uppercase alphanumeric (clean for future FPGA 6-char display ROM)
        const cleanName = (name || 'PULSE').trim().toUpperCase().slice(0, 6) || 'PULSE';
        this.petName = cleanName;
        return this.petName;
    }

    setPetColor(color) {
        const validColors = ['pink', 'cream', 'mint', 'lavender'];
        if (validColors.includes(color)) {
            this.petColor = color;
        }
    }

    incrementAge() {
        this.petAgeMinutes++;
        if (this.petAgeMinutes % 3 === 0) { // Every 3 minutes = 1 virtual pet day
            this.petAge++;
        }
        return this.petAge;
    }

    reset() {
        this.petAge = 1;
        this.petAgeMinutes = 0;
        this.isDizzy = false;
        this.isEating = false;
        this.isPlaying = false;
        this.isHealed = false;
        this.setState(GameStates.CUSTOMIZE);
    }
}

window.GameStates = GameStates;
window.pulseGameState = new GameStateManager();

