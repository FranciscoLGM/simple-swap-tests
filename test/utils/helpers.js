const { ethers } = require("hardhat");

const toEth = (value) => ethers.parseEther(value.toString());

const getDeadline = (minutes = 5) =>
  Math.floor(Date.now() / 1000) + 60 * minutes;

const approveMax = async (token, spender) => {
  await token.approve(spender, toEth(1_000_000));
};

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
