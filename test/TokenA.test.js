const { expect } = require("chai");
const { toEth, deployToken } = require("./utils/helpers");

describe("TokenA", () => {
  // This test suite is for a simple ERC20 token named TokenA
  // It checks basic functionalities like name, symbol, decimals, minting, and transferring tokens

  const transferAmount = toEth(100);

  let totalSupply;
  let tokenA;
  let owner, addr1;

  before(async () => {
    [owner, addr1] = await ethers.getSigners();
    tokenA = await deployToken("TokenA", owner.address);
    totalSupply = await tokenA.totalSupply();
  });

  it("Should have correct name and symbol", async () => {
    expect(await tokenA.name()).to.equal("TokenA");
    expect(await tokenA.symbol()).to.equal("TKA");
  });

  it("Should have 18 decimals", async () => {
    expect(await tokenA.decimals()).to.equal(18);
  });

  it("Should mint total supply to owner", async () => {
    const balance = await tokenA.balanceOf(owner.address);
    expect(balance).to.equal(totalSupply);
  });

  it("Should have correct initial supply", async () => {
    expect(totalSupply).to.equal(toEth(1_000_000));
  });

  it("Should transfer tokens between accounts", async () => {
    await tokenA.transfer(addr1.address, transferAmount);
    const addr1Balance = await tokenA.balanceOf(addr1.address);
    expect(addr1Balance).to.equal(transferAmount);
  });
});
