async function run(runtimeEnv, deployer) {
    console.log('>>>> START: Deploy Algorando');

    const scInfo = await deployer.deployApp('algorando.py', 'noop-clear.teal', {
        globalBytes: 0,
        globalInts: 1,
        localBytes: 0,
        localInts: 0,
        sender: deployer.accountsByName.get('master'),
    }, {});

    deployer.addCheckpointKV('appId', scInfo.appID);

    console.log('>>>> End: Deploy Algorando', { appId: scInfo.appID });
}

module.exports = { default: run };
