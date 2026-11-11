/**
 * PulsePet Digital Logic Puzzle Engine
 * Emulates the Nexys A7 16 physical slide switches (SW0 - SW15)
 * and combinational logic circuits for CPE222 Digital Electronics & Logic Design.
 */

class LogicPuzzleEngine {
    constructor() {
        // 16 virtual switch states (0: DOWN / OFF, 1: UP / ON)
        this.switches = new Array(16).fill(0);
        this.currentRound = 1;
        this.totalRounds = 3;
        this.currentPuzzle = null;

        // Curated, pedagogically verified puzzles for each round
        this.puzzlePool = {
            1: [
                {
                    text: 'SW2 ⊕ SW5 = 1',
                    formula: 'SW2 XOR SW5 = 1',
                    switches: [2, 5],
                    target: 1,
                    hint: 'XOR (⊕) is 1 when inputs are DIFFERENT (one is 1, one is 0).',
                    evaluator: (sw) => (sw[2] ^ sw[5]),
                    explain: (sw) => `(${sw[2]} ⊕ ${sw[5]}) = ${sw[2] ^ sw[5]}`
                },
                {
                    text: 'SW3 • SW7 = 1',
                    formula: 'SW3 AND SW7 = 1',
                    switches: [3, 7],
                    target: 1,
                    hint: 'AND (•) is 1 only when BOTH inputs are 1.',
                    evaluator: (sw) => (sw[3] & sw[7]),
                    explain: (sw) => `(${sw[3]} • ${sw[7]}) = ${sw[3] & sw[7]}`
                },
                {
                    text: 'SW1 + SW6 = 0',
                    formula: 'SW1 OR SW6 = 0',
                    switches: [1, 6],
                    target: 0,
                    hint: 'OR (+) is 0 only when BOTH inputs are 0.',
                    evaluator: (sw) => (sw[1] | sw[6]),
                    explain: (sw) => `(${sw[1]} + ${sw[6]}) = ${sw[1] | sw[6]}`
                },
                {
                    text: 'SW4 ⊕ SW8 = 0',
                    formula: 'SW4 XOR SW8 = 0',
                    switches: [4, 8],
                    target: 0,
                    hint: 'XOR (⊕) is 0 when inputs are IDENTICAL (both 0 or both 1).',
                    evaluator: (sw) => (sw[4] ^ sw[8]),
                    explain: (sw) => `(${sw[4]} ⊕ ${sw[8]}) = ${sw[4] ^ sw[8]}`
                },
                {
                    text: '¬SW0 • SW9 = 1',
                    formula: 'NOT(SW0) AND SW9 = 1',
                    switches: [0, 9],
                    target: 1,
                    hint: 'NOT inverts SW0 (needs SW0=0). AND requires SW9=1.',
                    evaluator: (sw) => ((sw[0] ? 0 : 1) & sw[9]),
                    explain: (sw) => `(¬${sw[0]} • ${sw[9]}) = ${((sw[0] ? 0 : 1) & sw[9])}`
                }
            ],
            2: [
                {
                    text: '(SW1 • SW4) + SW7 = 1',
                    formula: '(SW1 AND SW4) OR SW7 = 1',
                    switches: [1, 4, 7],
                    target: 1,
                    hint: 'Either SW7=1, or both SW1=1 AND SW4=1.',
                    evaluator: (sw) => ((sw[1] & sw[4]) | sw[7]),
                    explain: (sw) => `((${sw[1]} • ${sw[4]}) + ${sw[7]}) = ${((sw[1] & sw[4]) | sw[7])}`
                },
                {
                    text: '(SW2 + SW6) • SW10 = 1',
                    formula: '(SW2 OR SW6) AND SW10 = 1',
                    switches: [2, 6, 10],
                    target: 1,
                    hint: 'SW10 must be 1, AND at least one of (SW2, SW6) must be 1.',
                    evaluator: (sw) => ((sw[2] | sw[6]) & sw[10]),
                    explain: (sw) => `((${sw[2]} + ${sw[6]}) • ${sw[10]}) = ${((sw[2] | sw[6]) & sw[10])}`
                },
                {
                    text: 'SW3 ⊕ (SW8 • SW12) = 1',
                    formula: 'SW3 XOR (SW8 AND SW12) = 1',
                    switches: [3, 8, 12],
                    target: 1,
                    hint: 'SW3 must differ from the AND product of SW8 and SW12.',
                    evaluator: (sw) => (sw[3] ^ (sw[8] & sw[12])),
                    explain: (sw) => `(${sw[3]} ⊕ (${sw[8]} • ${sw[12]})) = ${sw[3] ^ (sw[8] & sw[12])}`
                },
                {
                    text: '(SW0 ⊕ SW5) • ¬SW11 = 1',
                    formula: '(SW0 XOR SW5) AND NOT(SW11) = 1',
                    switches: [0, 5, 11],
                    target: 1,
                    hint: 'SW11 must be 0, and SW0 must differ from SW5.',
                    evaluator: (sw) => ((sw[0] ^ sw[5]) & (sw[11] ? 0 : 1)),
                    explain: (sw) => `((${sw[0]} ⊕ ${sw[5]}) • ¬${sw[11]}) = ${((sw[0] ^ sw[5]) & (sw[11] ? 0 : 1))}`
                }
            ],
            3: [
                {
                    text: '(SW2 ⊕ SW7) • (SW11 + SW14) = 1',
                    formula: '(SW2 XOR SW7) AND (SW11 OR SW14) = 1',
                    switches: [2, 7, 11, 14],
                    target: 1,
                    hint: '(SW2 ≠ SW7) must be TRUE, AND either SW11 or SW14 must be 1.',
                    evaluator: (sw) => ((sw[2] ^ sw[7]) & (sw[11] | sw[14])),
                    explain: (sw) => `((${sw[2]} ⊕ ${sw[7]}) • (${sw[11]} + ${sw[14]})) = ${((sw[2] ^ sw[7]) & (sw[11] | sw[14]))}`
                },
                {
                    text: '(SW1 • SW5) ⊕ (SW9 • SW13) = 1',
                    formula: '(SW1 AND SW5) XOR (SW9 AND SW13) = 1',
                    switches: [1, 5, 9, 13],
                    target: 1,
                    hint: 'Exactly one pair must be (1,1), and the other pair must NOT be (1,1).',
                    evaluator: (sw) => ((sw[1] & sw[5]) ^ (sw[9] & sw[13])),
                    explain: (sw) => `((${sw[1]} • ${sw[5]}) ⊕ (${sw[9]} • ${sw[13]} navigation)) = ${((sw[1] & sw[5]) ^ (sw[9] & sw[13]))}`
                },
                {
                    text: '(SW4 ⊕ SW8) • (SW12 ⊕ SW15) = 1',
                    formula: '(SW4 XOR SW8) AND (SW12 XOR SW15) = 1',
                    switches: [4, 8, 12, 15],
                    target: 1,
                    hint: 'Both XOR pairs must have differing inputs (SW4≠SW8 AND SW12≠SW15).',
                    evaluator: (sw) => ((sw[4] ^ sw[8]) & (sw[12] ^ sw[15])),
                    explain: (sw) => `((${sw[4]} ⊕ ${sw[8]}) • (${sw[12]} ⊕ ${sw[15]})) = ${((sw[4] ^ sw[8]) & (sw[12] ^ sw[15]))}`
                }
            ]
        };
    }

    resetSwitches() {
        this.switches = new Array(16).fill(0);
    }

    toggleSwitch(index) {
        if (index >= 0 && index < 16) {
            this.switches[index] = this.switches[index] === 1 ? 0 : 1;
            if (window.pulseAudio) {
                window.pulseAudio.playClick();
            }
            return this.switches[index];
        }
        return 0;
    }

    setSwitch(index, val) {
        if (index >= 0 && index < 16) {
            this.switches[index] = val ? 1 : 0;
        }
    }

    getSwitch(index) {
        return this.switches[index] || 0;
    }

    getSwitchWord() {
        // Return 16-bit integer representation (Nexys A7 sw[15:0])
        let word = 0;
        for (let i = 0; i < 16; i++) {
            if (this.switches[i]) word |= (1 << i);
        }
        return word;
    }

    startRound(roundNumber) {
        this.currentRound = roundNumber;
        const pool = this.puzzlePool[roundNumber] || this.puzzlePool[1];
        // Pick pseudo-random puzzle
        const idx = Math.floor(Math.random() * pool.length);
        this.currentPuzzle = pool[idx];
        return this.currentPuzzle;
    }

    evaluateCurrent() {
        if (!this.currentPuzzle) return { success: false };
        const currentResult = this.currentPuzzle.evaluator(this.switches);
        const isMatch = currentResult === this.currentPuzzle.target;
        const explanation = this.currentPuzzle.explain(this.switches);

        return {
            isMatch,
            currentResult,
            targetResult: this.currentPuzzle.target,
            explanation,
            hint: this.currentPuzzle.hint
        };
    }
}

window.pulseLogicPuzzle = new LogicPuzzleEngine();

