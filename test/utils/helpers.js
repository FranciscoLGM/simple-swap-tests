const { ethers } = require("hardhat");

/**
 * Converts a value to Ether (wei units)
 * @dev Wrapper for ethers.parseEther with simplified interface
 * @param {number|string} value - The amount in Ether to convert to wei
 * @returns {BigNumber} The value in wei (10^18 wei = 1 Ether)
 */
const toEth = (value) => ethers.parseEther(value.toString());

/**
 * Calculates a future or past deadline timestamp
 * @dev Useful for time-limited transactions
 * @param {number} [minutes=5] - Minutes to add or subtract to current time
 * @returns {number} Unix timestamp (seconds since epoch)
 */
const getDeadline = (minutes = 5) =>
  Math.floor(Date.now() / 1000) + 60 * minutes;

/**
 * Approves maximum allowance for a spender
 * @dev Uses standard test amount of 1,000,000 tokens
 * @param {Contract} token - The ERC20 token contract instance
 * @param {string} spender - The address to grant allowance to
 * @returns {Promise} Transaction promise
 */
const approveMax = async (token, spender) => {
  await token.approve(spender, toEth(1_000_000));
};

/**
 * Deploys an ERC20 token contract
 * @dev Factory pattern for token deployment
 * @param {string} tokenName - Name of the token contract to deploy
 * @param {string} ownerAddress - Address to receive initial supply
 * @returns {Promise<Contract>} The deployed token contract instance
 */
const deployToken = async (tokenName, ownerAddress) => {
  const Token = await ethers.getContractFactory(tokenName);
  return Token.deploy(ownerAddress);
};

module.exports = {
  toEth,
  getDeadline,
  approveMax,
  deployToken,
};
