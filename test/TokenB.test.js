const { expect } = require("chai");
const { toEth, deployToken } = require("./utils/helpers");

describe("TokenB", () => {
  // This test suite is for a simple ERC20 token named TokenB
  // It checks basic functionalities like name, symbol, decimals, minting, and transferring tokens

  const transferAmount = toEth(100);

  let totalSupply;
  let tokenB;
  let owner, addr1;

  before(async () => {
    [owner, addr1] = await ethers.getSigners();
    tokenB = await deployToken("TokenB", owner.address);
    totalSupply = await tokenB.totalSupply();
  });

  it("Should have correct name and symbol", async () => {
    expect(await tokenB.name()).to.equal("TokenB");
    expect(await tokenB.symbol()).to.equal("TKB");
  });

  it("Should have 18 decimals", async () => {
    expect(await tokenB.decimals()).to.equal(18);
  });

  it("Should mint total supply to owner", async () => {
    const totalSupply = await tokenB.totalSupply();
    const balance = await tokenB.balanceOf(owner.address);
    expect(balance).to.equal(totalSupply);
  });

  it("Should have correct initial supply", async () => {
    expect(totalSupply).to.equal(toEth(1_000_000));
  });

  it("Should transfer tokens between accounts", async () => {
    await tokenB.transfer(addr1.address, transferAmount);
    const addr1Balance = await tokenB.balanceOf(addr1.address);
    expect(addr1Balance).to.equal(transferAmount);
  });
});
