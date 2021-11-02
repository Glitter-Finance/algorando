# Random Oracle

from pyteal import Return, Bytes, Itob, Global, Txn, And,Seq, App, Concat, Int, Keccak256, Cond, OnComplete, Reject, Mode, compileTeal, ScratchVar, TealType
# from pyteal import *

def algorando():

    NONCE = Bytes("Nonce")
    VALUE = Bytes("Value")

    now = Itob(Global.latest_timestamp())
    sender = Txn.sender()
    value = ScratchVar(TealType.bytes, 0)

    # commonChecks = And(
    #     Txn.rekey_to() == Global.zero_address(),
    #     Txn.close_remainder_to() == Global.zero_address(),
    # )

    onCreate = Seq([
        App.globalPut(NONCE, Int(0)),
        App.globalPut(VALUE, Keccak256(
            Concat(Itob(App.globalGet(NONCE)), now, sender)
        )),
        Return(Int(1))
    ])

    onRandom = Seq([
        App.globalPut(NONCE, App.globalGet(NONCE) + Int(1)),
        App.globalPut(VALUE, Keccak256(
            Concat(Itob(App.globalGet(NONCE)), now, sender)
        )),
        value.store(App.globalGet(VALUE)),
        Return(Int(1))
    ])

    program = Cond(
        [Txn.application_id() == Int(0), onCreate],
        [Txn.on_completion() == OnComplete.DeleteApplication, Reject()],
        [Txn.on_completion() == OnComplete.UpdateApplication, Reject()],
        [Txn.on_completion() == OnComplete.CloseOut, Reject()],
        [Txn.on_completion() == OnComplete.OptIn, Reject()],
        [Int(1), onRandom],
    )

    # return And(program, commonChecks)
    return program

if __name__ == "__main__":
    print(compileTeal(algorando(), mode=Mode.Application, version=5))
