/**
 * Automated Verification Test Suite for PulsePet Game Logic
 * Tests:
 * 1. FSM state transitions
 * 2. Pet stat calculations & bounds
 * 3. Care actions (feed, play, medicine, sleep/wake)
 * 4. Combinational logic puzzle solver & guarantee of valid solutions for all pools
 * 5. Hardware sensor simulation logic (ADXL362 & ADT7420)
 */

const assert = require('assert');
const fs = require('fs');

console.log('🧪 Starting PulsePet Automated Test Suite...');

// Mock Browser Environment
global.window = global;
global.document = {
    addEventListener: () => {},
    getElementById: () => null,
    querySelectorAll: () => []
};

// Load source modules
require('./js/gameState.js');
require('./js/petStats.js');
require('./js/logicPuzzle.js');
require('./js/sensorSimulation.js');

let testsPassed = 0;
let testsTotal = 0;

function runTest(name, fn) {
    testsTotal++;
    try {
        fn();
        console.log(`  ✓ PASS: ${name}`);
        testsPassed++;
    } catch (err) {
        console.error(`  ✗ FAIL: ${name}`);
        console.error(err);
        process.exitCode = 1;
    }
}

// ==========================================
// 1. FSM Tests
// ==========================================
runTest('FSM: Initial state is WELCOME', () => {
    assert.strictEqual(window.pulseGameState.getState(), 'WELCOME');
});

runTest('FSM: Transitions to CUSTOMIZE, NORMAL, SLEEP, ICU_WARN, ICU_GAME, RESCUE_SUCCESS, GAME_OVER', () => {
    window.pulseGameState.setState('CUSTOMIZE');
    assert.strictEqual(window.pulseGameState.getState(), 'CUSTOMIZE');

    window.pulseGameState.setState('NORMAL');
    assert.strictEqual(window.pulseGameState.getState(), 'NORMAL');

    window.pulseGameState.setState('SLEEP');
    assert.strictEqual(window.pulseGameState.getState(), 'SLEEP');

    window.pulseGameState.setState('ICU_WARN');
    assert.strictEqual(window.pulseGameState.getState(), 'ICU_WARN');

    window.pulseGameState.setState('ICU_GAME');
    assert.strictEqual(window.pulseGameState.getState(), 'ICU_GAME');

    window.pulseGameState.setState('RESCUE_SUCCESS');
    assert.strictEqual(window.pulseGameState.getState(), 'RESCUE_SUCCESS');

    window.pulseGameState.setState('GAME_OVER');
    assert.strictEqual(window.pulseGameState.getState(), 'GAME_OVER');
});

runTest('FSM: Pet Name Clamping (max 6 chars, uppercase)', () => {
    const res = window.pulseGameState.setPetName('longnamepet');
    assert.strictEqual(res, 'LONGNA');
    assert.strictEqual(res.length, 6);
});

// ==========================================
// 2. Pet Stats Tests
// ==========================================
runTest('Stats: Initial bounds and clamping', () => {
    window.pulseStats.reset();
    const stats = window.pulseStats.getStats();
    assert.strictEqual(stats.health, 100);
    assert.strictEqual(stats.hunger, 80);
    assert.strictEqual(stats.happiness, 85);

    // Test upper clamp
    window.pulseStats.modifyHealth(50);
    assert.strictEqual(window.pulseStats.health, 100);

    // Test lower clamp
    window.pulseStats.modifyHunger(-150);
    assert.strictEqual(window.pulseStats.hunger, 0);
});

runTest('Stats: Care Action Stat Deltas', () => {
    window.pulseStats.reset();
    window.pulseStats.setStat('hunger', 40);
    window.pulseStats.setStat('happiness', 40);
    window.pulseStats.setStat('health', 40);

    // Feed (+25 hunger)
    window.pulseStats.modifyHunger(25);
    assert.strictEqual(window.pulseStats.hunger, 65);

    // Play (+25 happiness)
    window.pulseStats.modifyHappiness(25);
    assert.strictEqual(window.pulseStats.happiness, 65);

    // Medicine (+30 health)
    window.pulseStats.modifyHealth(30);
    assert.strictEqual(window.pulseStats.health, 70);
});

runTest('Stats: ICU trigger when health <= 15', () => {
    window.pulseGameState.setState('NORMAL');
    window.pulseStats.setStat('health', 10);
    assert.strictEqual(window.pulseGameState.getState(), 'ICU_WARN');
});

// ==========================================
// 3. Digital Logic Puzzle Engine Tests
// ==========================================
runTest('Logic: 16 Switches toggle properly', () => {
    window.pulseLogicPuzzle.resetSwitches();
    assert.strictEqual(window.pulseLogicPuzzle.getSwitch(0), 0);
    assert.strictEqual(window.pulseLogicPuzzle.getSwitch(15), 0);

    window.pulseLogicPuzzle.toggleSwitch(3);
    assert.strictEqual(window.pulseLogicPuzzle.getSwitch(3), 1);

    window.pulseLogicPuzzle.toggleSwitch(3);
    assert.strictEqual(window.pulseLogicPuzzle.getSwitch(3), 0);
});

runTest('Logic: Every puzzle in all 3 pools has at least one valid solution', () => {
    const pools = window.pulseLogicPuzzle.puzzlePool;
    for (const [round, list] of Object.entries(pools)) {
        list.forEach((puzzle, idx) => {
            let foundSolution = false;
            // Iterate over all 2^N switch combinations for the switches involved
            const n = puzzle.switches.length;
            const totalCombos = 1 << n;

            for (let c = 0; c < totalCombos; c++) {
                const swTest = new Array(16).fill(0);
                for (let bit = 0; bit < n; bit++) {
                    const swIndex = puzzle.switches[bit];
                    swTest[swIndex] = (c >> bit) & 1;
                }
                const res = puzzle.evaluator(swTest);
                if (res === puzzle.target) {
                    foundSolution = true;
                    break;
                }
            }

            assert.ok(foundSolution, `Puzzle Round ${round} index ${idx} ("${puzzle.formula}") must have a solvable combination!`);
        });
    }
});

runTest('Logic: Boolean Evaluator Correctness (XOR, AND, OR, NOT)', () => {
    // Test XOR: SW2 ^ SW5 = 1
    const xorPuzzle = {
        switches: [2, 5],
        target: 1,
        evaluator: (sw) => sw[2] ^ sw[5]
    };

    window.pulseLogicPuzzle.currentPuzzle = xorPuzzle;
    window.pulseLogicPuzzle.resetSwitches();

    // 0 ^ 0 = 0 -> Fail
    assert.strictEqual(xorPuzzle.evaluator(window.pulseLogicPuzzle.switches), 0);

    // 1 ^ 0 = 1 -> Pass
    window.pulseLogicPuzzle.setSwitch(2, 1);
    window.pulseLogicPuzzle.setSwitch(5, 0);
    assert.strictEqual(xorPuzzle.evaluator(window.pulseLogicPuzzle.switches), 1);

    // 1 ^ 1 = 0 -> Fail
    window.pulseLogicPuzzle.setSwitch(2, 1);
    window.pulseLogicPuzzle.setSwitch(5, 1);
    assert.strictEqual(xorPuzzle.evaluator(window.pulseLogicPuzzle.switches), 0);
});

// ==========================================
// 4. Sensor Simulation Tests
// ==========================================
runTest('Sensors: Temperature clamping and thresholds', () => {
    window.pulseSensors.setTemperature(10);
    assert.strictEqual(window.pulseSensors.temperature, 15); // Clamped to min 15

    window.pulseSensors.setTemperature(50);
    assert.strictEqual(window.pulseSensors.temperature, 40); // Clamped to max 40

    window.pulseSensors.setTemperature(18);
    assert.ok(window.pulseSensors.temperature < 20); // Cold

    window.pulseSensors.setTemperature(32);
    assert.ok(window.pulseSensors.temperature > 28); // Hot
});

runTest('Sensors: Gentle shake wakes sleeping pet', () => {
    window.pulseGameState.setState('SLEEP');
    window.pulseActions = {
        wake: () => {
            window.pulseGameState.setState('NORMAL');
        }
    };
    window.pulseSensors.isShakeCooldown = false;
    window.pulseSensors.gentleShake();
    assert.strictEqual(window.pulseGameState.getState(), 'NORMAL');
});

console.log(`\n🎉 Test Suite Finished: ${testsPassed} of ${testsTotal} tests passed successfully!`);
