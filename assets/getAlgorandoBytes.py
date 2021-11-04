# Do not deploy, just used for tests against Algorando

from pyteal import (App, Approve, Bytes, ImportScratchValue, Mode, Seq,
                    compileTeal)


def getAlgorandoBytes():
    return Seq([
        App.globalPut(Bytes('value'), ImportScratchValue(0, 0)),
        Approve(),
    ])


if __name__ == "__main__":
    print(compileTeal(getAlgorandoBytes(), mode=Mode.Application, version=5))
