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

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
        emit OwnershipTransferred(address(0), msg.sender);
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

    /// @notice Owner withdraws accumulated subscription fees.
    function withdraw(address payable to) external onlyOwner {
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
