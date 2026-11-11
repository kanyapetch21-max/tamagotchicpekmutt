/**
 * PulsePet ICU Emergency & Rescue System
 * Stage 1: 10-Second Critical Warning Countdown
 * Stage 2: 3-Round Digital Logic Rescue Minigame
 */

class ICUSystem {
    constructor() {
        this.countdownTimer = null;
        this.countdownRemaining = 10.0; // Seconds
        this.alarmInterval = null;
        this.ecgInterval = null;
        this.ecgCanvas = null;
        this.ecgCtx = null;
        this.ecgPoints = [];

        this.currentRound = 1;
        this.totalRounds = 3;
        this.isEvaluating = false;
    }

    init() {
        // Listen to state transitions
        window.pulseGameState.onStateChange((newState, oldState) => {
            if (newState === GameStates.ICU_WARN) {
                this.startWarning();
            } else if (newState === GameStates.ICU_GAME) {
                this.stopWarning();
                this.startMinigame();
            } else if (newState === GameStates.RESCUE_SUCCESS) {
                this.stopWarning();
                this.handleRescueSuccess();
            } else if (newState === GameStates.GAME_OVER) {
                this.stopWarning();
                this.stopECG();
            } else if (oldState === GameStates.ICU_WARN || oldState === GameStates.ICU_GAME) {
                this.stopWarning();
                this.stopECG();
            }
        });
    }

    // ==========================================
    // STAGE 1: CRITICAL CONDITION WARNING (10s)
    // ==========================================
    startWarning() {
        this.countdownRemaining = 10.0;
        this.updateWarningUI();

        if (window.pulseAnimation) {
            window.pulseAnimation.setExpression('critical');
        }

        // Start countdown at 100ms precision for realistic 7-seg countdown (10.0, 09.9...)
        if (this.countdownTimer) clearInterval(this.countdownTimer);
        this.countdownTimer = setInterval(() => {
            // Check if health has recovered > 15
            if (window.pulseStats && window.pulseStats.health > 15) {
                this.stopWarning();
                window.pulseGameState.setState(GameStates.NORMAL);
                if (window.showBannerMessage) {
                    window.showBannerMessage('Crisis averted! Health stabilized.', 'success');
                }
                return;
            }

            this.countdownRemaining = Math.max(0, +(this.countdownRemaining - 0.1).toFixed(1));
            this.updateWarningUI();

            if (this.countdownRemaining <= 0) {
                this.stopWarning();
                // Transition to ICU Minigame!
                window.pulseGameState.setState(GameStates.ICU_GAME);
            }
        }, 100);

        // Alarm sound every 1.2 seconds
        if (this.alarmInterval) clearInterval(this.alarmInterval);
        this.alarmInterval = setInterval(() => {
            if (window.pulseGameState.currentState === GameStates.ICU_WARN) {
                if (window.pulseAudio) window.pulseAudio.playAlarm();
            }
        }, 1200);
        if (window.pulseAudio) window.pulseAudio.playAlarm();
    }

    stopWarning() {
        if (this.countdownTimer) {
            clearInterval(this.countdownTimer);
            this.countdownTimer = null;
        }
        if (this.alarmInterval) {
            clearInterval(this.alarmInterval);
            this.alarmInterval = null;
        }
    }

    updateWarningUI() {
        const timerEl = document.getElementById('icu-countdown-display');
        if (timerEl) {
            timerEl.textContent = this.countdownRemaining.toFixed(1) + 's';
        }

        // Update 7-segment display with countdown
        if (window.update7Segment) {
            const formatted = this.countdownRemaining.toFixed(1).replace('.', '');
            window.update7Segment(formatted.padStart(4, '0'), true);
        }
    }

    // ==========================================
    // STAGE 2: ICU RESCUE MINIGAME (3 ROUNDS)
    // ==========================================
    startMinigame() {
        this.currentRound = 1;
        this.totalRounds = 3;
        this.isEvaluating = false;

        window.pulseLogicPuzzle.resetSwitches();
        this.loadRound(this.currentRound);
        this.initECG();
        this.updateMinigameUI();

        if (window.pulseAudio) {
            window.pulseAudio.playHeartbeat(true);
        }
    }

    loadRound(roundNum) {
        this.currentRound = roundNum;
        const puzzle = window.pulseLogicPuzzle.startRound(roundNum);

        // Update puzzle text in UI
        const formulaEl = document.getElementById('icu-puzzle-formula');
        const hintEl = document.getElementById('icu-puzzle-hint');
        const roundBadgeEl = document.getElementById('icu-round-indicator');

        if (formulaEl) formulaEl.textContent = puzzle.formula;
        if (hintEl) hintEl.textContent = puzzle.hint;
        if (roundBadgeEl) roundBadgeEl.textContent = `ROUND ${this.currentRound} / ${this.totalRounds}`;

        this.renderSwitches();
        this.updateLiveEvaluation();

        // Update 7-segment display: "r-01", "r-02", "r-03"
        if (window.update7Segment) {
            window.update7Segment(`000${this.currentRound}`);
        }
    }

    renderSwitches() {
        const switchGrid = document.getElementById('icu-switches-grid');
        if (!switchGrid) return;

        // Render SW15 down to SW0 (standard Nexys A7 left-to-right order)
        let html = '';
        for (let i = 15; i >= 0; i--) {
            const val = window.pulseLogicPuzzle.getSwitch(i);
            const isInvolved = this.isSwitchInvolved(i);
            html += `
                <div class="sw-unit ${isInvolved ? 'sw-highlight' : ''}" data-sw="${i}">
                    <div class="sw-led ${val ? 'led-on' : 'led-off'}" id="sw-led-${i}"></div>
                    <div class="sw-body ${val ? 'sw-up' : 'sw-down'}" onclick="window.pulseICU.handleSwitchToggle(${i})">
                        <div class="sw-slot">
                            <div class="sw-toggle-knob"></div>
                        </div>
                    </div>
                    <div class="sw-label">SW${i}</div>
                    <div class="sw-val">${val}</div>
                </div>
            `;
        }
        switchGrid.innerHTML = html;
    }

    isSwitchInvolved(swIndex) {
        if (!window.pulseLogicPuzzle.currentPuzzle) return false;
        return window.pulseLogicPuzzle.currentPuzzle.switches.includes(swIndex);
    }

    handleSwitchToggle(swIndex) {
        if (this.isEvaluating) return;
        const newVal = window.pulseLogicPuzzle.toggleSwitch(swIndex);

        // Update UI for this switch
        const ledEl = document.getElementById(`sw-led-${swIndex}`);
        const swUnit = document.querySelector(`.sw-unit[data-sw="${swIndex}"]`);
        const swBody = swUnit ? swUnit.querySelector('.sw-body') : null;
        const swVal = swUnit ? swUnit.querySelector('.sw-val') : null;

        if (ledEl) {
            ledEl.className = `sw-led ${newVal ? 'led-on' : 'led-off'}`;
        }
        if (swBody) {
            swBody.className = `sw-body ${newVal ? 'sw-up' : 'sw-down'}`;
        }
        if (swVal) {
            swVal.textContent = newVal;
        }

        this.updateLiveEvaluation();
    }

    updateLiveEvaluation() {
        const evalResult = window.pulseLogicPuzzle.evaluateCurrent();
        const liveEl = document.getElementById('icu-live-eval');
        if (liveEl) {
            liveEl.innerHTML = `
                <div class="eval-row">
                    <span class="eval-expr">${evalResult.explanation}</span>
                    <span class="eval-status ${evalResult.isMatch ? 'status-match' : 'status-pending'}">
                        ${evalResult.isMatch ? '✓ SOLVED' : '• WAITING FOR MATCH'}
                    </span>
                </div>
            `;
        }
    }

    confirmTreatment() {
        if (this.isEvaluating) return;
        this.isEvaluating = true;

        const evalResult = window.pulseLogicPuzzle.evaluateCurrent();
        const feedbackEl = document.getElementById('icu-feedback-banner');

        if (evalResult.isMatch) {
            // SUCCESSFUL ROUND
            if (window.pulseAudio) window.pulseAudio.playSuccess();
            if (feedbackEl) {
                feedbackEl.className = 'icu-feedback feedback-success anim-pop';
                feedbackEl.textContent = `ROUND ${this.currentRound} CLEARED! PERFECT LOGIC!`;
            }

            // Update round progress dots
            const dot = document.getElementById(`round-dot-${this.currentRound}`);
            if (dot) dot.classList.add('dot-cleared');

            setTimeout(() => {
                if (this.currentRound < this.totalRounds) {
                    if (feedbackEl) feedbackEl.className = 'icu-feedback hidden';
                    this.isEvaluating = false;
                    this.loadRound(this.currentRound + 1);
                } else {
                    // ALL 3 ROUNDS PASSED -> RESCUE SUCCESS!
                    this.isEvaluating = false;
                    window.pulseGameState.setState(GameStates.RESCUE_SUCCESS);
                }
            }, 1200);

        } else {
            // FAILED ROUND -> IMMEDIATE RESCUE FAILURE -> GAME OVER
            if (window.pulseAudio) window.pulseAudio.playBuzzer();
            if (feedbackEl) {
                feedbackEl.className = 'icu-feedback feedback-failure anim-shake';
                feedbackEl.textContent = `RESCUE FAILED: Incorrect switch state! Target was ${evalResult.targetResult}.`;
            }

            setTimeout(() => {
                this.isEvaluating = false;
                window.pulseGameState.setState(GameStates.GAME_OVER, { cause: 'icu_failure' });
            }, 1600);
        }
    }

    handleRescueSuccess() {
        this.stopECG();
        // Restore Health to a safe 75%
        if (window.pulseStats) {
            window.pulseStats.setStat('health', 75);
            window.pulseStats.modifyHappiness(25);
            window.pulseStats.modifyHunger(20);
        }
        if (window.pulseAnimation) {
            window.pulseAnimation.setExpression('happy');
        }
        if (window.pulseAudio) {
            window.pulseAudio.playSuccess();
        }
    }

    // ==========================================
    // ECG OSCILLOSCOPE ANIMATION
    // ==========================================
    initECG() {
        this.ecgCanvas = document.getElementById('ecg-canvas');
        if (!this.ecgCanvas) return;
        this.ecgCtx = this.ecgCanvas.getContext('2d');
        this.ecgPoints = [];
        const width = this.ecgCanvas.width || 280;
        const height = this.ecgCanvas.height || 60;

        let x = 0;
        let phase = 0;

        if (this.ecgInterval) clearInterval(this.ecgInterval);
        this.ecgInterval = setInterval(() => {
            if (!this.ecgCtx) return;

            // Generate ECG waveform pattern
            let y = height / 2;
            const cycle = phase % 40;

            if (cycle === 10) y -= 5;       // P wave
            else if (cycle === 14) y += 3;  // Q dip
            else if (cycle === 16) y -= 24; // R peak
            else if (cycle === 18) y += 14; // S valley
            else if (cycle === 24) y -= 8;  // T wave
            else y += (Math.random() - 0.5) * 1.5; // Baseline noise

            this.ecgPoints.push({ x, y });
            if (this.ecgPoints.length > width) {
                this.ecgPoints.shift();
                // Shift all points left
                this.ecgPoints.forEach(p => p.x--);
            } else {
                x++;
            }

            phase++;

            // Draw ECG trace
            this.ecgCtx.fillStyle = '#FFF5F8';
            this.ecgCtx.fillRect(0, 0, width, height);

            // Grid lines
            this.ecgCtx.strokeStyle = '#FAD2E1';
            this.ecgCtx.lineWidth = 0.5;
            for (let gx = 0; gx < width; gx += 20) {
                this.ecgCtx.beginPath();
                this.ecgCtx.moveTo(gx, 0);
                this.ecgCtx.lineTo(gx, height);
                this.ecgCtx.stroke();
            }
            for (let gy = 0; gy < height; gy += 15) {
                this.ecgCtx.beginPath();
                this.ecgCtx.moveTo(0, gy);
                this.ecgCtx.lineTo(width, gy);
                this.ecgCtx.stroke();
            }

            // Waveform line
            this.ecgCtx.strokeStyle = '#EC407A';
            this.ecgCtx.lineWidth = 2.5;
            this.ecgCtx.lineCap = 'round';
            this.ecgCtx.lineJoin = 'round';
            this.ecgCtx.beginPath();

            this.ecgPoints.forEach((p, idx) => {
                if (idx === 0) this.ecgCtx.moveTo(p.x, p.y);
                else this.ecgCtx.lineTo(p.x, p.y);
            });
            this.ecgCtx.stroke();
        }, 30);
    }

    stopECG() {
        if (this.ecgInterval) {
            clearInterval(this.ecgInterval);
            this.ecgInterval = null;
        }
    }

    updateMinigameUI() {
        const feedbackEl = document.getElementById('icu-feedback-banner');
        if (feedbackEl) feedbackEl.className = 'icu-feedback hidden';

        for (let i = 1; i <= 3; i++) {
            const dot = document.getElementById(`round-dot-${i}`);
            if (dot) {
                dot.className = `round-dot ${i < this.currentRound ? 'dot-cleared' : i === this.currentRound ? 'dot-active' : ''}`;
            }
        }
    }
}

window.pulseICU = new ICUSystem();
