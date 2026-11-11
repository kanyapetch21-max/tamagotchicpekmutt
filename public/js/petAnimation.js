/**
 * PulsePet Character Animation & SVG Renderer
 * Renders an original kawaii virtual pet with scalable SVG and CSS animations.
 * Provides live expression changes and color customization.
 */

class PetAnimation {
    constructor() {
        this.currentExpression = 'normal';
        this.currentColor = 'pink';
        this.container = null;
        this.blinkTimer = null;

        // Color Palettes
        this.palettes = {
            pink: {
                name: 'Pastel Pink',
                body: '#F8BBD0',
                bodyGradient: '#FFC4D6',
                belly: '#FFF0F5',
                ears: '#F48FB1',
                blush: '#FF8DA1',
                outline: '#E0859D',
                shadow: '#F0A8BC',
                accent: '#EC407A'
            },
            cream: {
                name: 'Cream',
                body: '#FFF1D6',
                bodyGradient: '#FFF8E7',
                belly: '#FFFFFF',
                ears: '#FFE0B2',
                blush: '#FFAB91',
                outline: '#E6CBA3',
                shadow: '#F3DFC0',
                accent: '#FFA726'
            },
            mint: {
                name: 'Mint Green',
                body: '#BFE8D5',
                bodyGradient: '#D5F5E5',
                belly: '#F0FFF7',
                ears: '#A3D9C0',
                blush: '#FFB6C1',
                outline: '#8BC3A8',
                shadow: '#A8DEC4',
                accent: '#4DB6AC'
            },
            lavender: {
                name: 'Lavender',
                body: '#DCC6F5',
                bodyGradient: '#ECE0FA',
                belly: '#F9F4FF',
                ears: '#CAACF0',
                blush: '#F48FB1',
                outline: '#B095D4',
                shadow: '#CDB1EC',
                accent: '#AB47BC'
            }
        };

        this.initBlinkLoop();
    }

    init(containerElement) {
        this.container = containerElement;
        this.render();
    }

    setColor(colorName) {
        if (this.palettes[colorName]) {
            this.currentColor = colorName;
            this.updateColors();
        }
    }

    setExpression(expression) {
        if (this.currentExpression === expression) return;
        this.currentExpression = expression;
        this.updateFace();
    }

    initBlinkLoop() {
        // Automatic cute blinking every 3.5 - 6 seconds
        const scheduleBlink = () => {
            const delay = 3500 + Math.random() * 2500;
            this.blinkTimer = setTimeout(() => {
                if (this.currentExpression === 'normal' || this.currentExpression === 'happy') {
                    this.blink();
                }
                scheduleBlink();
            }, delay);
        };
        scheduleBlink();
    }

    blink() {
        const eyesEl = document.getElementById('pet-eyes');
        if (!eyesEl) return;
        eyesEl.innerHTML = this.getEyesSVG('blink');
        setTimeout(() => {
            if (this.currentExpression === 'normal' || this.currentExpression === 'happy') {
                eyesEl.innerHTML = this.getEyesSVG(this.currentExpression);
            }
        }, 180);
    }

    getEyesSVG(expr) {
        switch (expr) {
            case 'happy':
                // Closed joyful upward arcs
                return `
                    <path d="M 68 85 Q 78 74 88 85" stroke="#5C5265" stroke-width="4.5" stroke-linecap="round" fill="none" />
                    <path d="M 112 85 Q 122 74 132 85" stroke="#5C5265" stroke-width="4.5" stroke-linecap="round" fill="none" />
                `;
            case 'hungry':
                // Pleading large watery eyes with glossy reflections
                return `
                    <ellipse cx="78" cy="85" rx="8" ry="9" fill="#5C5265" />
                    <circle cx="76" cy="81" r="3.5" fill="#FFFFFF" />
                    <circle cx="81" cy="88" r="1.5" fill="#FFFFFF" />
                    
                    <ellipse cx="122" cy="85" rx="8" ry="9" fill="#5C5265" />
                    <circle cx="120" cy="81" r="3.5" fill="#FFFFFF" />
                    <circle cx="125" cy="88" r="1.5" fill="#FFFFFF" />

                    <!-- Tear glisten -->
                    <circle cx="70" cy="91" r="2.5" fill="#C9E8FA" opacity="0.8" />
                    <circle cx="130" cy="91" r="2.5" fill="#C9E8FA" opacity="0.8" />
                `;
            case 'sick':
                // Tired droopy half-closed eyelids
                return `
                    <ellipse cx="78" cy="87" rx="7" ry="5" fill="#5C5265" />
                    <path d="M 70 84 Q 78 81 86 84" stroke="#5C5265" stroke-width="3" stroke-linecap="round" fill="none" />
                    
                    <ellipse cx="122" cy="87" rx="7" ry="5" fill="#5C5265" />
                    <path d="M 114 84 Q 122 81 130 84" stroke="#5C5265" stroke-width="3" stroke-linecap="round" fill="none" />
                `;
            case 'sleeping':
                // Peaceful closed curved sleeping eyes
                return `
                    <path d="M 68 86 Q 78 93 88 86" stroke="#5C5265" stroke-width="3.5" stroke-linecap="round" fill="none" />
                    <path d="M 112 86 Q 122 93 132 86" stroke="#5C5265" stroke-width="3.5" stroke-linecap="round" fill="none" />
                `;
            case 'dizzy':
                // Cartoon spirals
                return `
                    <path d="M 78 85 m -6 0 a 6 6 0 1 0 12 0 a 4 4 0 1 0 -8 0 a 2 2 0 1 0 4 0" stroke="#5C5265" stroke-width="3" fill="none" stroke-linecap="round" />
                    <path d="M 122 85 m -6 0 a 6 6 0 1 0 12 0 a 4 4 0 1 0 -8 0 a 2 2 0 1 0 4 0" stroke="#5C5265" stroke-width="3" fill="none" stroke-linecap="round" />
                `;
            case 'critical':
                // Distressed tightly shut eyes (> <)
                return `
                    <path d="M 70 80 L 84 86 L 70 92" stroke="#5C5265" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none" />
                    <path d="M 130 80 L 116 86 L 130 92" stroke="#5C5265" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" fill="none" />
                `;
            case 'dead':
                // Peaceful closed resting lines (- -)
                return `
                    <line x1="68" y1="86" x2="86" y2="86" stroke="#5C5265" stroke-width="3.5" stroke-linecap="round" />
                    <line x1="114" y1="86" x2="132" y2="86" stroke="#5C5265" stroke-width="3.5" stroke-linecap="round" />
                `;
            case 'blink':
                // Quick blink slit
                return `
                    <line x1="70" y1="86" x2="86" y2="86" stroke="#5C5265" stroke-width="3.5" stroke-linecap="round" />
                    <line x1="114" y1="86" x2="130" y2="86" stroke="#5C5265" stroke-width="3.5" stroke-linecap="round" />
                `;
            case 'normal':
            default:
                // Cute round black eyes with white gleams
                return `
                    <ellipse cx="78" cy="85" rx="7.5" ry="9" fill="#5C5265" />
                    <circle cx="75" cy="81" r="3" fill="#FFFFFF" />
                    <circle cx="81" cy="88" r="1.5" fill="#FFFFFF" />
                    
                    <ellipse cx="122" cy="85" rx="7.5" ry="9" fill="#5C5265" />
                    <circle cx="119" cy="81" r="3" fill="#FFFFFF" />
                    <circle cx="125" cy="88" r="1.5" fill="#FFFFFF" />
                `;
        }
    }

    getMouthSVG(expr) {
        switch (expr) {
            case 'happy':
                // Joyful open smiling mouth with pink tongue
                return `
                    <path d="M 92 92 Q 100 106 108 92 Z" fill="#FF8DA1" stroke="#5C5265" stroke-width="3" stroke-linejoin="round" />
                    <path d="M 94 94 Q 100 99 106 94" stroke="#FFAAB8" stroke-width="2" fill="none" />
                `;
            case 'hungry':
                // Small sad wavy frown
                return `
                    <path d="M 94 98 Q 100 93 106 98" stroke="#5C5265" stroke-width="3" stroke-linecap="round" fill="none" />
                `;
            case 'sick':
            case 'critical':
                // Trembling squiggly mouth
                return `
                    <path d="M 93 96 Q 96 99 100 96 Q 104 93 107 96" stroke="#5C5265" stroke-width="3" stroke-linecap="round" fill="none" />
                `;
            case 'sleeping':
                // Tiny quiet mouth
                return `
                    <ellipse cx="100" cy="95" rx="2" ry="1.5" fill="#5C5265" />
                `;
            case 'dizzy':
                // Little open 'o' mouth
                return `
                    <ellipse cx="100" cy="97" rx="4" ry="5" fill="#5C5265" />
                `;
            case 'dead':
                // Serene gentle resting curve
                return `
                    <path d="M 95 95 Q 100 97 105 95" stroke="#5C5265" stroke-width="2.5" stroke-linecap="round" fill="none" />
                `;
            case 'normal':
            default:
                // Adorable gentle smile :3 or curved arc
                return `
                    <path d="M 93 92 Q 97 97 100 93 Q 103 97 107 92" stroke="#5C5265" stroke-width="3" stroke-linecap="round" fill="none" />
                `;
        }
    }

    getCheeksSVG(expr) {
        const pal = this.palettes[this.currentColor];
        const blushColor = pal.blush;
        const opacity = (expr === 'happy') ? '0.85' : (expr === 'sick' || expr === 'critical') ? '0.3' : '0.6';

        return `
            <ellipse cx="64" cy="93" rx="8" ry="5" fill="${blushColor}" opacity="${opacity}" />
            <ellipse cx="136" cy="93" rx="8" ry="5" fill="${blushColor}" opacity="${opacity}" />
        `;
    }

    getExtrasSVG(expr) {
        switch (expr) {
            case 'sleeping':
                // Floating Zzz
                return `
                    <g class="anim-zzz">
                        <text x="145" y="65" font-family="'Nunito', sans-serif" font-weight="800" font-size="16" fill="#A592C4">Z</text>
                        <text x="160" y="50" font-family="'Nunito', sans-serif" font-weight="800" font-size="20" fill="#A592C4">z</text>
                        <text x="175" y="32" font-family="'Nunito', sans-serif" font-weight="800" font-size="24" fill="#A592C4">z</text>
                    </g>
                `;
            case 'dizzy':
                // Circling stars
                return `
                    <g class="anim-dizzy-stars">
                        <path d="M 60 45 L 63 51 L 70 51 L 64 55 L 66 61 L 60 57 L 54 61 L 56 55 L 50 51 L 57 51 Z" fill="#FFD54F" />
                        <path d="M 140 45 L 143 51 L 150 51 L 144 55 L 146 61 L 140 57 L 134 61 L 136 55 L 130 51 L 137 51 Z" fill="#FFD54F" />
                        <path d="M 100 35 L 102 40 L 108 40 L 103 44 L 105 49 L 100 46 L 95 49 L 97 44 L 92 40 L 98 40 Z" fill="#FFCA28" />
                    </g>
                `;
            case 'critical':
            case 'sick':
                // Sweat droplet
                return `
                    <g class="anim-sweat">
                        <path d="M 145 60 C 145 60 149 67 149 71 A 4 4 0 0 1 141 71 C 141 67 145 60 145 60 Z" fill="#90CAF9" opacity="0.85" />
                    </g>
                `;
            case 'happy':
                // Tiny sparkle star
                return `
                    <g class="anim-sparkle">
                        <path d="M 150 70 Q 155 75 160 70 Q 155 65 150 70" fill="#FFD54F" />
                        <path d="M 45 75 Q 50 80 55 75 Q 50 70 45 75" fill="#FF8DA1" />
                    </g>
                `;
            case 'dead':
                // Halo & angel wings
                return `
                    <ellipse cx="100" cy="40" rx="25" ry="8" fill="none" stroke="#FFE082" stroke-width="4" stroke-dasharray="2 0" opacity="0.9" />
                    <!-- Tiny peaceful cloud -->
                    <g opacity="0.75" transform="translate(40, 140)">
                        <ellipse cx="60" cy="15" rx="65" ry="15" fill="#FFFFFF" />
                        <ellipse cx="40" cy="5" rx="30" ry="14" fill="#FFFFFF" />
                        <ellipse cx="80" cy="5" rx="35" ry="16" fill="#FFFFFF" />
                    </g>
                `;
            default:
                return '';
        }
    }

    updateColors() {
        const pal = this.palettes[this.currentColor];
        const bodyGrad1 = document.getElementById('body-grad-1');
        const bodyGrad2 = document.getElementById('body-grad-2');
        const belly = document.getElementById('pet-belly');
        const leftEar = document.getElementById('pet-ear-left');
        const rightEar = document.getElementById('pet-ear-right');
        const leftArm = document.getElementById('pet-arm-left');
        const rightArm = document.getElementById('pet-arm-right');
        const leftFoot = document.getElementById('pet-foot-left');
        const rightFoot = document.getElementById('pet-foot-right');

        if (bodyGrad1) bodyGrad1.setAttribute('stop-color', pal.bodyGradient);
        if (bodyGrad2) bodyGrad2.setAttribute('stop-color', pal.body);
        if (belly) belly.setAttribute('fill', pal.belly);
        if (leftEar) leftEar.setAttribute('fill', pal.ears);
        if (rightEar) rightEar.setAttribute('fill', pal.ears);
        if (leftArm) leftArm.setAttribute('fill', pal.body);
        if (rightArm) rightArm.setAttribute('fill', pal.body);
        if (leftFoot) leftFoot.setAttribute('fill', pal.ears);
        if (rightFoot) rightFoot.setAttribute('fill', pal.ears);

        const cheeksEl = document.getElementById('pet-cheeks');
        if (cheeksEl) cheeksEl.innerHTML = this.getCheeksSVG(this.currentExpression);
    }

    updateFace() {
        const eyesEl = document.getElementById('pet-eyes');
        const mouthEl = document.getElementById('pet-mouth');
        const cheeksEl = document.getElementById('pet-cheeks');
        const extrasEl = document.getElementById('pet-extras');
        const petWrapper = document.getElementById('pulsepet-character');

        if (eyesEl) eyesEl.innerHTML = this.getEyesSVG(this.currentExpression);
        if (mouthEl) mouthEl.innerHTML = this.getMouthSVG(this.currentExpression);
        if (cheeksEl) cheeksEl.innerHTML = this.getCheeksSVG(this.currentExpression);
        if (extrasEl) extrasEl.innerHTML = this.getExtrasSVG(this.currentExpression);

        if (petWrapper) {
            petWrapper.className = `pulsepet-svg-wrapper state-${this.currentExpression}`;
        }
    }

    render() {
        if (!this.container) return;
        const pal = this.palettes[this.currentColor];

        this.container.innerHTML = `
            <div id="pulsepet-character" class="pulsepet-svg-wrapper state-${this.currentExpression}">
                <svg viewBox="0 0 200 180" width="100%" height="100%" class="pulsepet-svg" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <!-- Pet Body Soft Gradient -->
                        <linearGradient id="petBodyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop id="body-grad-1" offset="0%" stop-color="${pal.bodyGradient}" />
                            <stop id="body-grad-2" offset="100%" stop-color="${pal.body}" />
                        </linearGradient>
                        <!-- Soft Drop Shadow -->
                        <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
                            <feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="#5C5265" flood-opacity="0.12" />
                        </filter>
                    </defs>

                    <!-- Shadow Under Pet -->
                    <ellipse id="pet-ground-shadow" cx="100" cy="155" rx="55" ry="11" fill="#5C5265" opacity="0.15" class="anim-shadow" />

                    <!-- Accessories & Extras Behind (Halo, Cloud, etc.) -->
                    <g id="pet-extras-back"></g>

                    <!-- Cute Stubby Feet -->
                    <g id="pet-feet" class="anim-feet">
                        <ellipse id="pet-foot-left" cx="80" cy="146" rx="14" ry="9" fill="${pal.ears}" stroke="#5C5265" stroke-width="2.5" />
                        <ellipse id="pet-foot-right" cx="120" cy="146" rx="14" ry="9" fill="${pal.ears}" stroke="#5C5265" stroke-width="2.5" />
                    </g>

                    <!-- Cute Rounded Animal Ears -->
                    <g id="pet-ears" class="anim-ears">
                        <!-- Left Ear -->
                        <path id="pet-ear-left" d="M 60 62 C 50 35, 75 32, 80 55 Z" fill="${pal.ears}" stroke="#5C5265" stroke-width="3" stroke-linejoin="round" />
                        <path d="M 64 57 C 58 42, 73 40, 76 54 Z" fill="#FFAAB8" opacity="0.7" />

                        <!-- Right Ear -->
                        <path id="pet-ear-right" d="M 140 62 C 150 35, 125 32, 120 55 Z" fill="${pal.ears}" stroke="#5C5265" stroke-width="3" stroke-linejoin="round" />
                        <path d="M 136 57 C 142 42, 127 40, 124 54 Z" fill="#FFAAB8" opacity="0.7" />
                    </g>

                    <!-- Main Chubby Body (Rounded Bean/Pear Silhouette) -->
                    <g id="pet-body-group" class="anim-body" filter="url(#softGlow)">
                        <path id="pet-main-body" d="
                            M 100 50
                            C 135 50, 155 70, 155 100
                            C 155 130, 138 145, 100 145
                            C 62 145, 45 130, 45 100
                            C 45 70, 65 50, 100 50 Z
                        " fill="url(#petBodyGradient)" stroke="#5C5265" stroke-width="3.5" stroke-linejoin="round" />

                        <!-- Creamy Soft Belly Patch -->
                        <ellipse id="pet-belly" cx="100" cy="115" rx="34" ry="24" fill="${pal.belly}" opacity="0.9" />

                        <!-- Rosy Cheeks -->
                        <g id="pet-cheeks">
                            ${this.getCheeksSVG(this.currentExpression)}
                        </g>

                        <!-- Eyes -->
                        <g id="pet-eyes">
                            ${this.getEyesSVG(this.currentExpression)}
                        </g>

                        <!-- Expressive Mouth -->
                        <g id="pet-mouth">
                            ${this.getMouthSVG(this.currentExpression)}
                        </g>

                        <!-- Tiny Stubby Arms -->
                        <g id="pet-arms" class="anim-arms">
                            <!-- Left Arm -->
                            <path id="pet-arm-left" d="M 52 105 C 40 108, 42 118, 54 116 Z" fill="${pal.body}" stroke="#5C5265" stroke-width="3" stroke-linejoin="round" />
                            <!-- Right Arm -->
                            <path id="pet-arm-right" d="M 148 105 C 160 108, 158 118, 146 116 Z" fill="${pal.body}" stroke="#5C5265" stroke-width="3" stroke-linejoin="round" />
                        </g>
                    </g>

                    <!-- Overlay Extras (Stars, Zzz, Sweat, Hearts) -->
                    <g id="pet-extras">
                        ${this.getExtrasSVG(this.currentExpression)}
                    </g>
                </svg>
            </div>
        `;
    }

    triggerActionAnimation(action) {
        const petWrapper = document.getElementById('pulsepet-character');
        if (!petWrapper) return;

        petWrapper.classList.remove('anim-jump', 'anim-shake', 'anim-shiver', 'anim-eat');
        // Force reflow
        void petWrapper.offsetWidth;

        if (action === 'feed') {
            petWrapper.classList.add('anim-eat');
            this.setExpression('happy');
            setTimeout(() => {
                this.setExpression(this.getExpressionFromStats());
            }, 1500);
        } else if (action === 'play') {
            petWrapper.classList.add('anim-jump');
            this.setExpression('happy');
            setTimeout(() => {
                this.setExpression(this.getExpressionFromStats());
            }, 1800);
        } else if (action === 'medicine') {
            petWrapper.classList.add('anim-jump');
            this.setExpression('happy');
            setTimeout(() => {
                this.setExpression(this.getExpressionFromStats());
            }, 1500);
        } else if (action === 'gentle-shake') {
            petWrapper.classList.add('anim-jump');
            this.setExpression('happy');
            setTimeout(() => {
                this.setExpression(this.getExpressionFromStats());
            }, 1200);
        } else if (action === 'strong-shake') {
            petWrapper.classList.add('anim-shake');
            this.setExpression('dizzy');
        } else if (action === 'shiver') {
            petWrapper.classList.add('anim-shiver');
        }
    }

    getExpressionFromStats() {
        const stats = window.pulseStats ? window.pulseStats.getStats() : { hunger: 80, happiness: 85, health: 100 };
        const state = window.pulseGameState ? window.pulseGameState.currentState : 'NORMAL';

        if (state === 'SLEEP') return 'sleeping';
        if (state === 'ICU_WARN' || state === 'ICU_GAME') return 'critical';
        if (state === 'GAME_OVER') return 'dead';
        if (window.pulseGameState && window.pulseGameState.isDizzy) return 'dizzy';

        if (stats.health <= 15) return 'critical';
        if (stats.health <= 40) return 'sick';
        if (stats.hunger <= 25) return 'hungry';
        if (stats.happiness <= 30) return 'hungry';
        if (stats.happiness >= 80 && stats.hunger >= 70) return 'happy';
        return 'normal';
    }
}

window.pulseAnimation = new PetAnimation();
