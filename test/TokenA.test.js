const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TokenA", function () {
  let TokenA;
  let tokenA;
  let owner, addr1;

  before(async function () {
    [owner, addr1] = await ethers.getSigners();
    TokenA = await ethers.getContractFactory("TokenA");
    tokenA = await TokenA.deploy(owner.address);
  });

  it("Should have correct name and symbol", async function () {
    expect(await tokenA.name()).to.equal("TokenA");
    expect(await tokenA.symbol()).to.equal("TKA");
  });

  it("Should have 18 decimals", async function () {
    expect(await tokenA.decimals()).to.equal(18);
  });

  it("Should mint total supply to owner", async function () {
    const ownerBalance = await tokenA.balanceOf(owner.address);
    expect(ownerBalance).to.equal(ethers.parseUnits("1000000", 18));
  });

  it("Should transfer tokens between accounts", async function () {
    const transferAmount = ethers.parseUnits("100", 18);
    await tokenA.transfer(addr1.address, transferAmount);

    const addr1Balance = await tokenA.balanceOf(addr1.address);
    expect(addr1Balance).to.equal(transferAmount);
  });
});
