/**
 * PulsePet Hardware Sensor Simulation
 * 1. Nexys A7 ADXL362 3-Axis SPI Accelerometer (Gentle Shake & Strong Shake)
 * 2. Nexys A7 ADT7420 I2C Temperature Sensor (15°C to 40°C)
 */

class SensorSimulation {
    constructor() {
        this.isShakeCooldown = false;
        this.temperature = 24; // Default 24°C (Normal)
    }

    init() {
        const tempSlider = document.getElementById('temp-slider');
        const tempValEl = document.getElementById('temp-value-display');

        if (tempSlider) {
            tempSlider.value = this.temperature;
            tempSlider.addEventListener('input', (e) => {
                this.setTemperature(Number(e.target.value));
            });
        }
        if (tempValEl) {
            tempValEl.textContent = `${this.temperature}°C`;
        }
    }

    gentleShake() {
        if (this.isShakeCooldown) return;
        const state = window.pulseGameState.currentState;
        if (state === GameStates.WELCOME || state === GameStates.CUSTOMIZE || state === GameStates.GAME_OVER) return;

        this.isShakeCooldown = true;

        // If pet was sleeping, gentle shake wakes it up!
        if (state === GameStates.SLEEP) {
            window.pulseActions.wake();
            if (window.showSpeechBubble) window.showSpeechBubble('Oh! You woke me up with a gentle shake! ☀️', 2500);
        } else {
            if (window.pulseAnimation) {
                window.pulseAnimation.triggerActionAnimation('gentle-shake');
            }
            if (window.pulseAudio) {
                window.pulseAudio.playHappy();
            }
            if (window.pulseStats) {
                window.pulseStats.modifyHappiness(10);
            }
            if (window.showSpeechBubble) window.showSpeechBubble('Giggle! That was a fun shake! ✨', 2000);
        }

        setTimeout(() => {
            this.isShakeCooldown = false;
        }, 1500);
    }

    strongShake() {
        if (this.isShakeCooldown) return;
        const state = window.pulseGameState.currentState;
        if (state === GameStates.WELCOME || state === GameStates.CUSTOMIZE || state === GameStates.GAME_OVER) return;

        this.isShakeCooldown = true;
        window.pulseGameState.isDizzy = true;

        if (window.pulseAnimation) {
            window.pulseAnimation.triggerActionAnimation('strong-shake');
        }
        if (window.pulseAudio) {
            window.pulseAudio.playDizzy();
        }

        if (window.showSpeechBubble) window.showSpeechBubble('Whoa... the room is spinning... @_@', 3000);

        // 3-second dizzy state before recovering
        setTimeout(() => {
            window.pulseGameState.isDizzy = false;
            this.isShakeCooldown = false;
            if (window.pulseAnimation) {
                window.pulseAnimation.setExpression(window.pulseAnimation.getExpressionFromStats());
            }
            if (window.showSpeechBubble) window.showSpeechBubble('Phew! I have my balance back! 😊', 2000);
        }, 3200);
    }

    setTemperature(celsius) {
        this.temperature = Math.max(15, Math.min(40, celsius));
        window.pulseGameState.temperature = this.temperature;

        const tempValEl = document.getElementById('temp-value-display');
        const tempStatusEl = document.getElementById('temp-status-tag');

        if (tempValEl) tempValEl.textContent = `${this.temperature}°C`;

        if (this.temperature < 20) {
            if (tempStatusEl) {
                tempStatusEl.textContent = '❄️ COLD';
                tempStatusEl.className = 'badge-temp badge-cold';
            }
            if (window.pulseAnimation && window.pulseGameState.currentState === GameStates.NORMAL) {
                window.pulseAnimation.setExpression('sick');
            }
            if (window.showSpeechBubble) window.showSpeechBubble('Brrr... it\'s chilly! *shivers* ❄️', 2000);
        } else if (this.temperature > 28) {
            if (tempStatusEl) {
                tempStatusEl.textContent = '🔥 HOT';
                tempStatusEl.className = 'badge-temp badge-hot';
            }
            if (window.pulseAnimation && window.pulseGameState.currentState === GameStates.NORMAL) {
                window.pulseAnimation.setExpression('sick');
            }
            if (window.showSpeechBubble) window.showSpeechBubble('Phew... so hot! *sweats* ☀️', 2000);
        } else {
            if (tempStatusEl) {
                tempStatusEl.textContent = '🌿 COZY';
                tempStatusEl.className = 'badge-temp badge-normal';
            }
            if (window.pulseAnimation && window.pulseGameState.currentState === GameStates.NORMAL) {
                window.pulseAnimation.setExpression(window.pulseAnimation.getExpressionFromStats());
            }
        }

        // Update hardware RGB LED
        if (window.updateRgbLed) {
            window.updateRgbLed();
        }
    }
}

window.pulseSensors = new SensorSimulation();
