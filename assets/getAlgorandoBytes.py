# Do not deploy, just used for tests against Algorando

from pyteal import (App, Approve, Bytes, Global, ImportScratchValue, Mode, Seq,
                    compileTeal)


def getAlgorandoBytes():
    return Seq([
        App.globalPut(Bytes('value'), ImportScratchValue(0, 0)),
        App.globalPut(Bytes('now'), Global.latest_timestamp()),
        Approve(),
    ])


if __name__ == "__main__":
    print(compileTeal(getAlgorandoBytes(), mode=Mode.Application, version=5))
