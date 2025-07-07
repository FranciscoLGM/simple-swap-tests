const { expect } = require("chai");
const { ethers } = require("hardhat");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const {
  toEth,
  getDeadline,
  approveMax,
  deployToken,
} = require("./utils/helpers");

/**
 * @file Test suite for SimpleSwap contract
 * @description Comprehensive tests covering all major functionalities of the SimpleSwap DEX
 * @module SimpleSwapTests
 */

describe("SimpleSwap", () => {
  // ========== UTILITY FUNCTIONS ==========

  /**
   * Adds liquidity to a token pair pool
   * @param {BigNumber} amountA - Amount of token A to deposit
   * @param {BigNumber} amountB - Amount of token B to deposit
   * @param {number} deadline - Transaction deadline timestamp
   * @returns {Promise<ContractTransaction>} Transaction response
   */
  const addLiquidity = async (
    amountA = toEth(100),
    amountB = toEth(200),
    deadline = getDeadline()
  ) => {
    return simpleSwap.addLiquidity(
      tokenA.target,
      tokenB.target,
      amountA,
      amountB,
      0,
      0,
      owner.address,
      deadline
    );
  };

  /**
   * Removes liquidity from a token pair pool
   * @param {BigNumber} liquidity - Amount of LP tokens to burn
   * @param {BigNumber} minA - Minimum amount of token A to receive
   * @param {BigNumber} minB - Minimum amount of token B to receive
   * @param {string} recipient - Address to receive the tokens
   * @param {number} deadline - Transaction deadline timestamp
   * @returns {Promise<ContractTransaction>} Transaction response
   */
  const removeLiquidity = async (
    liquidity,
    minA = 0,
    minB = 0,
    recipient = owner.address,
    deadline = getDeadline()
  ) => {
    return simpleSwap.removeLiquidity(
      tokenA.target,
      tokenB.target,
      liquidity,
      minA,
      minB,
      recipient,
      deadline
    );
  };

  /**
   * Swaps exact tokens for tokens along a specified path
   * @param {BigNumber} amountIn - Amount of input tokens
   * @param {BigNumber} minOut - Minimum amount of output tokens
   * @param {string[]} path - Array of token addresses representing swap path
   * @param {string} recipient - Address to receive the output tokens
   * @param {number} deadline - Transaction deadline timestamp
   * @returns {Promise<ContractTransaction>} Transaction response
   */
  const swapTokens = async (
    amountIn,
    minOut,
    path,
    recipient = owner.address,
    deadline = getDeadline()
  ) => {
    return simpleSwap.swapExactTokensForTokens(
      amountIn,
      minOut,
      path,
      recipient,
      deadline
    );
  };

  // ========== GLOBAL VARIABLES ==========

  let tokenA, tokenB, simpleSwap, SimpleSwap;
  let owner, addr1, addr2;

  // ========== SETUP ==========

  /**
   * Initial setup before all tests run
   * - Deploys test tokens (TokenA and TokenB)
   * - Deploys SimpleSwap contract
   * - Sets up token approvals
   */
  before(async () => {
    // Get test accounts
    [owner, addr1, addr2] = await ethers.getSigners();

    // Deploy test tokens
    tokenA = await deployToken("TokenA", owner.address);
    tokenB = await deployToken("TokenB", owner.address);

    // Deploy SimpleSwap contract
    SimpleSwap = await ethers.getContractFactory("SimpleSwap");
    simpleSwap = await SimpleSwap.deploy();

    // Approve max allowance for SimpleSwap to spend tokens
    await Promise.all([
      approveMax(tokenA, simpleSwap.target),
      approveMax(tokenB, simpleSwap.target),
    ]);
  });

  /**
   * After each test, ensure contract is unpaused
   */
  afterEach(async () => {
    if (await simpleSwap.paused()) await simpleSwap.unpause();
  });

  // ========== TEST SUITES ==========

  describe("Initialization", () => {
    /**
     * @test Verifies correct initialization of LP token metadata
     */
    it("should set correct LP token name and symbol", async () => {
      expect(await simpleSwap.name()).to.equal("SimpleSwap LP");
      expect(await simpleSwap.symbol()).to.equal("SS-LP");
    });
  });

  describe("Add Liquidity", () => {
    /**
     * @test Verifies successful creation of a new liquidity pool
     */
    it("should create a new pool successfully", async () => {
      const tx = await addLiquidity();
      await expect(tx)
        .to.emit(simpleSwap, "LiquidityAdded")
        .withArgs(
          owner.address,
          tokenA.target,
          tokenB.target,
          toEth(100),
          toEth(200),
          anyValue
        );
    });

    /**
     * @test Verifies proper validation of invalid parameters
     */
    it("should revert on invalid parameters", async () => {
      const expired = getDeadline(-100);

      // Test identical tokens
      await expect(
        simpleSwap.addLiquidity(
          tokenA.target,
          tokenA.target,
          toEth(100),
          toEth(100),
          0,
          0,
          owner.address,
          getDeadline()
        )
      ).to.be.revertedWithCustomError(simpleSwap, "IdenticalTokens");

      // Test zero amount
      await expect(
        simpleSwap.addLiquidity(
          tokenA.target,
          tokenB.target,
          0,
          toEth(100),
          0,
          0,
          owner.address,
          getDeadline()
        )
      ).to.be.revertedWithCustomError(simpleSwap, "ZeroAmount");

      // Test expired deadline
      await expect(
        simpleSwap.addLiquidity(
          tokenA.target,
          tokenB.target,
          toEth(100),
          toEth(100),
          0,
          0,
          owner.address,
          expired
        )
      ).to.be.revertedWithCustomError(simpleSwap, "DeadlinePassed");

      // Test when contract is paused
      await simpleSwap.pause();
      await expect(addLiquidity()).to.be.revertedWithCustomError(
        simpleSwap,
        "EnforcedPause"
      );
    });

    /**
     * @test Verifies minimum amount validation works correctly
     */
    it("should validate minimum amounts", async () => {
      // Test minimum amount for token A
      await expect(
        simpleSwap.addLiquidity(
          tokenA.target,
          tokenB.target,
          toEth(100),
          toEth(200),
          toEth(101),
          0,
          owner.address,
          getDeadline()
        )
      ).to.be.revertedWithCustomError(simpleSwap, "BelowMinimumAmount");

      // Test minimum amount for token B
      await expect(
        simpleSwap.addLiquidity(
          tokenA.target,
          tokenB.target,
          toEth(100),
          toEth(200),
          0,
          toEth(201),
          owner.address,
          getDeadline()
        )
      ).to.be.revertedWithCustomError(simpleSwap, "BelowMinimumAmount");
    });

    /**
     * @test Verifies handling of asymmetric deposits
     */
    it("should handle asymmetric deposits correctly", async () => {
      // Initial liquidity
      await addLiquidity();

      // Asymmetric additional liquidity
      const tx = await simpleSwap.addLiquidity(
        tokenA.target,
        tokenB.target,
        toEth(100),
        toEth(150),
        0,
        0,
        owner.address,
        getDeadline()
      );
      await expect(tx).to.emit(simpleSwap, "LiquidityAdded");
    });
  });

  describe("Swap Tokens", () => {
    // Add initial liquidity before each swap test
    beforeEach(async () => await addLiquidity());

    /**
     * @test Verifies successful token swap
     */
    it("should perform a successful token swap", async () => {
      const tx = await swapTokens(toEth(10), toEth(5), [
        tokenA.target,
        tokenB.target,
      ]);
      await expect(tx).to.emit(simpleSwap, "Swap");
    });

    /**
     * @test Verifies proper validation of invalid swap conditions
     */
    it("should revert on invalid swap paths or conditions", async () => {
      const expired = getDeadline(-100);
      const newToken = await deployToken("TokenA", owner.address);

      // Test invalid path (only 1 token)
      await expect(
        swapTokens(toEth(10), 0, [tokenA.target])
      ).to.be.revertedWithCustomError(simpleSwap, "InvalidPath");

      // Test expired deadline
      await expect(
        swapTokens(
          toEth(10),
          0,
          [tokenA.target, tokenB.target],
          owner.address,
          expired
        )
      ).to.be.revertedWithCustomError(simpleSwap, "DeadlinePassed");

      // Test insufficient liquidity
      await expect(
        swapTokens(toEth(10), 0, [tokenA.target, newToken.target])
      ).to.be.revertedWithCustomError(simpleSwap, "InsufficientLiquidity");

      // Test when contract is paused
      await simpleSwap.pause();
      await expect(
        swapTokens(toEth(10), toEth(5), [tokenA.target, tokenB.target])
      ).to.be.revertedWithCustomError(simpleSwap, "EnforcedPause");
    });

    /**
     * @test Verifies minimum output validation and correct output calculation
     */
    it("should revert on minimum output not met and calculate correct output", async () => {
      // Get current reserves
      const [reserveA, reserveB] = await simpleSwap.getReserves(
        tokenA.target,
        tokenB.target
      );

      // Calculate expected output
      const expectedOut = await simpleSwap.getAmountOut(
        toEth(100),
        reserveA,
        reserveB
      );

      // Test minimum output validation
      await expect(
        swapTokens(toEth(100), expectedOut + 1n, [tokenA.target, tokenB.target])
      ).to.be.revertedWithCustomError(simpleSwap, "BelowMinimumAmount");

      // Verify output calculation is correct
      const manualOut = (toEth(100) * reserveB) / (reserveA + toEth(100));
      expect(expectedOut).to.equal(manualOut);
    });
  });

  describe("Remove Liquidity", () => {
    // Add initial liquidity before each removal test
    beforeEach(async () => await addLiquidity());

    /**
     * @test Verifies successful liquidity removal
     */
    it("should remove liquidity successfully", async () => {
      // Get current LP token balance
      const lp = await simpleSwap.balanceOf(owner.address);

      // Remove half of liquidity
      const tx = await removeLiquidity(lp / 2n);
      await expect(tx).to.emit(simpleSwap, "LiquidityRemoved");
    });

    /**
     * @test Verifies proper validation of invalid removal cases
     */
    it("should handle invalid removal cases", async () => {
      const lp = await simpleSwap.balanceOf(owner.address);

      // Test zero amount
      await expect(removeLiquidity(0)).to.be.revertedWithCustomError(
        simpleSwap,
        "ZeroAmount"
      );

      // Test invalid recipient
      await expect(
        removeLiquidity(lp, 0, 0, ethers.ZeroAddress)
      ).to.be.revertedWithCustomError(tokenA, "ERC20InvalidReceiver");

      // Test when contract is paused
      await simpleSwap.pause();
      await expect(removeLiquidity(lp)).to.be.revertedWithCustomError(
        simpleSwap,
        "EnforcedPause"
      );
    });

    /**
     * @test Verifies minimum amount validation on removal
     */
    it("should validate minimum amounts on removal", async () => {
      const lp = await simpleSwap.balanceOf(owner.address);

      // Get current reserves
      const [reserveA, reserveB] = await simpleSwap.getReserves(
        tokenA.target,
        tokenB.target
      );

      // Calculate expected amounts plus 1 to force failure
      const total = await simpleSwap.totalSupply();
      const minA = (lp * reserveA) / total + 1n;
      const minB = (lp * reserveB) / total + 1n;

      // Test minimum amount validation for token A
      await expect(removeLiquidity(lp, minA)).to.be.revertedWithCustomError(
        simpleSwap,
        "BelowMinimumAmount"
      );

      // Test minimum amount validation for token B
      await expect(removeLiquidity(lp, 0, minB)).to.be.revertedWithCustomError(
        simpleSwap,
        "BelowMinimumAmount"
      );
    });
  });

  describe("Pause/Unpause", () => {
    /**
     * @test Verifies pause/unpause functionality works correctly
     */

    it("should toggle pause state correctly", async () => {
      // Pause and verify
      await simpleSwap.pause();
      expect(await simpleSwap.paused()).to.be.true;

      // Unpause and verify
      await simpleSwap.unpause();
      expect(await simpleSwap.paused()).to.be.false;
    });

    it("should revert when non-owner tries to pause", async () => {
      await expect(simpleSwap.connect(addr1).pause())
        .to.be.revertedWithCustomError(simpleSwap, "OwnableUnauthorizedAccount")
        .withArgs(addr1.address);
    });

    it("should revert when non-owner tries to unpause", async () => {
      await expect(simpleSwap.connect(addr1).unpause())
        .to.be.revertedWithCustomError(simpleSwap, "OwnableUnauthorizedAccount")
        .withArgs(addr1.address);
    });
  });

  describe("Emergency Functions", () => {
    const testAmount = toEth(100);

    // Transfer some tokens to contract before emergency tests
    before(async () => {
      await tokenA.transfer(simpleSwap.target, testAmount);
    });

    /**
     * @test Verifies emergency withdrawal works when paused
     */
    it("should allow emergency withdraw when paused", async () => {
      await simpleSwap.pause();
      const balance = await tokenA.balanceOf(simpleSwap.target);

      await expect(
        simpleSwap.emergencyWithdraw(tokenA.target, owner.address, balance)
      ).to.emit(simpleSwap, "EmergencyWithdraw");

      // Return tokens for subsequent tests
      await tokenA.transfer(simpleSwap.target, balance);
    });

    /**
     * @test Verifies proper validation of emergency withdraw parameters
     */
    it("should revert when not paused or invalid parameters", async () => {
      // Ensure contract is unpaused
      if (await simpleSwap.paused()) await simpleSwap.unpause();

      // Test when not paused
      await expect(
        simpleSwap.emergencyWithdraw(tokenA.target, owner.address, 100)
      ).to.be.revertedWithCustomError(simpleSwap, "ExpectedPause");

      // Pause for remaining tests
      await simpleSwap.pause();

      // Test invalid token address
      await expect(
        simpleSwap.emergencyWithdraw(ethers.ZeroAddress, owner.address, 100)
      ).to.be.revertedWithCustomError(simpleSwap, "InvalidTokenAddress");

      // Test invalid recipient
      await expect(
        simpleSwap.emergencyWithdraw(tokenA.target, ethers.ZeroAddress, 100)
      ).to.be.revertedWithCustomError(simpleSwap, "InvalidRecipient");

      // Test zero amount
      await expect(
        simpleSwap.emergencyWithdraw(tokenA.target, owner.address, 0)
      ).to.be.revertedWithCustomError(simpleSwap, "ZeroAmount");
    });
  });

  describe("Price Calculations", () => {
    // Ensure there's liquidity before price tests
    beforeEach(async () => {
      const [res] = await simpleSwap.getReserves(tokenA.target, tokenB.target);
      if (res === 0n) await addLiquidity(toEth(1000), toEth(2000));
    });

    /**
     * @test Verifies correct price calculations
     */
    it("should return correct price and inverse", async () => {
      // Get current reserves
      const [resA, resB] = await simpleSwap.getReserves(
        tokenA.target,
        tokenB.target
      );

      // Calculate expected price and inverse
      const price = (resB * toEth(1)) / resA;
      const inverse = (resA * toEth(1)) / resB;

      // Verify price calculations
      expect(await simpleSwap.getPrice(tokenA.target, tokenB.target)).to.equal(
        price
      );
      expect(await simpleSwap.getPrice(tokenB.target, tokenA.target)).to.equal(
        inverse
      );
    });

    /**
     * @test Verifies proper validation for price queries
     */
    it("should revert for invalid price queries", async () => {
      const tokenC = await deployToken("TokenA", owner.address);

      // Test identical tokens
      await expect(
        simpleSwap.getPrice(tokenA.target, tokenA.target)
      ).to.be.revertedWithCustomError(simpleSwap, "IdenticalTokens");

      // Test insufficient liquidity
      await expect(
        simpleSwap.getPrice(tokenA.target, tokenC.target)
      ).to.be.revertedWithCustomError(simpleSwap, "InsufficientLiquidity");
    });
  });

  describe("Reserve Management", () => {
    // Add initial liquidity before reserve tests
    beforeEach(async () => await addLiquidity());

    /**
     * @test Verifies reserves are updated correctly after swaps
     */
    it("should update reserves after swap", async () => {
      // Get initial reserves
      const [initialA, initialB] = await simpleSwap.getReserves(
        tokenA.target,
        tokenB.target
      );

      // Calculate expected output
      const out = await simpleSwap.getAmountOut(toEth(100), initialA, initialB);

      // Perform swap
      await swapTokens(toEth(100), 0, [tokenA.target, tokenB.target]);

      // Get new reserves
      const [newA, newB] = await simpleSwap.getReserves(
        tokenA.target,
        tokenB.target
      );

      // Verify reserves updated correctly
      expect(newA).to.equal(initialA + toEth(100));
      expect(newB).to.equal(initialB - out);
    });

    /**
     * @test Verifies reserves are returned in correct order regardless of input order
     */
    it("should return reserves in correct order", async () => {
      // Get reserves in both directions
      const [ra, rb] = await simpleSwap.getReserves(
        tokenA.target,
        tokenB.target
      );
      const [rbInv, raInv] = await simpleSwap.getReserves(
        tokenB.target,
        tokenA.target
      );

      // Verify order is maintained
      expect(ra).to.equal(raInv);
      expect(rb).to.equal(rbInv);
    });
  });

  describe("Edge Cases", () => {
    /**
     * @test Verifies correct LP token minting for initial 1:1 deposit
     */
    it("should mint exactly 1e18 LP tokens when adding 1e18 of both tokens to a new pool", async () => {
      // Deploy isolated token pair
      const Token = await ethers.getContractFactory("TokenA");
      const tokenC = await Token.deploy(owner.address);
      const tokenD = await Token.deploy(owner.address);

      // Deploy fresh SimpleSwap instance for isolation
      const Swap = await ethers.getContractFactory("SimpleSwap");
      const isolatedSwap = await Swap.deploy();

      // Approve and add initial 1:1 liquidity
      await tokenC.approve(isolatedSwap.target, toEth(1));
      await tokenD.approve(isolatedSwap.target, toEth(1));

      await isolatedSwap.addLiquidity(
        tokenC.target,
        tokenD.target,
        toEth(1),
        toEth(1),
        0,
        0,
        owner.address,
        getDeadline()
      );

      // Verify exactly 1 LP token minted
      const lpBalance = await isolatedSwap.balanceOf(owner.address);
      expect(lpBalance).to.equal(toEth(1));
    });
  });
});
