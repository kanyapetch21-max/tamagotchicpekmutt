/**
 * PulsePet Master Controller
 * CPE222 Digital Electronics & Logic Design
 * Nexys A7 FPGA Prototype
 */

document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    console.log('[PulsePet] Initializing game system...');

    // 1. Initialize character rendering
    const petContainer = document.getElementById('pet-display-area');
    if (petContainer) {
        window.pulseAnimation.init(petContainer);
    }

    // 2. Initialize subsystems
    window.pulseStats.init();
    window.pulseICU.init();
    window.pulseSensors.init();
    window.pulseCustomization.init();

    // 3. Setup UI event bindings
    bindUIEvents();

    // 4. Listen to stat updates
    window.pulseStats.onUpdate((stats) => {
        updateStatsUI(stats);
        updateRgbLed();

        // Update pet expression if in normal state
        if (window.pulseGameState.currentState === GameStates.NORMAL) {
            const expr = window.pulseAnimation.getExpressionFromStats();
            window.pulseAnimation.setExpression(expr);
        }
    });

    // 5. Listen to FSM state changes
    window.pulseGameState.onStateChange((newState, oldState, payload) => {
        handleStateTransition(newState, oldState, payload);
    });

    // 6. Setup 7-segment display initial state
    update7Segment('0001');

    console.log('[PulsePet] Ready for play!');
}

function bindUIEvents() {
    // Audio unlock on any first click
    document.addEventListener('click', () => {
        if (window.pulseAudio) window.pulseAudio.init();
    }, { once: true });

    // Welcome Screen: Start Button
    const welcomeStartBtn = document.getElementById('btn-welcome-start');
    const welcomePet = document.getElementById('welcome-pet-preview');
    const startAction = () => {
        if (window.pulseAudio) window.pulseAudio.playClick();
        window.pulseGameState.setState(GameStates.CUSTOMIZE);
    };
    if (welcomeStartBtn) welcomeStartBtn.addEventListener('click', startAction);
    if (welcomePet) {
        welcomePet.style.cursor = 'pointer';
        welcomePet.addEventListener('click', startAction);
    }

    // Care Action Buttons
    const btnFeed = document.getElementById('btn-feed');
    const btnPlay = document.getElementById('btn-play');
    const btnMed = document.getElementById('btn-medicine');
    const btnSleep = document.getElementById('btn-sleep');

    if (btnFeed) btnFeed.addEventListener('click', () => window.pulseActions.feed());
    if (btnPlay) btnPlay.addEventListener('click', () => window.pulseActions.play());
    if (btnMed) btnMed.addEventListener('click', () => window.pulseActions.medicine());
    if (btnSleep) btnSleep.addEventListener('click', () => window.pulseActions.toggleSleep());

    // Motion Simulation Buttons
    const btnGentleShake = document.getElementById('btn-gentle-shake');
    const btnStrongShake = document.getElementById('btn-strong-shake');
    if (btnGentleShake) btnGentleShake.addEventListener('click', () => window.pulseSensors.gentleShake());
    if (btnStrongShake) btnStrongShake.addEventListener('click', () => window.pulseSensors.strongShake());

    // ICU Minigame Confirm Button
    const btnIcuConfirm = document.getElementById('btn-icu-confirm');
    if (btnIcuConfirm) {
        btnIcuConfirm.addEventListener('click', () => {
            window.pulseICU.confirmTreatment();
        });
    }

    // Success Screen: Continue Button
    const btnSuccessContinue = document.getElementById('btn-success-continue');
    if (btnSuccessContinue) {
        btnSuccessContinue.addEventListener('click', () => {
            if (window.pulseAudio) window.pulseAudio.playHappy();
            window.pulseGameState.setState(GameStates.NORMAL);
            window.showSpeechBubble("I feel wonderful! Let's play together! 💖", 3000);
        });
    }

    // Game Over Screen: Restart Button
    const btnRestart = document.getElementById('btn-gameover-restart');
    if (btnRestart) {
        btnRestart.addEventListener('click', () => {
            if (window.pulseAudio) window.pulseAudio.playClick();
            window.pulseStats.reset();
            window.pulseGameState.reset();
            window.pulseGameState.setState(GameStates.CUSTOMIZE);
        });
    }

    // Speed Mode Toggle: NORMAL / FAST
    const speedToggleBtn = document.getElementById('btn-speed-toggle');
    if (speedToggleBtn) {
        speedToggleBtn.addEventListener('click', () => {
            const current = window.pulseGameState.speedMode;
            const next = current === 'NORMAL' ? 'FAST' : 'NORMAL';
            window.pulseStats.setSpeed(next);
            speedToggleBtn.textContent = next === 'FAST' ? '⚡ FAST (DEMO)' : '⏳ NORMAL';
            speedToggleBtn.className = `btn-mode-toggle ${next === 'FAST' ? 'mode-fast' : 'mode-normal'}`;
            if (window.pulseAudio) window.pulseAudio.playClick();
        });
    }

    // Audio Mute Toggle
    const soundToggleBtn = document.getElementById('btn-sound-toggle');
    if (soundToggleBtn) {
        soundToggleBtn.addEventListener('click', () => {
            const isMuted = window.pulseAudio.toggleMute();
            soundToggleBtn.innerHTML = isMuted ? '🔇' : '🔊';
            soundToggleBtn.title = isMuted ? 'Unmute Sound' : 'Mute Sound';
        });
    }

    // Developer Test Panel Toggle
    const devToggleBtn = document.getElementById('btn-dev-toggle');
    const devDrawer = document.getElementById('dev-panel-drawer');
    if (devToggleBtn && devDrawer) {
        devToggleBtn.addEventListener('click', () => {
            devDrawer.classList.toggle('dev-open');
        });
    }

    // Developer Quick Stat Setters
    bindDevControls();

    // Keyboard Shortcuts (FPGA Button Emulation)
    document.addEventListener('keydown', (e) => {
        // Do not trigger shortcuts when typing pet name
        if (e.target.tagName === 'INPUT') return;

        switch (e.key.toLowerCase()) {
            case '1':
            case 'f':
                window.pulseActions.feed();
                break;
            case '2':
            case 'p':
                window.pulseActions.play();
                break;
            case '3':
            case 'm':
                window.pulseActions.medicine();
                break;
            case '4':
            case 's':
                window.pulseActions.toggleSleep();
                break;
            case 'g':
                window.pulseSensors.gentleShake();
                break;
            case 'h':
                window.pulseSensors.strongShake();
                break;
            case 'enter':
            case ' ':
                if (window.pulseGameState.currentState === GameStates.WELCOME) {
                    if (window.pulseAudio) window.pulseAudio.playClick();
                    window.pulseGameState.setState(GameStates.CUSTOMIZE);
                } else if (window.pulseGameState.currentState === GameStates.CUSTOMIZE) {
                    window.pulseCustomization.applyAndStart();
                } else if (window.pulseGameState.currentState === GameStates.ICU_GAME) {
                    window.pulseICU.confirmTreatment();
                } else if (window.pulseGameState.currentState === GameStates.RESCUE_SUCCESS) {
                    window.pulseGameState.setState(GameStates.NORMAL);
                } else if (window.pulseGameState.currentState === GameStates.GAME_OVER) {
                    window.pulseStats.reset();
                    window.pulseGameState.reset();
                    window.pulseGameState.setState(GameStates.CUSTOMIZE);
                }
                break;
            case 'd':
                if (devDrawer) devDrawer.classList.toggle('dev-open');
                break;
        }
    });
}

function bindDevControls() {
    const bindBtn = (id, action) => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('click', action);
    };

    // Hunger Setters
    bindBtn('dev-hunger-0', () => window.pulseStats.setStat('hunger', 0));
    bindBtn('dev-hunger-50', () => window.pulseStats.setStat('hunger', 50));
    bindBtn('dev-hunger-100', () => window.pulseStats.setStat('hunger', 100));

    // Happiness Setters
    bindBtn('dev-happy-0', () => window.pulseStats.setStat('happiness', 0));
    bindBtn('dev-happy-50', () => window.pulseStats.setStat('happiness', 50));
    bindBtn('dev-happy-100', () => window.pulseStats.setStat('happiness', 100));

    // Health Setters
    bindBtn('dev-health-10', () => window.pulseStats.setStat('health', 10)); // Critical!
    bindBtn('dev-health-50', () => window.pulseStats.setStat('health', 50));
    bindBtn('dev-health-100', () => window.pulseStats.setStat('health', 100));

    // ICU Actions
    bindBtn('dev-trigger-icu-warn', () => {
        window.pulseStats.setStat('health', 10);
        window.pulseGameState.setState(GameStates.ICU_WARN);
    });

    bindBtn('dev-trigger-icu-game', () => {
        window.pulseGameState.setState(GameStates.ICU_GAME);
    });

    bindBtn('dev-reset-all', () => {
        window.pulseStats.reset();
        window.pulseGameState.setState(GameStates.NORMAL);
        window.showSpeechBubble('Stats reset to 100%!', 2000);
    });
}

function handleStateTransition(newState, oldState, payload) {
    const screens = [
        'screen-welcome',
        'screen-customization',
        'screen-main',
        'screen-icu-warning',
        'screen-icu-game',
        'screen-success',
        'screen-gameover'
    ];

    // Hide all screens
    screens.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.remove('active');
    });

    const vgaContainer = document.getElementById('vga-viewport');
    if (vgaContainer) {
        vgaContainer.classList.remove('vga-emergency', 'viewport-night');
    }

    switch (newState) {
        case GameStates.WELCOME:
            showScreen('screen-welcome');
            update7Segment('0000');
            break;

        case GameStates.CUSTOMIZE:
            showScreen('screen-customization');
            update7Segment('CUST');
            break;

        case GameStates.NORMAL:
            showScreen('screen-main');
            update7Segment(String(window.pulseGameState.petAge).padStart(4, '0'));
            window.pulseActions.updateSleepUI(false);
            if (window.pulseAnimation) {
                window.pulseAnimation.setExpression(window.pulseAnimation.getExpressionFromStats());
            }
            break;

        case GameStates.SLEEP:
            showScreen('screen-main');
            window.pulseActions.updateSleepUI(true);
            update7Segment('SLP0');
            break;

        case GameStates.ICU_WARN:
            showScreen('screen-icu-warning');
            if (vgaContainer) vgaContainer.classList.add('vga-emergency');
            break;

        case GameStates.ICU_GAME:
            showScreen('screen-icu-game');
            if (vgaContainer) vgaContainer.classList.add('vga-emergency');
            break;

        case GameStates.RESCUE_SUCCESS:
            showScreen('screen-success');
            update7Segment('GOOD');
            break;

        case GameStates.GAME_OVER:
            showScreen('screen-gameover');
            update7Segment('DEAD');
            if (window.pulseAudio) window.pulseAudio.playGameOver();
            if (window.pulseAnimation) window.pulseAnimation.setExpression('dead');

            const summaryEl = document.getElementById('gameover-summary');
            if (summaryEl) {
                summaryEl.innerHTML = `
                    <p>Pet: <strong>${window.pulseGameState.petName}</strong></p>
                    <p>Age reached: <strong>${window.pulseGameState.petAge} Day(s)</strong></p>
                    <p>Resting peacefully in the stars ✨</p>
                `;
            }
            break;
    }

    updateRgbLed();
}

function showScreen(screenId) {
    const el = document.getElementById(screenId);
    if (el) {
        el.classList.add('active');
    }
}

function updateStatsUI(stats) {
    // Hunger
    const hungerBar = document.getElementById('bar-hunger');
    const hungerVal = document.getElementById('val-hunger');
    if (hungerBar) hungerBar.style.width = `${stats.hunger}%`;
    if (hungerVal) hungerVal.textContent = `${Math.round(stats.hunger)}%`;

    // Happiness
    const happyBar = document.getElementById('bar-happiness');
    const happyVal = document.getElementById('val-happiness');
    if (happyBar) happyBar.style.width = `${stats.happiness}%`;
    if (happyVal) happyVal.textContent = `${Math.round(stats.happiness)}%`;

    // Health
    const healthBar = document.getElementById('bar-health');
    const healthVal = document.getElementById('val-health');
    if (healthBar) healthBar.style.width = `${stats.health}%`;
    if (healthVal) healthVal.textContent = `${Math.round(stats.health)}%`;

    // Display Age
    const ageVal = document.getElementById('display-pet-age');
    if (ageVal) ageVal.textContent = `Day ${window.pulseGameState.petAge}`;
}

/**
 * Simulates the Nexys A7 RGB Tri-Color LED (LED16 / LED17)
 */
function updateRgbLed() {
    const ledEl = document.getElementById('virtual-rgb-led');
    const ledLabel = document.getElementById('rgb-led-label');
    if (!ledEl) return;

    const state = window.pulseGameState.currentState;
    const stats = window.pulseStats ? window.pulseStats.getStats() : { health: 100, hunger: 100, happiness: 100 };
    const temp = window.pulseGameState.temperature;

    ledEl.className = 'virtual-led';

    if (state === GameStates.ICU_WARN || state === GameStates.ICU_GAME || stats.health <= 15) {
        // Critical Red Strobe
        ledEl.classList.add('led-rgb-critical');
        if (ledLabel) ledLabel.textContent = 'CRITICAL';
    } else if (temp < 20) {
        // Cold Blue
        ledEl.classList.add('led-rgb-blue');
        if (ledLabel) ledLabel.textContent = 'COLD (15-19°C)';
    } else if (temp > 28) {
        // Hot Amber
        ledEl.classList.add('led-rgb-amber');
        if (ledLabel) ledLabel.textContent = 'HOT (>28°C)';
    } else if (stats.hunger < 30 || stats.happiness < 30 || stats.health < 40) {
        // Yellow/Amber Warning
        ledEl.classList.add('led-rgb-amber');
        if (ledLabel) ledLabel.textContent = 'HUNGRY / LOW';
    } else {
        // Normal Healthy Green
        ledEl.classList.add('led-rgb-green');
        if (ledLabel) ledLabel.textContent = 'NORMAL (OK)';
    }
}
window.updateRgbLed = updateRgbLed;

/**
 * Simulates the Nexys A7 Multiplexed 7-Segment Display
 * Shows 4 alphanumeric characters + optional decimal point
 */
function update7Segment(text, hasDot = false) {
    const segContainer = document.getElementById('virtual-7seg-display');
    if (!segContainer) return;

    const clean = String(text).toUpperCase().slice(0, 4).padEnd(4, ' ');
    const chars = clean.split('');

    chars.forEach((ch, idx) => {
        const digitEl = document.getElementById(`seg-digit-${idx}`);
        if (digitEl) {
            digitEl.textContent = ch;
        }
    });

    const dotEl = document.getElementById('seg-decimal-point');
    if (dotEl) {
        dotEl.className = hasDot ? 'seg-dot dot-active' : 'seg-dot';
    }
}
window.update7Segment = update7Segment;

/**
 * Cute Floating Speech Bubble Helper
 */
let speechBubbleTimer = null;
function showSpeechBubble(message, duration = 2500) {
    const bubble = document.getElementById('pet-speech-bubble');
    const textEl = document.getElementById('speech-bubble-text');
    if (!bubble || !textEl) return;

    textEl.textContent = message;
    bubble.classList.remove('hidden', 'anim-pop');
    void bubble.offsetWidth; // Force reflow
    bubble.classList.add('anim-pop');

    if (speechBubbleTimer) clearTimeout(speechBubbleTimer);
    speechBubbleTimer = setTimeout(() => {
        bubble.classList.add('hidden');
    }, duration);
}
window.showSpeechBubble = showSpeechBubble;

