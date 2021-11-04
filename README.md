# Algorando

> An on-chain randomness oracle for Algorand using keccak256

## Deployments

> All developers **must** use the same instance of Algorando to ensure maximum entropy

 - **Testnet**
     - App ID - 43189528
     - Create Txn: [HSNV34BVEAK6NFTGSVREBNVO4LRIW4IZWM5JJ24AX42S2YR7IKNQ](https://testnet.algoexplorer.io/tx/HSNV34BVEAK6NFTGSVREBNVO4LRIW4IZWM5JJ24AX42S2YR7IKNQ)

## How-to-use

1. Create an atomic transaction containing 2 (or more) Transactions
1. The first transaction will invoke the on-chain algorando deployment (See above for appId)
1. The second transaction will invoke your on-chain application where it can access the random value in the 0th scratch slot
    - The value will be a 32-byte byte[]

## PyTeal Example

```python
# n = Whichever transaction in the group that made the transaction to Algorando
# Note: multiple calls to Algorando can be made in a single Atomic Transfer

Assert(Gtxn[<n>].application_id() == <algorando_appId>)
randomBytes = ImportScratchValue(<n>, 0)

# Create a random number (PyTeal >0.9)
randomInt = Btoi(Extract(randomBytes, Int(0), Int(8)))
```

## Pitfalls
- **Pitfall**: Users could create an Atomic Transfer that contains a call to an impersonator app that is not random
   - > Mitigation: Developers **must** assert the application_id of the transaction to ensure the transaction group doesn't contain a call to a different, unexpected application that will impersonate Algorando

## Risks


 - **Risk**: Users could brute-force a sender address that could produce a favorable value, compromising the 'randomness'
   - > Mitigation: The last block time is unpredictable and changes every block, about ~4.5s. The last block time is incorporated when calculating the random value (See, Global.latest_timestamp()). This puts a deadline on any would be abusers
   - > Mitigation: Developers **should** incorporate a call to Algorando into their application's transactions even when a random value is not needed.  This creates additional entropy in each block. Because an attacker can't guarantee the order transactions are evaluated in a block, they have less chance of creating a favorable sender address and being in a block that doesn't contribute additional entropy to Algorando.
   - > Mitigation: The more developers and dapps using Algorando, the more transactions will be made to Algorando creating more entropy.  All developers **must** use the same instance of Algorando to ensure maximum entropy

## References

 - [Atomic Transfers](https://developer.algorand.org/docs/get-details/atomic_transfers/)
 - [Scratch Space](https://developer.algorand.org/docs/get-details/dapps/avm/teal/specification/#scratch-space)
 - [PyTeal: Scratch Space](https://pyteal.readthedocs.io/en/stable/scratch.html)
 - [PyTeal: Loading Scratch Slots from transaction group](https://pyteal.readthedocs.io/en/stable/loading_group_transaction.html#loading-scratch-slots)