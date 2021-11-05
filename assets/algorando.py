# Algorando - Random Oracle

from pyteal import (App, Bytes, Concat, Cond, Global, Int, Itob, Keccak256,
                    Mode, OnComplete, Or, Reject, Return, ScratchVar, Seq,
                    TealType, Txn, compileTeal, Sha256, Sha512_256)


def algorando():

    NONCE = Bytes("Nonce")

    now = Itob(Global.latest_timestamp())
    sender = Txn.sender()
    value = ScratchVar(TealType.bytes, 0)

    onRandom = Seq([
        App.globalPut(NONCE, App.globalGet(NONCE) + Int(1)),
        value.store(Sha512_256(
            Concat(Itob(App.globalGet(NONCE)), now, sender)
        )),
        Return(Int(1))
    ])

    return Cond(
        [
            Or(
                Txn.on_completion() == OnComplete.DeleteApplication,
                Txn.on_completion() == OnComplete.UpdateApplication,
                Txn.on_completion() == OnComplete.CloseOut,
                Txn.on_completion() == OnComplete.OptIn,
                Txn.rekey_to() != Global.zero_address(),
                Txn.close_remainder_to() != Global.zero_address()  # Redundant
            ), Reject()
        ],
        [Int(1), onRandom],
    )


if __name__ == "__main__":
    print(compileTeal(algorando(), mode=Mode.Application, version=5))
