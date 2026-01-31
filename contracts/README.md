# BountyEscrow Contract

A simple single-owner bounty escrow contract for the Agent Bounty Board MVP.

## Overview

The `BountyEscrow` contract enables:
- Owner creates and funds bounties (ETH or ERC20)
- Any solver can claim an open bounty
- Solver submits proof of work
- Owner accepts and pays, or cancels

## Security Features

- **Reentrancy Guard**: All payment functions (`acceptAndPay`, `cancel`) are protected
- **Checks-Effects-Interactions**: State updates occur before external calls
- **Custom Errors**: Gas-efficient, descriptive error messages
- **State Machine**: Enforces valid status transitions only

## Event-to-Schema Mapping

Events are designed for off-chain indexers to reconstruct the full bounty lifecycle.
See `spec.schema.json` for the corresponding off-chain data model.

| Event | Schema Object | Field Mappings |
|-------|---------------|----------------|
| `BountyCreated` | `bounty` | `bountyId`→`id`, `creator`→(derived), `token`→`asset`/`assetAddress`, `amount`→`payout`, `metadataHash`→(off-chain lookup for `title`, `description`, `acceptance`), `deadline`→`deadline`, `createdAt`→`createdAt`, status=`open` |
| `BountyClaimed` | `claim` | `bountyId`→`bountyId`, `solver`→`agentWallet`, `claimedAt`→`claimedAt`. Note: `agentHandle` must be stored off-chain |
| `BountySubmitted` | `submission` | `bountyId`→`bountyId`, `submittedAt`→`submittedAt`, `proofUrl`→`proofUrl`. Note: `notes` stored off-chain |
| `BountyPaid` | `bounty` | Updates `status`→`paid` |
| `BountyCancelled` | `bounty` | Updates `status`→`cancelled`, includes `refundee`, `amount` for audit trail |

### Event Parameters

```solidity
event BountyCreated(
    uint256 indexed bountyId,
    address indexed creator,
    address indexed token,
    uint256 amount,
    bytes32 metadataHash,
    uint64 deadline,
    uint64 createdAt
);

event BountyClaimed(
    uint256 indexed bountyId,
    address indexed solver,
    uint64 claimedAt
);

event BountySubmitted(
    uint256 indexed bountyId,
    address indexed solver,
    bytes32 workHash,
    string proofUrl,
    uint64 submittedAt
);

event BountyPaid(
    uint256 indexed bountyId,
    address indexed solver,
    address indexed token,
    uint256 amount,
    uint64 paidAt
);

event BountyCancelled(
    uint256 indexed bountyId,
    address indexed refundee,
    address indexed token,
    uint256 amount,
    uint64 cancelledAt
);
```

## Custom Errors

| Error | When |
|-------|------|
| `NotOwner()` | Caller is not the contract owner |
| `InvalidBounty()` | Bounty ID does not exist |
| `BadStatus(expected, got)` | Invalid state transition |
| `DeadlinePassed()` | Claim attempted after deadline |
| `NotSolver()` | Non-solver tried to submit |
| `ZeroAmount()` | Bounty created with zero value |
| `InvalidToken()` | ERC20 bounty with address(0) |
| `EthTransferFailed()` | ETH transfer failed |
| `Erc20TransferFailed()` | ERC20 transfer failed |
| `ReentrancyDetected()` | Reentrancy attempt blocked |

---

## Foundry

**Foundry is a blazing fast, portable and modular toolkit for Ethereum application development written in Rust.**

Foundry consists of:

- **Forge**: Ethereum testing framework (like Truffle, Hardhat and DappTools).
- **Cast**: Swiss army knife for interacting with EVM smart contracts, sending transactions and getting chain data.
- **Anvil**: Local Ethereum node, akin to Ganache, Hardhat Network.
- **Chisel**: Fast, utilitarian, and verbose solidity REPL.

## Documentation

https://book.getfoundry.sh/

## Usage

### Build

```shell
$ forge build
```

### Test

```shell
$ forge test
```

### Format

```shell
$ forge fmt
```

### Gas Snapshots

```shell
$ forge snapshot
```

### Anvil

```shell
$ anvil
```

### Deploy

```shell
$ forge script script/Counter.s.sol:CounterScript --rpc-url <your_rpc_url> --private-key <your_private_key>
```

### Cast

```shell
$ cast <subcommand>
```

### Help

```shell
$ forge --help
$ anvil --help
$ cast --help
```
