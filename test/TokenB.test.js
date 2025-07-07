const { expect } = require("chai");
const { toEth, deployToken } = require("./utils/helpers");

/**
 * Test suite for TokenB ERC20 token contract
 * @dev Tests cover basic ERC20 functionality including:
 *      - Token metadata (name, symbol, decimals)
 *      - Initial supply distribution
 *      - Token transfers
 */
describe("TokenB", () => {
  // Standard transfer amount for tests (100 tokens converted to wei)
  const transferAmount = toEth(100);

  // Test variables
  let totalSupply; // Stores the token's total supply
  let tokenB; // TokenB contract instance
  let owner, addr1; // Test accounts (owner and recipient)

  /**
   * Setup hook runs before all tests
   * @dev Deploys TokenB contract and initializes test environment
   */
  before(async () => {
    // Get test accounts from ethers
    [owner, addr1] = await ethers.getSigners();

    // Deploy TokenB contract with:
    // - Name: "TokenB"
    // - Initial owner: first test account
    tokenB = await deployToken("TokenB", owner.address);

    // Store total supply for later assertions
    totalSupply = await tokenB.totalSupply();
  });

  /**
   * Test Token Metadata
   * @dev Verifies the token's name and symbol match expected values
   */
  it("Should have correct name and symbol", async () => {
    // ERC20 name should be "TokenB"
    expect(await tokenB.name()).to.equal("TokenB");
    // ERC20 symbol should be "TKB"
    expect(await tokenB.symbol()).to.equal("TKB");
  });

  /**
   * Test Decimal Places
   * @dev Verifies token uses standard 18 decimal places
   */
  it("Should have 18 decimals", async () => {
    // Standard ERC20 decimals should be 18
    expect(await tokenB.decimals()).to.equal(18);
  });

  /**
   * Test Initial Distribution
   * @dev Verifies total supply was minted to owner address
   */
  it("Should mint total supply to owner", async () => {
    // Get owner's balance
    const balance = await tokenB.balanceOf(owner.address);
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
    await tokenB.transfer(addr1.address, transferAmount);

    // Verify addr1 received correct amount
    const addr1Balance = await tokenB.balanceOf(addr1.address);
    expect(addr1Balance).to.equal(transferAmount);
  });
});
