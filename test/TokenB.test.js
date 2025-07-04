const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TokenB", function () {
  let TokenB;
  let tokenB;
  let owner;
  let addr1;

  before(async function () {
    [owner, addr1] = await ethers.getSigners();
    TokenB = await ethers.getContractFactory("TokenB");
    tokenB = await TokenB.deploy(owner.address);
  });

  it("Should have correct name and symbol", async function () {
    expect(await tokenB.name()).to.equal("TokenB");
    expect(await tokenB.symbol()).to.equal("TKB");
  });

  it("Should have 18 decimals", async function () {
    expect(await tokenB.decimals()).to.equal(18);
  });

  it("Should mint total supply to owner", async function () {
    const ownerBalance = await tokenB.balanceOf(owner.address);
    expect(ownerBalance).to.equal(ethers.parseUnits("1000000", 18));
  });

  it("Should transfer tokens between accounts", async function () {
    const transferAmount = ethers.parseUnits("100", 18);
    await tokenB.transfer(addr1.address, transferAmount);

    const addr1Balance = await tokenB.balanceOf(addr1.address);
    expect(addr1Balance).to.equal(transferAmount);
  });
});
