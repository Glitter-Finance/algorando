const { Runtime, AccountStore } = require('@algo-builder/runtime');
const { nextRandomValueFactory } = require('./utils');
const randomness = require('randomness').default;
const { expect } = require('chai');

const masterBalance = BigInt(10e6);
const ONE_KILO = 1024;

const SAMPLE_SIZE = ONE_KILO * 16;
const TEST_TIMEOUT = 1e3 * 60 * 2;

describe('Entropy of Algorando', function () {

    let master;
    let runtime;
    let appId;
    let testAppId;
    let accounts;

    this.beforeEach(() => {
        // Expected 1 app call per address = 32 bytes
        accounts = Array.from({ length: SAMPLE_SIZE / 32 })
            .map(a => new AccountStore(masterBalance));

        master = new AccountStore(masterBalance);
        runtime = new Runtime([...accounts, master]);

        [nextRandomValue, appId, testAppId] = nextRandomValueFactory(runtime, master);
    });

    it('should retain randomness for calls from various unique senders, across different blocks', () => {
        const bits = accounts
            .flatMap((a, i) => {
                runtime.setRoundAndTimestamp(i + 1, Date.now() + i);
                return nextRandomValue(a.address).map(byte => byte.toString(2).padStart(8, '0'));
            }).join('').split('').map(bitString => bitString === '1' ? 1 : 0);

        const result = testForRandomness(bits);
        expect(result).equal(true);
    }).timeout(TEST_TIMEOUT).retries(3);

    it('should retain randomness for calls from various unique senders, across same block', () => {
        runtime.setRoundAndTimestamp(1, Date.now());
        const bits = accounts
            .flatMap((a, i) => {
                return nextRandomValue(a.address).map(byte => byte.toString(2).padStart(8, '0'));
            }).join('').split('').map(bitString => bitString === '1' ? 1 : 0);

        const result = testForRandomness(bits);
        expect(result).equal(true);
    }).timeout(TEST_TIMEOUT).retries(3);


    /* This test fails for the current sample-size, 8KB
     * !!!! DEVS - This is the worst case-scenario with the least external entropy, devs should take this into
     * consideration and prevent a single actor (address) from creating so many random values in a 
     * single block.
    */
    it.skip('should retain randomness for calls from same sender, across same block', () => {
        runtime.setRoundAndTimestamp(1, Date.now());
        const bits = accounts
            .flatMap(() => {
                return nextRandomValue().map(byte => byte.toString(2).padStart(8, '0'));
            }).join('').split('').map(bitString => bitString === '1' ? 1 : 0);

        const result = testForRandomness(bits);
        expect(result).equal(true);
    });

    it.skip('should be able to simulate time pass', () => {
        const timestamps = accounts
            .map((a, i) => {
                runtime.setRoundAndTimestamp(i + 1, Date.now() + i);
                nextRandomValue(a.address);
                return runtime.getGlobalState(testAppId, 'now');
            })
            .map(Number);

        const uniqueTimestamps = new Set(timestamps);

        expect(uniqueTimestamps.size).equal(accounts.length);
    })
});

const randomnessTests = [
    'approximateEntropyTest',
    'cumulativeSumsTest',
    'dftTest',
    'frequencyWithinBlockTest',
    'longestRunOnesInABlockTest',
    'monobitTest',
    'runsTest'
];

function testForRandomness(bits) {
    return randomnessTests.map(t => {
        const [passed] = randomness[t](bits);

        if (!passed)
            console.log('>>> Failed:', t);

        return passed;
    }).every(v => v);
}
