/**
 * PulsePet Web Audio Synthesizer
 * Uses Web Audio API without requiring any external audio files.
 * Provides cute 8-bit / chiptune / pastel sound effects.
 */

class SoundManager {
    constructor() {
        this.ctx = null;
        this.muted = false;
        this.masterVolume = 0.25;
        this.initialized = false;
    }

    init() {
        if (!this.initialized) {
            try {
                const AudioCtx = window.AudioContext || window.webkitAudioContext;
                if (AudioCtx) {
                    this.ctx = new AudioCtx();
                    this.initialized = true;
                }
            } catch (e) {
                console.warn('Web Audio not supported:', e);
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggleMute() {
        this.muted = !this.muted;
        return this.muted;
    }

    setMuted(state) {
        this.muted = Boolean(state);
    }

    // Helper to create oscillator tone
    playTone(freq, type = 'sine', duration = 0.15, startVol = 0.2, endVol = 0.001, delay = 0) {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const startTime = this.ctx.currentTime + delay;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(startVol * this.masterVolume, startTime);
        gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, endVol * this.masterVolume), startTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + duration);
    }

    // Play tactile mechanical click for 16 FPGA switches and buttons
    playClick() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(800, t);
        osc.frequency.exponentialRampToValueAtTime(120, t + 0.03);

        gain.gain.setValueAtTime(0.15 * this.masterVolume, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(t);
        osc.stop(t + 0.03);
    }

    // Eating sound: cute chewing crunch/pop
    playNom() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        // Two quick cute pop nibbles
        const bites = [
            { f1: 320, f2: 600, t: 0 },
            { f1: 400, f2: 750, t: 0.12 },
            { f1: 480, f2: 900, t: 0.24 }
        ];

        bites.forEach(bite => {
            const st = this.ctx.currentTime + bite.t;
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(bite.f1, st);
            osc.frequency.exponentialRampToValueAtTime(bite.f2, st + 0.07);

            gain.gain.setValueAtTime(0.2 * this.masterVolume, st);
            gain.gain.exponentialRampToValueAtTime(0.001, st + 0.07);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(st);
            osc.stop(st + 0.07);
        });
    }

    // Happy play sound: rising sweet arpeggio
    playHappy() {
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
        notes.forEach((freq, idx) => {
            this.playTone(freq, 'sine', 0.16, 0.2, 0.005, idx * 0.08);
        });
    }

    // Medicine heal sound: magical sparkling chime
    playHeal() {
        const notes = [440, 554.37, 659.25, 880, 1108.73]; // A4, C#5, E5, A5, C#6
        notes.forEach((freq, idx) => {
            this.playTone(freq, 'sine', 0.2, 0.18, 0.002, idx * 0.07);
        });
    }

    // Dizzy wobble sound
    playDizzy() {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const st = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        // Wobble frequency up and down
        for (let i = 0; i < 6; i++) {
            const freq = i % 2 === 0 ? 300 : 200;
            osc.frequency.setValueAtTime(freq, st + i * 0.08);
        }

        gain.gain.setValueAtTime(0.12 * this.masterVolume, st);
        gain.gain.exponentialRampToValueAtTime(0.001, st + 0.5);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(st);
        osc.stop(st + 0.5);
    }

    // Warning alarm beep for ICU Warning
    playAlarm() {
        this.playTone(880, 'square', 0.12, 0.15, 0.01, 0);
        this.playTone(659.25, 'square', 0.12, 0.15, 0.01, 0.14);
    }

    // ICU Heartbeat monitor: "lub-dub" sound
    playHeartbeat(isWeak = false) {
        if (this.muted) return;
        this.init();
        if (!this.ctx) return;

        const freq1 = isWeak ? 70 : 90;
        const freq2 = isWeak ? 60 : 75;

        // Lub
        this.playTone(freq1, 'sine', 0.08, 0.25, 0.01, 0);
        // Dub
        this.playTone(freq2, 'sine', 0.09, 0.2, 0.01, 0.12);
    }

    // Rescue Success Fanfare
    playSuccess() {
        const notes = [
            { f: 523.25, d: 0.14, t: 0 },       // C5
            { f: 659.25, d: 0.14, t: 0.12 },    // E5
            { f: 783.99, d: 0.14, t: 0.24 },    // G5
            { f: 1046.50, d: 0.35, t: 0.36 }    // C6
        ];
        notes.forEach(n => {
            this.playTone(n.f, 'triangle', n.d, 0.25, 0.005, n.t);
        });
    }

    // ICU Error buzzer
    playBuzzer() {
        this.playTone(180, 'sawtooth', 0.25, 0.2, 0.01, 0);
        this.playTone(150, 'sawtooth', 0.3, 0.2, 0.01, 0.2);
    }

    // Gentle Game Over lullaby
    playGameOver() {
        const notes = [
            { f: 587.33, d: 0.25, t: 0 },    // D5
            { f: 523.25, d: 0.25, t: 0.25 }, // C5
            { f: 440.00, d: 0.35, t: 0.50 }, // A4
            { f: 392.00, d: 0.5, t: 0.85 }   // G4
        ];
        notes.forEach(n => {
            this.playTone(n.f, 'sine', n.d, 0.18, 0.005, n.t);
        });
    }
}

// Export singleton
window.pulseAudio = new SoundManager();

