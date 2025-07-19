# 🧪 SimpleSwap DEX – Uniswap V2-Style AMM with Solidity Contracts & Professional Test Suite

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Solidity 0.8.x](https://img.shields.io/badge/Solidity-0.8.x-blue)](https://soliditylang.org)
[![OpenZeppelin 5.x](https://img.shields.io/badge/OpenZeppelin-5.x-green)](https://openzeppelin.com/contracts/)
[![Coverage ~97%](https://img.shields.io/badge/Coverage-97%25-brightgreen)](#-testing--coverage)

---

## 📚 Table of Contents

- [Overview](#-overview)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Features](#-features)
- [Contracts Summary](#-contracts-summary)
- [Deployed Addresses](#-deployed-addresses)
- [Quick Start](#-quick-start)
- [Usage Examples](#-usage-examples)
- [Core Contract Functions](#-core-contract-functions)
- [Security & Validations](#-security--validations)
- [Testing & Coverage](#-testing--coverage)
- [Development Workflow](#-development-workflow)
- [Contributing](#-contributing)
- [License](#-license)
- [Acknowledgments](#-acknowledgments)

---

## 🧭 Overview

**SimpleSwap** is a gas-efficient, Uniswap V2-style AMM implemented in Solidity. It enables:

- Token swaps between ERC‑20 pairs
- Liquidity provision/removal with LP token mint/burn
- On-chain pricing & reserve tracking
- Deadline & slippage enforcement
- Admin safety mechanisms (pause, unpause, emergencyWithdraw)

All logic is covered by a professional Hardhat test suite with ~97% code coverage.

---

## 🧱 Architecture

```mermaid
graph TD
    User -->|Swap / Add / Remove| SS[SimpleSwap]
    SS --> P[Pool (token0/token1 reserves)]
    SS --> LP[LP ERC-20 Tokens]
    SS --> Oracle[getPrice]
    Admin -->|Admin ops| SS
```

---

## 🧰 Tech Stack

- **Solidity 0.8.x**
- **Hardhat** (compilation, scripting, testing, coverage)
- **OpenZeppelin Contracts 5.x**
- **TypeScript** (for test utils)
- **Chai + Mocha** (testing)
- **Hardhat Coverage**
- **Gas Reporter** (optional)

---

## 📦 Features

- 🧮 Constant Product Market Maker (`x * y = k`)
- 🔄 Token Swaps with slippage and deadline protection
- 💧 Liquidity add/remove with LP tokens
- 🧾 LP token accounting via ERC‑20
- 📈 On-chain price helper (`getPrice`)
- 🛡️ Admin functions: pause/unpause, emergencyWithdraw
- ✅ Custom Solidity errors
- 🧪 \~97% test coverage

---

## 📄 Contracts Summary

| Contract          | Purpose                    | Notes                         |
| ----------------- | -------------------------- | ----------------------------- |
| `SimpleSwap.sol`  | AMM core logic             | Reserves, swaps, LP mint/burn |
| `TokenA.sol`      | Mock ERC-20                | Symbol: `TKA`                 |
| `TokenB.sol`      | Mock ERC-20                | Symbol: `TKB`                 |
| `ISimpleSwap.sol` | Interface for integrations | Public function signatures    |

---

## 🌐 Deployed Addresses

| Network | Contract   | Address                                      |
| ------- | ---------- | -------------------------------------------- |
| Sepolia | SimpleSwap | `0xC12806C775B5898EC3306d5Da2C216f1dCf2a4d2` |

---

## 🚀 Quick Start

### Clone & Install

```bash
git clone https://github.com/FranciscoLGM/simple-swap-tests.git
cd simple-swap-tests
npm install
```

### Environment Setup

```bash
cp .env.example .env
# fill in RPC keys & private key
```

### Compile Contracts

```bash
npx hardhat compile
```

### Local Deployment

```bash
npx hardhat node
npx hardhat run scripts/deploy.js --network localhost
```

---

## 🧪 Usage Examples

### Add Liquidity

```ts
await tokenA.approve(simpleSwap.target, amountA);
await tokenB.approve(simpleSwap.target, amountB);

await simpleSwap.addLiquidity(
  tokenA.target,
  tokenB.target,
  amountA,
  amountB,
  minA,
  minB,
  signer.address,
  deadline
);
```

### Swap Tokens

```ts
await tokenIn.approve(simpleSwap.target, amountIn);

await simpleSwap.swapExactTokensForTokens(
  [tokenIn.target, tokenOut.target],
  amountIn,
  minOut,
  signer.address,
  deadline
);
```

### Remove Liquidity

```ts
await lpToken.approve(simpleSwap.target, lpAmount);

await simpleSwap.removeLiquidity(
  tokenA.target,
  tokenB.target,
  lpAmount,
  minA,
  minB,
  signer.address,
  deadline
);
```

---

## ⚙️ Core Contract Functions

### Liquidity

- `addLiquidity(tokenA, tokenB, amountA, amountB, minA, minB, to, deadline)`
- `removeLiquidity(tokenA, tokenB, liquidity, minA, minB, to, deadline)`

### Swapping

- `swapExactTokensForTokens(path[], amountIn, minOut, to, deadline)`
- `getAmountOut(tokenIn, tokenOut, amountIn)`

### Reserves & Pricing

- `getReserves(tokenA, tokenB)`
- `getPrice(tokenA, tokenB)`

### Admin Controls

- `pause()` / `unpause()`
- `emergencyWithdraw(token)`

---

## 🛡️ Security & Validations

- ReentrancyGuard on state-changing functions
- Owner-gated admin operations
- Slippage and deadline parameters enforced
- Canonical sorted token pairs
- Custom Solidity errors (gas efficient)
- Full input validation and revert testing

---

## 🧪 Testing & Coverage

| Contract         | Statements | Branches | Functions | Lines  |
| ---------------- | ---------- | -------- | --------- | ------ |
| `SimpleSwap.sol` | 97.03%     | 70.31%   | 100%      | 95.68% |
| `TokenA.sol`     | 100%       | 100%     | 100%      | 100%   |
| `TokenB.sol`     | 100%       | 100%     | 100%      | 100%   |

### Project Structure

```
contracts/
  ├─ SimpleSwap.sol
  ├─ TokenA.sol
  ├─ TokenB.sol
  └─ interfaces/ISimpleSwap.sol

test/
  ├─ SimpleSwap.test.js
  ├─ TokenA.test.js
  ├─ TokenB.test.js
  └─ utils/helpers.js

```

### CLI Commands

```bash
npx hardhat compile
npx hardhat test
npx hardhat coverage
npx hardhat run scripts/deploy.js --network sepolia
```

### Testing Strategy

| Level        | Scope                             | Target        |
| ------------ | --------------------------------- | ------------- |
| Unit         | Function-level logic              | \~100%        |
| Integration  | Full liquidity & swap flows       | ≥97% stmts    |
| Edge / Error | Slippage, deadline, paused states | ≥90% branches |

---

## 🔁 Development Workflow

1. Edit contracts in `contracts/`
2. Compile and fix warnings
3. Run tests with Hardhat
4. Confirm coverage via `npx hardhat coverage`
5. Deploy to local or Sepolia
6. Update README with new addresses

---

## 🤝 Contributing

1. Fork the repo and create a branch
2. Ensure tests pass and coverage is maintained
3. Submit a PR with a clear title and description

**Commit style**:
`feat:`, `fix:`, `test:`, `docs:`

---

## 📜 License

MIT License — see [LICENSE](./LICENSE)

---

## 🙏 Acknowledgments

- Inspired by Uniswap V2 mechanics
- Built with Hardhat and OpenZeppelin

---
