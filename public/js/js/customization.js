/**
 * PulsePet Customization Screen Manager
 * Handles Pet Naming (max 6 characters for future FPGA character ROM)
 * and 4 Pastel Color Selections with live preview.
 */

class CustomizationManager {
    constructor() {
        this.selectedColor = 'pink';
        this.petName = 'PULSE';
        this.previewContainer = null;
    }

    init() {
        this.nameInput = document.getElementById('custom-pet-name');
        this.previewContainer = document.getElementById('custom-pet-preview');
        this.colorButtons = document.querySelectorAll('.color-choice-btn');

        if (this.nameInput) {
            this.nameInput.addEventListener('input', (e) => {
                let clean = e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 6);
                e.target.value = clean;
                this.petName = clean || 'PULSE';
                this.updatePreview();
            });
        }

        if (this.colorButtons) {
            this.colorButtons.forEach(btn => {
                btn.addEventListener('click', () => {
                    const color = btn.getAttribute('data-color');
                    this.setColor(color);
                });
            });
        }

        const startBtn = document.getElementById('btn-custom-start');
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                this.applyAndStart();
            });
        }
    }

    setColor(color) {
        this.selectedColor = color;
        this.colorButtons.forEach(btn => {
            if (btn.getAttribute('data-color') === color) {
                btn.classList.add('selected');
            } else {
                btn.classList.remove('selected');
            }
        });

        if (window.pulseAnimation) {
            window.pulseAnimation.setColor(color);
        }
        this.updatePreview();
    }

    updatePreview() {
        const previewName = document.getElementById('preview-pet-name');
        if (previewName) {
            previewName.textContent = this.petName;
        }
    }

    applyAndStart() {
        window.pulseGameState.setPetName(this.petName);
        window.pulseGameState.setPetColor(this.selectedColor);

        // Update main game display
        const displayName = document.getElementById('display-pet-name');
        if (displayName) displayName.textContent = window.pulseGameState.petName;

        if (window.pulseAnimation) {
            window.pulseAnimation.setColor(this.selectedColor);
            window.pulseAnimation.setExpression('happy');
        }

        if (window.pulseAudio) {
            window.pulseAudio.playHappy();
        }

        // Transition to Main Game
        window.pulseGameState.setState(GameStates.NORMAL);
        window.showSpeechBubble(`Hi there! I'm ${this.petName}! Nice to meet you! 💕`, 3000);
    }
}

window.pulseCustomization = new CustomizationManager();

