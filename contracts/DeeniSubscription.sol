// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title DeeniSubscription
/// @notice On-chain subscription manager for the Deeni Islamic Mini App.
///         New users get a 1-month free trial; afterwards access costs 5 CELO / month.
///         Self-contained (no external imports) so it compiles cleanly in Remix.
contract DeeniSubscription {
    uint256 public constant SUBSCRIPTION_FEE = 5 ether; // 5 CELO
    uint256 public constant TRIAL_DURATION = 30 days;
    uint256 public constant SUBSCRIPTION_DURATION = 30 days;

    mapping(address => uint256) public subscriptionExpiry;
    mapping(address => bool) public hasClaimedTrial;

    address public owner;

    event TrialStarted(address indexed user, uint256 expiry);
    event SubscriptionPaid(address indexed user, uint256 newExpiry, uint256 amount);
    event Withdrawn(address indexed to, uint256 amount);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    /// @notice Emitted when the contract receives plain CELO via receive()/fallback().
    event Received(address indexed from, uint256 amount);
    /// @notice Emitted when the current owner nominates a new pending owner.
    event OwnershipTransferStarted(address indexed currentOwner, address indexed pendingOwner);
    /// @notice Emitted when a pending ownership transfer is cancelled.
    event OwnershipTransferCancelled(address indexed currentOwner, address indexed pendingOwner);
    /// @notice Emitted when the contract is paused by the owner.
    event Paused(address indexed account);
    /// @notice Emitted when the contract is unpaused by the owner.
    event Unpaused(address indexed account);

    /// @notice Circuit-breaker flag. While true, user-facing subscription
    ///         actions (startFreeTrial, paySubscription) are blocked. The
    ///         owner can still withdraw funds and manage ownership so that
    ///         emergencies do not lock the contract.
    bool public paused;

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    /// @notice Reverts while the contract is paused. Applied to user-facing
    ///         subscription actions only; admin functions remain available.
    modifier whenNotPaused() {
        require(!paused, "Paused");
        _;
    }

    constructor() {
        owner = msg.sender;
        emit OwnershipTransferred(address(0), msg.sender);
    }

    /// @notice Accept plain CELO transfers (e.g. tips, donations, or accidental
    ///         sends). Without this, any direct transfer to the contract would
    ///         revert because Solidity rejects transfers to contracts without
    ///         a receive() or fallback() function. Funds received here are
    ///         treated as subscription payments and can be withdrawn by the
    ///         owner via `withdraw`.
    receive() external payable {
        emit Received(msg.sender, msg.value);
    }

    /// @notice Fallback for non-call-data sends. Same behaviour as receive().
    fallback() external payable {
        emit Received(msg.sender, msg.value);
    }

    /// @notice Claim the one-time 30-day free trial.
    function startFreeTrial() external whenNotPaused {
        require(!hasClaimedTrial[msg.sender], "Free trial already claimed");
        require(
            subscriptionExpiry[msg.sender] < block.timestamp,
            "Already subscribed"
        );

        hasClaimedTrial[msg.sender] = true;
        uint256 expiry = block.timestamp + TRIAL_DURATION;
        subscriptionExpiry[msg.sender] = expiry;

        emit TrialStarted(msg.sender, expiry);
    }

    /// @notice Pay 5 CELO to extend the subscription by 30 days.
    function paySubscription() external payable whenNotPaused {
        require(msg.value == SUBSCRIPTION_FEE, "Must pay exactly 5 CELO");

        uint256 currentExpiry = subscriptionExpiry[msg.sender];
        if (currentExpiry < block.timestamp) {
            currentExpiry = block.timestamp;
        }

        uint256 newExpiry = currentExpiry + SUBSCRIPTION_DURATION;
        subscriptionExpiry[msg.sender] = newExpiry;

        emit SubscriptionPaid(msg.sender, newExpiry, msg.value);
    }

    /// @notice Returns true while the user's subscription is still active.
    function isSubscribed(address user) external view returns (bool) {
        return subscriptionExpiry[user] >= block.timestamp;
    }

    /// @notice Returns the unix timestamp at which the user's access expires (0 if never).
    function getExpiry(address user) external view returns (uint256) {
        return subscriptionExpiry[user];
    }

    /// @notice Returns whether the user has already claimed their free trial.
    function trialClaimed(address user) external view returns (bool) {
        return hasClaimedTrial[user];
    }

    // Reentrancy guard: protects external functions that perform an external
    // call (currently only `withdraw`). The lock is released automatically
    // when the function returns, even on revert.
    uint256 private _locked = 1;

    modifier nonReentrant() {
        require(_locked == 1, "Reentrant call");
        _locked = 2;
        _;
        _locked = 1;
    }

    /// @notice Owner withdraws accumulated subscription fees.
    /// @dev Uses the checks-effects-interactions pattern with a reentrancy
    ///      guard. The state (balance read) is captured BEFORE the external
    ///      call, and the lock prevents a malicious recipient from re-entering
    ///      `withdraw` (or any future guarded function) during the transfer.
    function withdraw(address payable to) external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        require(balance > 0, "Nothing to withdraw");
        (bool success, ) = to.call{value: balance}("");
        require(success, "Withdrawal failed");
        emit Withdrawn(to, balance);
    }

    /// @notice Pending owner set by the current owner. The transfer is only
    ///         finalised once the pending owner calls acceptOwnership().
    ///         This two-step pattern prevents accidental transfers to
    ///         mistyped or unrecoverable addresses.
    address public pendingOwner;

    /// @notice Step 1 of ownership transfer: nominate a new owner.
    ///         The new owner must call acceptOwnership() to complete the
    ///         transfer. The current owner remains in control until then.
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Zero address");
        require(newOwner != owner, "Already owner");
        pendingOwner = newOwner;
        emit OwnershipTransferStarted(owner, newOwner);
    }

    /// @notice Step 2 of ownership transfer: the nominated pending owner
    ///         accepts and becomes the new owner. Anyone can call this
    ///         but only the pending owner will succeed.
    function acceptOwnership() external {
        address pending = pendingOwner;
        require(msg.sender == pending, "Not pending owner");
        require(pending != address(0), "No pending transfer");

        address previousOwner = owner;
        owner = pending;
        pendingOwner = address(0);

        emit OwnershipTransferred(previousOwner, pending);
    }

    /// @notice Cancel a pending ownership transfer. Only callable by the
    ///         current owner. Useful if the nominated address was wrong.
    function cancelOwnershipTransfer() external onlyOwner {
        address pending = pendingOwner;
        require(pending != address(0), "No pending transfer");
        pendingOwner = address(0);
        emit OwnershipTransferCancelled(owner, pending);
    }

    /// @notice Pause user-facing subscription actions. Use this in an
    ///         emergency (e.g. discovered vulnerability, planned migration,
    ///         regulatory request). Admin functions (withdraw, ownership
    ///         management) remain available so funds are never locked.
    function pause() external onlyOwner {
        require(!paused, "Already paused");
        paused = true;
        emit Paused(msg.sender);
    }

    /// @notice Resume user-facing subscription actions after a pause.
    function unpause() external onlyOwner {
        require(paused, "Not paused");
        paused = false;
        emit Unpaused(msg.sender);
    }
}
