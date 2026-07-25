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

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
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
    function startFreeTrial() external {
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
    function paySubscription() external payable {
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

    /// @notice Transfer contract ownership.
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Zero address");
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }
}
