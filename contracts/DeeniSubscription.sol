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

    /// @notice Unix timestamp at which each user's subscription access expires.
    ///         A value of 0 means the user has never subscribed. A value in
    ///         the past means the subscription has lapsed.
    mapping(address => uint256) public subscriptionExpiry;
    /// @notice Tracks whether each address has already claimed the one-time
    ///         free trial. Once true, `startFreeTrial` will revert for that
    ///         address forever.
    mapping(address => bool) public hasClaimedTrial;

    /// @notice The current owner of the contract. The owner can withdraw
    ///         funds, pause/unpause user actions, and transfer ownership.
    address public owner;

    /// @notice Emitted when a user successfully claims the one-time free trial.
    /// @param user   The address that claimed the trial.
    /// @param expiry Unix timestamp at which the trial access expires.
    event TrialStarted(address indexed user, uint256 expiry);
    /// @notice Emitted when a user pays the subscription fee and extends access.
    /// @param user      The address that paid.
    /// @param newExpiry Unix timestamp at which the new subscription expires.
    /// @param amount    The amount of CELO paid (in wei).
    event SubscriptionPaid(address indexed user, uint256 newExpiry, uint256 amount);
    /// @notice Emitted when the owner withdraws accumulated CELO from the contract.
    /// @param to     The destination address that received the funds.
    /// @param amount The amount of CELO withdrawn (in wei).
    event Withdrawn(address indexed to, uint256 amount);
    /// @notice Emitted when ownership of the contract is transferred.
    ///         Used for both the initial assignment in the constructor and
    ///         the two-step transfer finalisation in `acceptOwnership`.
    /// @param previousOwner The address that owned the contract before.
    /// @param newOwner      The address that owns the contract after.
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

    /// @notice Restricts execution to the current contract owner.
    /// @dev    Reverts with "Not owner" if `msg.sender` is not the owner.
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    /// @notice Reverts while the contract is paused. Applied to user-facing
    ///         subscription actions only; admin functions remain available.
    /// @dev    Reverts with "Paused" if the `paused` flag is true.
    modifier whenNotPaused() {
        require(!paused, "Paused");
        _;
    }

    /// @notice Deploys the contract and assigns ownership to the deployer.
    /// @dev    Emits an initial `OwnershipTransferred` event from the zero
    ///         address so off-chain indexers can detect the deployment and
    ///         record the first owner without an extra transaction.
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
    /// @dev    Does NOT credit the sender's subscription - it only emits an
    ///         event so the owner can decide what to do with the funds. This
    ///         keeps the contract's accounting model simple and avoids
    ///         accidental double-crediting when a user pays via paySubscription
    ///         and also sends a tip.
    receive() external payable {
        emit Received(msg.sender, msg.value);
    }

    /// @notice Fallback for non-call-data sends. Same behaviour as receive().
    /// @dev    Kept for completeness; in practice plain CELO transfers hit
    ///         receive() and only malformed calls hit fallback().
    fallback() external payable {
        emit Received(msg.sender, msg.value);
    }

    /// @notice Claim the one-time 30-day free trial.
    /// @dev    Each address may claim the trial at most once. The trial is
    ///         also blocked while the user already has an active paid
    ///         subscription - they should let it lapse (or cancel) before
    ///         claiming the trial, otherwise they would effectively get a
    ///         free month on top of their paid month.
    /// @dev    Reverts with "Free trial already claimed" if the caller has
    ///         previously claimed the trial, "Already subscribed" if their
    ///         subscription is still active, or "Paused" if the contract is
    ///         paused.
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
    /// @dev    The new expiry is computed as max(currentExpiry, now) +
    ///         SUBSCRIPTION_DURATION. This means:
    ///         - If the user is currently subscribed, the 30 days are added
    ///           on top of their existing expiry (no time is lost).
    ///         - If the subscription has lapsed, the 30 days start from now.
    ///         This is the standard "extend, don't reset" model used by most
    ///         subscription services.
    /// @dev    Reverts with "Must pay exactly 5 CELO" if msg.value does not
    ///         match SUBSCRIPTION_FEE, or "Paused" if the contract is paused.
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

    /// @notice Returns whether the caller-supplied address currently has an active subscription.
    /// @param user The address whose subscription status is being queried.
    /// @return True if `user` has paid (or trialed) and the resulting expiry is still in the future.
    /// @dev A subscription is considered active when `subscriptionExpiry[user] >= block.timestamp`.
    ///      This means a subscription that expires exactly at the current block timestamp is still
    ///      reported as active. Users who have never paid or trialed return false because their
    ///      stored expiry is the default zero, which is always in the past.
    function isSubscribed(address user) external view returns (bool) {
        return subscriptionExpiry[user] >= block.timestamp;
    }

    /// @notice Returns the unix timestamp (seconds since epoch) at which the user's access expires.
    /// @param user The address whose expiry is being queried.
    /// @return The expiry timestamp, or zero if the user has never subscribed or trialed.
    /// @dev The frontend uses this value to render countdown timers and "days remaining" labels.
    ///      A return value of zero means the user has no recorded subscription and should be
    ///      prompted to start a trial or pay. The value is a unix timestamp in seconds and is
    ///      comparable directly against `block.timestamp`.
    function getExpiry(address user) external view returns (uint256) {
        return subscriptionExpiry[user];
    }

    /// @notice Returns whether the user has already redeemed their one-time free trial.
    /// @param user The address whose trial status is being queried.
    /// @return True if `user` has previously called `startFreeTrial`, false otherwise.
    /// @dev This flag is permanent: once set it can never be cleared. The contract enforces the
    ///      same invariant in `startFreeTrial` by reverting when the flag is already true, so
    ///      this view is the canonical way for off-chain clients to decide whether to show the
    ///      "Start free trial" button or hide it in favour of the "Pay subscription" option.
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

    /// @notice Owner withdraws the entire CELO balance held by this contract.
    /// @param to The destination address that will receive the funds. Must be a payable address
    ///           capable of receiving plain ETH/CELO transfers (contracts without a receive/fallback
    ///           function will cause this call to revert).
    /// @dev Uses the checks-effects-interactions pattern with a reentrancy guard. The state
    ///      (balance read) is captured BEFORE the external call, and the lock prevents a
    ///      malicious recipient from re-entering `withdraw` (or any future guarded function)
    ///      during the transfer. The function reverts with "Nothing to withdraw" when the
    ///      contract holds no balance, which avoids emitting a misleading zero-value event and
    ///      saves gas on no-op calls. On a failed transfer the entire transaction reverts and
    ///      no `Withdrawn` event is emitted, so off-chain indexers can rely on the event as
    ///      proof of a successful payout.
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

    /// @notice Step 1 of the two-step ownership transfer: nominate a new owner.
    /// @param newOwner The address that will become the owner if it accepts the transfer.
    /// @dev The current owner remains in control until the nominated address calls
    ///      `acceptOwnership`. This two-step pattern prevents accidental transfers to
    ///      mistyped or unrecoverable addresses. Reverts with "Zero address" if
    ///      `newOwner` is the zero address and with "Already owner" if it equals the
    ///      current owner (which would otherwise be a no-op that still emits an event).
    ///      Calling this function while a previous transfer is still pending simply
    ///      overwrites `pendingOwner` with the new nominee; the previous nominee loses
    ///      its pending status without ever being notified.
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Zero address");
        require(newOwner != owner, "Already owner");
        pendingOwner = newOwner;
        emit OwnershipTransferStarted(owner, newOwner);
    }

    /// @notice Step 2 of the two-step ownership transfer: the nominated pending owner
    ///         accepts and becomes the new owner.
    /// @dev Anyone can call this function but only the pending owner will succeed.
    ///      Reverts with "Not pending owner" if `msg.sender` is not the current
    ///      `pendingOwner`, and with "No pending transfer" if there is no pending
    ///      transfer (i.e. `pendingOwner` is the zero address). On success the
    ///      previous owner is recorded in the `OwnershipTransferred` event for
    ///      off-chain indexers and `pendingOwner` is reset to zero so a new
    ///      transfer can be initiated later.
    function acceptOwnership() external {
        address pending = pendingOwner;
        require(msg.sender == pending, "Not pending owner");
        require(pending != address(0), "No pending transfer");

        address previousOwner = owner;
        owner = pending;
        pendingOwner = address(0);

        emit OwnershipTransferred(previousOwner, pending);
    }

    /// @notice Cancel a pending ownership transfer before it has been accepted.
    /// @dev Only callable by the current owner. Useful if the nominated address was
    ///      wrong, lost its keys, or otherwise can no longer accept. Reverts with
    ///      "No pending transfer" if there is nothing to cancel. The cancelled
    ///      nominee is included in the `OwnershipTransferCancelled` event so the
    ///      off-chain nominee (if it is monitoring events) can be notified that
    ///      it no longer needs to call `acceptOwnership`.
    function cancelOwnershipTransfer() external onlyOwner {
        address pending = pendingOwner;
        require(pending != address(0), "No pending transfer");
        pendingOwner = address(0);
        emit OwnershipTransferCancelled(owner, pending);
    }

    /// @notice Pause user-facing subscription actions.
    /// @dev Use this in an emergency (e.g. discovered vulnerability, planned migration,
    ///      regulatory request). Admin functions (`withdraw`, ownership management)
    ///      remain available so funds are never locked. Reverts with "Already paused"
    ///      if the contract is already paused, which avoids emitting a redundant
    ///      `Paused` event. While paused, `startFreeTrial` and `paySubscription` both
    ///      revert because they carry the `whenNotPaused` modifier; existing
    ///      subscriptions continue to be queryable through the view functions and
    ///      remain valid until their stored expiry timestamp.
    function pause() external onlyOwner {
        require(!paused, "Already paused");
        paused = true;
        emit Paused(msg.sender);
    }

    /// @notice Resume user-facing subscription actions after a pause.
    /// @dev Reverts with "Not paused" if the contract is not currently paused, which
    ///      avoids emitting a redundant `Unpaused` event. After unpausing, new users
    ///      can once again call `startFreeTrial` and `paySubscription`. Users whose
    ///      subscription expired during the pause window must start a new trial or
    ///      pay again to regain access.
    function unpause() external onlyOwner {
        require(paused, "Not paused");
        paused = false;
        emit Unpaused(msg.sender);
    }
}
