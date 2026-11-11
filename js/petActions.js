/**
 * PulsePet Care Actions
 * Feed, Play, Medicine, Sleep/Wake
 */

class PetActions {
    constructor() {
        this.isBusy = false;
    }

    canPerformAction() {
        const state = window.pulseGameState.currentState;
        if (this.isBusy) return false;
        if (state === GameStates.WELCOME || state === GameStates.CUSTOMIZE || state === GameStates.GAME_OVER) {
            return false;
        }
        return true;
    }

    feed() {
        if (!this.canPerformAction()) return;
        const state = window.pulseGameState.currentState;
        if (state === GameStates.SLEEP) {
            window.showSpeechBubble("Shh, I'm sleeping! (Wake me first)", 2000);
            return;
        }

        this.isBusy = true;

        // Visual Food Animation
        this.spawnFloatingItem('🍙', 'anim-float-feed');

        if (window.pulseAnimation) {
            window.pulseAnimation.triggerActionAnimation('feed');
        }

        if (window.pulseAudio) {
            window.pulseAudio.playNom();
        }

        window.pulseStats.modifyHunger(25);
        window.pulseStats.modifyHappiness(5);

        const praises = ['Yummy! 🍙', 'Delicious! ✨', 'Nom nom nom! 😋', 'Thank you! 💕'];
        const msg = praises[Math.floor(Math.random() * praises.length)];
        window.showSpeechBubble(msg, 2000);

        setTimeout(() => {
            this.isBusy = false;
        }, 1500);
    }

    play() {
        if (!this.canPerformAction()) return;
        const state = window.pulseGameState.currentState;
        if (state === GameStates.SLEEP) {
            window.showSpeechBubble("Zzz... I'm too sleepy right now! 💤", 2000);
            return;
        }

        this.isBusy = true;

        // Visual Sparkles & Hearts
        this.spawnFloatingItem('💖', 'anim-float-heart');
        this.spawnFloatingItem('⭐', 'anim-float-star');

        if (window.pulseAnimation) {
            window.pulseAnimation.triggerActionAnimation('play');
        }

        if (window.pulseAudio) {
            window.pulseAudio.playHappy();
        }

        window.pulseStats.modifyHappiness(25);
        window.pulseStats.modifyHunger(-5);

        const praises = ['Wheee! 🎉', 'So much fun! ✨', 'Yay, let\'s play more! 💕', 'Hehehe! 😊'];
        const msg = praises[Math.floor(Math.random() * praises.length)];
        window.showSpeechBubble(msg, 2000);

        setTimeout(() => {
            this.isBusy = false;
        }, 1800);
    }

    medicine() {
        if (!this.canPerformAction()) return;

        this.isBusy = true;

        // Visual Pill Animation
        this.spawnFloatingItem('💊', 'anim-float-med');

        if (window.pulseAnimation) {
            window.pulseAnimation.triggerActionAnimation('medicine');
        }

        if (window.pulseAudio) {
            window.pulseAudio.playHeal();
        }

        window.pulseStats.modifyHealth(30);

        const praises = ['I feel so much better! 💖', 'All healed up! 🌟', 'Thank you for taking care of me! 🥰'];
        const msg = praises[Math.floor(Math.random() * praises.length)];
        window.showSpeechBubble(msg, 2000);

        setTimeout(() => {
            this.isBusy = false;
        }, 1500);
    }

    toggleSleep() {
        const state = window.pulseGameState.currentState;
        if (state === GameStates.SLEEP) {
            this.wake();
        } else if (state === GameStates.NORMAL) {
            this.sleep();
        }
    }

    sleep() {
        if (!this.canPerformAction()) return;
        window.pulseGameState.setState(GameStates.SLEEP);

        if (window.pulseAnimation) {
            window.pulseAnimation.setExpression('sleeping');
        }

        if (window.pulseAudio) {
            window.pulseAudio.playClick();
        }

        window.showSpeechBubble('Good night... Zzz 🌙', 2500);
        this.updateSleepUI(true);
    }

    wake() {
        window.pulseGameState.setState(GameStates.NORMAL);

        if (window.pulseAnimation) {
            window.pulseAnimation.triggerActionAnimation('gentle-shake');
        }

        if (window.pulseAudio) {
            window.pulseAudio.playHappy();
        }

        window.showSpeechBubble('Good morning! Ready to play! ☀️', 2500);
        this.updateSleepUI(false);
    }

    updateSleepUI(isSleeping) {
        const sleepBtn = document.getElementById('btn-sleep');
        const sleepIcon = document.getElementById('sleep-btn-icon');
        const sleepText = document.getElementById('sleep-btn-text');
        const viewport = document.getElementById('vga-viewport');

        if (isSleeping) {
            if (sleepBtn) sleepBtn.classList.add('btn-active-sleep');
            if (sleepIcon) sleepIcon.textContent = '☀️';
            if (sleepText) sleepText.textContent = 'Wake';
            if (viewport) viewport.classList.add('viewport-night');
        } else {
            if (sleepBtn) sleepBtn.classList.remove('btn-active-sleep');
            if (sleepIcon) sleepIcon.textContent = '🌙';
            if (sleepText) sleepText.textContent = 'Sleep';
            if (viewport) viewport.classList.remove('viewport-night');
        }
    }

    spawnFloatingItem(emoji, animClass) {
        const container = document.getElementById('pet-interaction-fx');
        if (!container) return;

        const el = document.createElement('div');
        el.className = `floating-fx ${animClass}`;
        el.textContent = emoji;
        container.appendChild(el);

        setTimeout(() => {
            if (el.parentNode) {
                el.parentNode.removeChild(el);
            }
        }, 1500);
    }
}

window.pulseActions = new PetActions();

