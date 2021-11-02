const { getProgram } = require('@algo-builder/algob');
const { Runtime, AccountStore } = require('@algo-builder/runtime');
const { types } = require('@algo-builder/web');
const { assert, expect } = require('chai');

const masterBalance = BigInt(10e6);
const FEE = 1e3;

describe('Algorando', function () {
    const algorandoProgram = getProgram('algorando.py')
    const clearProgram = getProgram('noop-clear.teal');

    let master;
    let runtime;
    let appId;

    this.beforeEach(async function () {
        master = new AccountStore(masterBalance);
        runtime = new Runtime([master]);

        appId = runtime.addApp({
            sender: master.account,
            globalBytes: 1,
            globalInts: 1,
        }, {}, algorandoProgram, clearProgram);
    });

    it('Should update value randomly when called', () => {
        const before = Array.from(runtime.getGlobalState(appId, 'Value'));

        runtime.executeTx({
            type: types.TransactionType.CallApp,
            sign: types.SignType.SecretKey,
            fromAccountAddr: master.address,
            appID: appId,
            payFlags: {
                totalFee: FEE,
            },
        });
        const after = Array.from(runtime.getGlobalState(appId, 'Value'));
        expect(before).to.not.deep.equal(after);
    });

    it('should reject any app change transactions or opt in/out', () => {
        [
            types.TransactionType.DeleteApp,
            types.TransactionType.UpdateApp,
            types.TransactionType.OptInToApp,
            types.TransactionType.CloseApp,
        ].forEach(type => expectRejection(() => {
            runtime.executeTx({
                type,
                sign: types.SignType.SecretKey,
                fromAccountAddr: master.address,
                appID: appId,
                payFlags: {
                    totalFee: FEE,
                },
            });
        }));
    });

    it('should reject any rekey transaction', () => {
        expectRejection(() => {
            runtime.executeTx({
                type: types.TransactionType.CallApp,
                sign: types.SignType.SecretKey,
                fromAccountAddr: master.address,
                appID: appId,
                payFlags: {
                    totalFee: FEE,
                    rekeyTo: master.address,
                },
            });
        });
    });

    it('should reject any attempt to close remainder', () => {
        expectRejection(() => {
            runtime.executeTx({
                type: types.TransactionType.CloseApp,
                sign: types.SignType.SecretKey,
                fromAccountAddr: master.address,
                appID: appId,
                payFlags: {
                    totalFee: FEE,
                    closeRemainderTo: master.address,
                },
            });
        });
    });
});

function expectRejection(f) {
    try {
        f();
    } catch (e) {
        return;
    }

    throw new Error('Expected to throw');
}
