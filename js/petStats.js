/**
 * PulsePet Stats System
 * Handles Hunger, Happiness, and Health counters (0-100).
 * Driven by timer ticks that emulate FPGA clock dividers and counter registers.
 */

class PetStats {
    constructor() {
        this.hunger = 80;
        this.happiness = 85;
        this.health = 100;

        this.listeners = [];
        this.timer = null;
        this.ageTimer = null;

        // Tick rates in milliseconds
        this.TICK_NORMAL = 3000;
        this.TICK_FAST = 600;
        this.currentTickRate = this.TICK_NORMAL;

        this.isPaused = false;
    }

    init() {
        this.startLoop();
        this.startAgeLoop();
    }

    onUpdate(callback) {
        this.listeners.push(callback);
    }

    notify() {
        const stats = this.getStats();
        this.listeners.forEach(cb => {
            try {
                cb(stats);
            } catch (err) {
                console.error('Error in stats update callback:', err);
            }
        });
    }

    getStats() {
        return {
            hunger: this.hunger,
            happiness: this.happiness,
            health: this.health
        };
    }

    setSpeed(mode) {
        window.pulseGameState.speedMode = mode;
        this.currentTickRate = mode === 'FAST' ? this.TICK_FAST : this.TICK_NORMAL;
        if (this.timer) {
            clearInterval(this.timer);
            this.startLoop();
        }
    }

    startLoop() {
        if (this.timer) clearInterval(this.timer);
        this.timer = setInterval(() => {
            if (!this.isPaused) {
                this.tick();
            }
        }, this.currentTickRate);
    }

    startAgeLoop() {
        if (this.ageTimer) clearInterval(this.ageTimer);
        // Age increments every 30 seconds of real-time play
        this.ageTimer = setInterval(() => {
            if (!this.isPaused && window.pulseGameState.currentState !== GameStates.GAME_OVER && window.pulseGameState.currentState !== GameStates.WELCOME && window.pulseGameState.currentState !== GameStates.CUSTOMIZE) {
                window.pulseGameState.incrementAge();
                this.notify();
            }
        }, 30000);
    }

    pause() {
        this.isPaused = true;
    }

    resume() {
        this.isPaused = false;
    }

    // Called on every timer tick (equivalent to FPGA clk_en pulse)
    tick() {
        const state = window.pulseGameState.currentState;
        if (state === GameStates.WELCOME || state === GameStates.CUSTOMIZE || state === GameStates.GAME_OVER) {
            return;
        }

        // When in ICU warning or ICU minigame, stats are held/special-cased
        if (state === GameStates.ICU_GAME) {
            return;
        }

        // 1. Hunger decay
        if (state === GameStates.SLEEP) {
            // Slower decay while asleep
            this.hunger = Math.max(0, this.hunger - 1);
        } else {
            this.hunger = Math.max(0, this.hunger - 2);
        }

        // 2. Happiness decay
        if (state === GameStates.SLEEP) {
            // Very slow happiness loss during sleep
            this.happiness = Math.max(0, this.happiness - 0.5);
        } else {
            this.happiness = Math.max(0, this.happiness - 2);
        }

        // 3. Temperature influence
        const temp = window.pulseGameState.temperature;
        if (temp < 20) {
            // Cold decreases health slightly
            this.health = Math.max(0, this.health - 1);
        } else if (temp > 28) {
            // Hot decreases happiness slightly
            this.happiness = Math.max(0, this.happiness - 1);
        }

        // 4. Health mechanics
        if (state === GameStates.SLEEP) {
            // Sleep heals slightly if not starving
            if (this.hunger > 20) {
                this.health = Math.min(100, this.health + 1);
            }
        }

        // Hunger penalties
        if (this.hunger <= 0) {
            // Starvation drains health heavily
            this.health = Math.max(0, this.health - 3);
        } else if (this.hunger < 20) {
            this.health = Math.max(0, this.health - 1);
        }

        // Happiness penalties
        if (this.happiness <= 0) {
            this.health = Math.max(0, this.health - 1);
        }

        // 5. ICU Emergency Check
        if (this.health <= 15 && state === GameStates.NORMAL) {
            window.pulseGameState.setState(GameStates.ICU_WARN);
        }

        // Check for fatal health (if reaches 0 outside ICU)
        if (this.health <= 0 && state !== GameStates.ICU_WARN && state !== GameStates.ICU_GAME) {
            window.pulseGameState.setState(GameStates.GAME_OVER);
        }

        this.notify();
    }

    modifyHunger(delta) {
        this.hunger = Math.max(0, Math.min(100, Math.round(this.hunger + delta)));
        this.notify();
    }

    modifyHappiness(delta) {
        this.happiness = Math.max(0, Math.min(100, Math.round(this.happiness + delta)));
        this.notify();
    }

    modifyHealth(delta) {
        this.health = Math.max(0, Math.min(100, Math.round(this.health + delta)));
        this.notify();
    }

    setStat(type, value) {
        const val = Math.max(0, Math.min(100, Number(value)));
        if (type === 'hunger') this.hunger = val;
        if (type === 'happiness') this.happiness = val;
        if (type === 'health') {
            this.health = val;
            if (this.health <= 15 && window.pulseGameState.currentState === GameStates.NORMAL) {
                window.pulseGameState.setState(GameStates.ICU_WARN);
            }
        }
        this.notify();
    }

    reset() {
        this.hunger = 80;
        this.happiness = 85;
        this.health = 100;
        this.notify();
    }
}

window.pulseStats = new PetStats();

