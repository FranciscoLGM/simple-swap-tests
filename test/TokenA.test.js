const { expect } = require("chai");
const { toEth, deployToken } = require("./utils/helpers");

/**
 * Test suite for TokenA ERC20 token contract
 * @dev Tests cover basic ERC20 functionality including:
 *      - Token metadata (name, symbol, decimals)
 *      - Initial supply distribution
 *      - Token transfers
 */
describe("TokenA", () => {
  // Standard transfer amount for tests (100 tokens converted to wei)
  const transferAmount = toEth(100);

  // Test variables
  let totalSupply; // Stores the token's total supply
  let tokenA; // TokenA contract instance
  let owner, addr1; // Test accounts (owner and recipient)

  /**
   * Setup hook runs before all tests
   * @dev Deploys TokenA contract and initializes test environment
   */
  before(async () => {
    // Get test accounts from ethers
    [owner, addr1] = await ethers.getSigners();

    // Deploy TokenA contract with:
    // - Name: "TokenA"
    // - Initial owner: first test account
    tokenA = await deployToken("TokenA", owner.address);

    // Store total supply for later assertions
    totalSupply = await tokenA.totalSupply();
  });

  /**
   * Test Token Metadata
   * @dev Verifies the token's name and symbol match expected values
   */
  it("Should have correct name and symbol", async () => {
    // ERC20 name should be "TokenA"
    expect(await tokenA.name()).to.equal("TokenA");
    // ERC20 symbol should be "TKA"
    expect(await tokenA.symbol()).to.equal("TKA");
  });

  /**
   * Test Decimal Places
   * @dev Verifies token uses standard 18 decimal places
   */
  it("Should have 18 decimals", async () => {
    // Standard ERC20 decimals should be 18
    expect(await tokenA.decimals()).to.equal(18);
  });

  /**
   * Test Initial Distribution
   * @dev Verifies total supply was minted to owner address
   */
  it("Should mint total supply to owner", async () => {
    // Get owner's balance
    const balance = await tokenA.balanceOf(owner.address);
    // Owner should have entire initial supply
    expect(balance).to.equal(totalSupply);
  });

  /**
   * Test Supply Amount
   * @dev Verifies initial supply matches expected 1,000,000 tokens
   */
  it("Should have correct initial supply", async () => {
    // Total supply should equal 1 million tokens (converted to wei)
    expect(totalSupply).to.equal(toEth(1_000_000));
  });

  /**
   * Test Token Transfers
   * @dev Verifies tokens can be transferred between accounts
   */
  it("Should transfer tokens between accounts", async () => {
    // Transfer 100 tokens from owner to addr1
    await tokenA.transfer(addr1.address, transferAmount);

    // Verify addr1 received correct amount
    const addr1Balance = await tokenA.balanceOf(addr1.address);
    expect(addr1Balance).to.equal(transferAmount);
  });
});
