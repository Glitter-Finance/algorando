const { getProgram } = require('@algo-builder/algob');
const { types } = require('@algo-builder/web');

const FEE = 1e3;
const algorandoProgram = getProgram('algorando.py')
const testProgram = getProgram('getAlgorandoBytes.py')
const clearProgram = getProgram('noop-clear.teal');

function nextRandomValueFactory(runtime, master) {

    const appId = runtime.addApp({
        sender: master.account,
        globalBytes: 1,
        globalInts: 1,
    }, {}, algorandoProgram, clearProgram);

    const testAppId = runtime.addApp({
        sender: master.account,
        globalBytes: 1,
        globalInts: 1,
    }, {}, testProgram, clearProgram);

    return [(altSenderAddress) => {
        runtime.executeTx([
            {
                type: types.TransactionType.CallApp,
                sign: types.SignType.SecretKey,
                fromAccountAddr: altSenderAddress || master.address,
                appID: appId,
                payFlags: {
                    totalFee: FEE,
                },
            },
            {
                type: types.TransactionType.CallApp,
                sign: types.SignType.SecretKey,
                fromAccountAddr: master.address,
                appID: testAppId,
                payFlags: {
                    totalFee: FEE,
                },
            }
        ]);

        return Array.from(runtime.getGlobalState(testAppId, 'value'));
    }, appId, testAppId]
}

module.exports = {
    nextRandomValueFactory,
}