// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/// @notice Minimal ERC20 interface for token transfers
interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
}

/// @title BountyEscrow (MVP)
/// @notice Simple single-owner bounty escrow.
///         - Owner (human) creates/funds bounties.
///         - Any solver can claim.
///         - Solver submits proof.
///         - Owner accepts -> pays solver.
///         - Owner can cancel before payment.
/// @dev Keep it minimal; add disputes/milestones later.
contract BountyEscrow {
    // ─────────────────────────────────────────────────────────────────────
    // Reentrancy Guard
    // ─────────────────────────────────────────────────────────────────────
    uint256 private constant NOT_ENTERED = 1;
    uint256 private constant ENTERED = 2;
    uint256 private _status = NOT_ENTERED;

    modifier nonReentrant() {
        if (_status == ENTERED) revert ReentrancyDetected();
        _status = ENTERED;
        _;
        _status = NOT_ENTERED;
    }

    // ─────────────────────────────────────────────────────────────────────
    // Types
    // ─────────────────────────────────────────────────────────────────────
    enum Status {
        Open,
        Claimed,
        Submitted,
        Paid,
        Cancelled
    }

    struct Bounty {
        address creator;
        address solver;
        address token; // address(0) = native ETH
        uint256 amount;
        bytes32 metadataHash; // hash of off-chain JSON (incl acceptance criteria)
        uint64 createdAt;
        uint64 deadline; // 0 = none
        Status status;
    }

    // ─────────────────────────────────────────────────────────────────────
    // Custom Errors (precise and descriptive)
    // ─────────────────────────────────────────────────────────────────────
    error NotOwner();
    error InvalidBounty();
    error BadStatus(Status expected, Status got);
    error DeadlinePassed();
    error AlreadyClaimed();
    error NotSolver();
    error ZeroAmount();
    error InvalidToken();
    error EthTransferFailed();
    error Erc20TransferFailed();
    error ReentrancyDetected();

    // ─────────────────────────────────────────────────────────────────────
    // Events (comprehensive for off-chain indexing)
    // Aligned with spec.schema.json fields
    // ─────────────────────────────────────────────────────────────────────

    /// @notice Emitted when a new bounty is created
    /// @param bountyId Unique identifier for the bounty
    /// @param creator Address that created and funded the bounty
    /// @param token Token address (address(0) for native ETH)
    /// @param amount Amount escrowed
    /// @param metadataHash Hash of off-chain metadata JSON
    /// @param deadline Claim deadline timestamp (0 = no deadline)
    /// @param createdAt Block timestamp when bounty was created
    event BountyCreated(
        uint256 indexed bountyId,
        address indexed creator,
        address indexed token,
        uint256 amount,
        bytes32 metadataHash,
        uint64 deadline,
        uint64 createdAt
    );

    /// @notice Emitted when a solver claims a bounty
    /// @param bountyId Bounty being claimed
    /// @param solver Address of the solver claiming
    /// @param claimedAt Block timestamp when claim occurred
    event BountyClaimed(
        uint256 indexed bountyId,
        address indexed solver,
        uint64 claimedAt
    );

    /// @notice Emitted when a solver submits work proof
    /// @param bountyId Bounty for which work is submitted
    /// @param solver Address of the solver submitting
    /// @param workHash Hash of the submitted work
    /// @param proofUrl URL to proof/deliverable
    /// @param submittedAt Block timestamp when submission occurred
    event BountySubmitted(
        uint256 indexed bountyId,
        address indexed solver,
        bytes32 workHash,
        string proofUrl,
        uint64 submittedAt
    );

    /// @notice Emitted when owner accepts work and pays solver
    /// @param bountyId Bounty being paid
    /// @param solver Address receiving payment
    /// @param token Token used for payment (address(0) for ETH)
    /// @param amount Amount paid
    /// @param paidAt Block timestamp when payment occurred
    event BountyPaid(
        uint256 indexed bountyId,
        address indexed solver,
        address indexed token,
        uint256 amount,
        uint64 paidAt
    );

    /// @notice Emitted when owner cancels a bounty
    /// @param bountyId Bounty being cancelled
    /// @param refundee Address receiving the refund (creator)
    /// @param token Token refunded (address(0) for ETH)
    /// @param amount Amount refunded
    /// @param cancelledAt Block timestamp when cancellation occurred
    event BountyCancelled(
        uint256 indexed bountyId,
        address indexed refundee,
        address indexed token,
        uint256 amount,
        uint64 cancelledAt
    );

    // ─────────────────────────────────────────────────────────────────────
    // State
    // ─────────────────────────────────────────────────────────────────────
    address public immutable owner;
    uint256 public bountyCount;
    mapping(uint256 => Bounty) public bounties;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    // ─────────────────────────────────────────────────────────────────────
    // Bounty Creation
    // ─────────────────────────────────────────────────────────────────────

    /// @notice Create a bounty funded with native ETH.
    function createEthBounty(
        bytes32 metadataHash,
        uint64 deadline
    ) external payable onlyOwner returns (uint256 bountyId) {
        if (msg.value == 0) revert ZeroAmount();

        bountyId = ++bountyCount;
        uint64 createdAt = uint64(block.timestamp);

        bounties[bountyId] = Bounty({
            creator: msg.sender,
            solver: address(0),
            token: address(0),
            amount: msg.value,
            metadataHash: metadataHash,
            createdAt: createdAt,
            deadline: deadline,
            status: Status.Open
        });

        emit BountyCreated(
            bountyId,
            msg.sender,
            address(0),
            msg.value,
            metadataHash,
            deadline,
            createdAt
        );
    }

    /// @notice Create a bounty funded with an ERC20 token.
    function createErc20Bounty(
        address token,
        uint256 amount,
        bytes32 metadataHash,
        uint64 deadline
    ) external onlyOwner returns (uint256 bountyId) {
        if (token == address(0)) revert InvalidToken();
        if (amount == 0) revert ZeroAmount();

        // Pull funds in
        bool ok = IERC20(token).transferFrom(msg.sender, address(this), amount);
        if (!ok) revert Erc20TransferFailed();

        bountyId = ++bountyCount;
        uint64 createdAt = uint64(block.timestamp);

        bounties[bountyId] = Bounty({
            creator: msg.sender,
            solver: address(0),
            token: token,
            amount: amount,
            metadataHash: metadataHash,
            createdAt: createdAt,
            deadline: deadline,
            status: Status.Open
        });

        emit BountyCreated(
            bountyId,
            msg.sender,
            token,
            amount,
            metadataHash,
            deadline,
            createdAt
        );
    }

    // ─────────────────────────────────────────────────────────────────────
    // Bounty Lifecycle
    // ─────────────────────────────────────────────────────────────────────

    /// @notice Claim an open bounty as a solver
    function claim(uint256 bountyId) external {
        Bounty storage b = _get(bountyId);

        // CHECKS
        if (b.status != Status.Open) revert BadStatus(Status.Open, b.status);
        if (b.deadline != 0 && block.timestamp > b.deadline) revert DeadlinePassed();

        // EFFECTS
        b.solver = msg.sender;
        b.status = Status.Claimed;

        // EVENT
        emit BountyClaimed(bountyId, msg.sender, uint64(block.timestamp));
    }

    /// @notice Submit work proof for a claimed bounty
    function submit(
        uint256 bountyId,
        bytes32 workHash,
        string calldata proofUrl
    ) external {
        Bounty storage b = _get(bountyId);

        // CHECKS
        if (msg.sender != b.solver) revert NotSolver();
        if (b.status != Status.Claimed) revert BadStatus(Status.Claimed, b.status);

        // EFFECTS
        b.status = Status.Submitted;

        // EVENT
        emit BountySubmitted(
            bountyId,
            msg.sender,
            workHash,
            proofUrl,
            uint64(block.timestamp)
        );
    }

    /// @notice Accept submitted work and pay the solver
    /// @dev Protected against reentrancy. Follows CEI pattern.
    function acceptAndPay(uint256 bountyId) external onlyOwner nonReentrant {
        Bounty storage b = _get(bountyId);

        // CHECKS
        if (b.status != Status.Submitted) revert BadStatus(Status.Submitted, b.status);

        // Cache values before state change
        address solver = b.solver;
        address token = b.token;
        uint256 amount = b.amount;

        // EFFECTS
        b.status = Status.Paid;

        // EVENT (before external call for indexer consistency)
        emit BountyPaid(
            bountyId,
            solver,
            token,
            amount,
            uint64(block.timestamp)
        );

        // INTERACTIONS
        if (token == address(0)) {
            (bool ok, ) = solver.call{value: amount}("");
            if (!ok) revert EthTransferFailed();
        } else {
            bool ok = IERC20(token).transfer(solver, amount);
            if (!ok) revert Erc20TransferFailed();
        }
    }

    /// @notice Cancel a bounty and refund the creator
    /// @dev Can cancel Open, Claimed, or Submitted bounties. Protected against reentrancy.
    function cancel(uint256 bountyId) external onlyOwner nonReentrant {
        Bounty storage b = _get(bountyId);

        // CHECKS - cannot cancel already paid or cancelled bounties
        if (b.status == Status.Paid || b.status == Status.Cancelled) {
            revert BadStatus(Status.Open, b.status);
        }

        // Cache values before state change
        address refundee = b.creator;
        address token = b.token;
        uint256 amount = b.amount;

        // EFFECTS
        b.status = Status.Cancelled;

        // EVENT (before external call for indexer consistency)
        emit BountyCancelled(
            bountyId,
            refundee,
            token,
            amount,
            uint64(block.timestamp)
        );

        // INTERACTIONS - refund to creator
        if (token == address(0)) {
            (bool ok, ) = refundee.call{value: amount}("");
            if (!ok) revert EthTransferFailed();
        } else {
            bool ok = IERC20(token).transfer(refundee, amount);
            if (!ok) revert Erc20TransferFailed();
        }
    }

    // ─────────────────────────────────────────────────────────────────────
    // View Helpers
    // ─────────────────────────────────────────────────────────────────────

    function _get(uint256 bountyId) internal view returns (Bounty storage b) {
        b = bounties[bountyId];
        if (b.creator == address(0)) revert InvalidBounty();
    }
}
