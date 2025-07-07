````markdown
# 🧪 SIMPLE-SWAP-TESTS

This repository contains the complete testing environment for the [`SimpleSwap`](https://github.com/yourusername/simple-swap) smart contract — a Uniswap V2-style decentralized exchange (DEX) using the constant product formula.

It includes:

- Core contracts (`SimpleSwap.sol`, `TokenA.sol`, `TokenB.sol`)
- Interfaces
- Unit tests
- Testing utilities
- Hardhat project setup

---

## 📁 Project Structure

```bash
├── contracts/
│   ├── interfaces/
│   │   └── ISimpleSwap.sol
│   ├── SimpleSwap.sol
│   ├── TokenA.sol
│   └── TokenB.sol
├── test/
│   ├── SimpleSwap.test.js
│   ├── TokenA.test.js
│   ├── TokenB.test.js
│   └── utils/
│       └── helpers.js
├── coverage/               # Coverage output (optional)
├── hardhat.config.js
├── package.json
├── .gitignore
└── README.md
```
````

---

## ⚙️ Requirements

- Node.js >= 16
- npm or yarn
- Hardhat

---

## 🚀 Installation

```bash
npm install
```

---

## 🧪 Running Tests

Run the full test suite:

```bash
npx hardhat test
```

Run a specific test file:

```bash
npx hardhat test test/SimpleSwap.test.js
```

---

## ✅ Test Coverage

### 🧩 `SimpleSwap.sol`

- [x] Proper deployment and token validation
- [x] `addLiquidity()` and `removeLiquidity()` with slippage protection
- [x] Token swaps with multiple routing paths (`path`)
- [x] Reserve and price queries (`getReserves`, `getPrice`)
- [x] Admin controls: `pause`, `unpause`, `emergencyWithdraw`
- [x] Input validations: token sorting, zero addresses, expired deadlines
- [x] Custom error handling with `require` and `revert`

### 💠 ERC-20 Tokens (`TokenA.sol`, `TokenB.sol`)

- [x] Correct initialization (name, symbol, total supply)
- [x] Transfers, balances, and approvals

### 🛠️ Utilities (`helpers.js`)

Located in `test/utils/helpers.js`, this file includes utility functions to reduce boilerplate:

- `toEth(n)` – converts a number to `ethers.utils.parseEther`
- `getDeadline()` – returns a timestamp 5 minutes in the future
- `approveMax(token, owner, spender)` – grants max allowance for token usage

---

## 📊 Code Coverage

To generate the test coverage report (using [solidity-coverage](https://github.com/sc-forks/solidity-coverage)):

```bash
npx hardhat coverage
```

The report will be saved in the `/coverage` folder.

---

## 📌 Notes

- This project includes mock ERC-20 tokens and the full AMM contract for testing purposes.
- Frontend integration is not included — this is strictly the smart contract and testing backend.
- CI/CD or audit pipelines can easily be integrated on top of this setup.

---

## 📄 License

MIT – see the [LICENSE](./LICENSE) file for details.

---

> ⚠️ Note: This environment is intended for development, education, and early validation. A formal audit is strongly recommended before mainnet deployment.

```

---

```
