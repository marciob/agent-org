// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "forge-std/Test.sol";
import {BountyEscrow} from "../src/BountyEscrow.sol";

// ─────────────────────────────────────────────────────────────────────────────
// Mock ERC20 Token
// ─────────────────────────────────────────────────────────────────────────────
contract MockERC20 {
    string public name = "Mock";
    string public symbol = "MOCK";
    uint8 public decimals = 18;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    function mint(address to, uint256 amt) external {
        balanceOf[to] += amt;
    }

    function approve(address spender, uint256 amt) external returns (bool) {
        allowance[msg.sender][spender] = amt;
        return true;
    }

    function transfer(address to, uint256 amt) external returns (bool) {
        require(balanceOf[msg.sender] >= amt, "bal");
        balanceOf[msg.sender] -= amt;
        balanceOf[to] += amt;
        return true;
    }

    function transferFrom(address from, address to, uint256 amt) external returns (bool) {
        uint256 a = allowance[from][msg.sender];
        require(a >= amt, "allow");
        allowance[from][msg.sender] = a - amt;
        require(balanceOf[from] >= amt, "bal");
        balanceOf[from] -= amt;
        balanceOf[to] += amt;
        return true;
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Reentrancy Attacker Contract
// ─────────────────────────────────────────────────────────────────────────────
contract ReentrancyAttacker {
    BountyEscrow public target;
    uint256 public attackBountyId;
    uint256 public attackCount;

    constructor(BountyEscrow _target) {
        target = _target;
    }

    function setAttackBountyId(uint256 _bountyId) external {
        attackBountyId = _bountyId;
    }

    // Attempt reentrancy on acceptAndPay
    receive() external payable {
        if (attackCount < 2) {
            attackCount++;
            // Try to re-enter acceptAndPay
            try target.acceptAndPay(attackBountyId) {} catch {}
        }
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Test Suite
// ─────────────────────────────────────────────────────────────────────────────
contract BountyEscrowTest is Test {
    BountyEscrow esc;
    MockERC20 token;
    address owner = address(0xA11CE);
    address solver = address(0xBEEF);
    address solver2 = address(0xCAFE);

    function setUp() public {
        vm.deal(owner, 100 ether);
        vm.deal(solver, 10 ether);
        vm.prank(owner);
        esc = new BountyEscrow();

        token = new MockERC20();
        token.mint(owner, 1000e18);
    }

    // ─────────────────────────────────────────────────────────────────────
    // Happy Path Tests
    // ─────────────────────────────────────────────────────────────────────

    function test_ethFlow_claim_submit_pay() public {
        bytes32 meta = keccak256("meta");
        vm.prank(owner);
        uint256 id = esc.createEthBounty{value: 1 ether}(meta, 0);

        vm.prank(solver);
        esc.claim(id);

        vm.prank(solver);
        esc.submit(id, keccak256("work"), "https://example.com/proof");

        uint256 beforeBal = solver.balance;
        vm.prank(owner);
        esc.acceptAndPay(id);
        assertEq(solver.balance, beforeBal + 1 ether);

        // Verify final status
        (, , , , , , , BountyEscrow.Status status) = esc.bounties(id);
        assertEq(uint8(status), uint8(BountyEscrow.Status.Paid));
    }

    function test_erc20Flow_claim_submit_pay() public {
        vm.startPrank(owner);
        token.approve(address(esc), 10e18);
        uint256 id = esc.createErc20Bounty(address(token), 10e18, keccak256("m"), 0);
        vm.stopPrank();

        vm.prank(solver);
        esc.claim(id);

        vm.prank(solver);
        esc.submit(id, keccak256("w"), "ipfs://proof");

        uint256 beforeBal = token.balanceOf(solver);
        vm.prank(owner);
        esc.acceptAndPay(id);
        assertEq(token.balanceOf(solver), beforeBal + 10e18);
    }

    function test_ownerCanCancelOpenBounty() public {
        bytes32 meta = keccak256("meta");
        uint256 beforeBal = owner.balance;
        vm.prank(owner);
        uint256 id = esc.createEthBounty{value: 2 ether}(meta, 0);

        vm.prank(owner);
        esc.cancel(id);

        assertEq(owner.balance, beforeBal);

        (, , , , , , , BountyEscrow.Status status) = esc.bounties(id);
        assertEq(uint8(status), uint8(BountyEscrow.Status.Cancelled));
    }

    function test_ownerCanCancelClaimedBounty() public {
        vm.prank(owner);
        uint256 id = esc.createEthBounty{value: 1 ether}(keccak256("m"), 0);

        vm.prank(solver);
        esc.claim(id);

        uint256 beforeBal = owner.balance;
        vm.prank(owner);
        esc.cancel(id);

        assertEq(owner.balance, beforeBal + 1 ether);
    }

    function test_ownerCanCancelSubmittedBounty() public {
        vm.prank(owner);
        uint256 id = esc.createEthBounty{value: 1 ether}(keccak256("m"), 0);

        vm.prank(solver);
        esc.claim(id);

        vm.prank(solver);
        esc.submit(id, keccak256("w"), "url");

        uint256 beforeBal = owner.balance;
        vm.prank(owner);
        esc.cancel(id);

        assertEq(owner.balance, beforeBal + 1 ether);
    }

    // ─────────────────────────────────────────────────────────────────────
    // Deadline Enforcement Tests
    // ─────────────────────────────────────────────────────────────────────

    function test_claimBeforeDeadline_succeeds() public {
        uint64 deadline = uint64(block.timestamp + 1 days);
        vm.prank(owner);
        uint256 id = esc.createEthBounty{value: 1 ether}(keccak256("m"), deadline);

        // Warp to just before deadline
        vm.warp(block.timestamp + 1 days - 1);

        vm.prank(solver);
        esc.claim(id);

        (, address claimedSolver, , , , , , ) = esc.bounties(id);
        assertEq(claimedSolver, solver);
    }

    function test_claimAfterDeadline_reverts() public {
        uint64 deadline = uint64(block.timestamp + 1 days);
        vm.prank(owner);
        uint256 id = esc.createEthBounty{value: 1 ether}(keccak256("m"), deadline);

        // Warp to after deadline
        vm.warp(block.timestamp + 1 days + 1);

        vm.prank(solver);
        vm.expectRevert(BountyEscrow.DeadlinePassed.selector);
        esc.claim(id);
    }

    function test_claimWithNoDeadline_alwaysSucceeds() public {
        vm.prank(owner);
        uint256 id = esc.createEthBounty{value: 1 ether}(keccak256("m"), 0);

        // Warp far into future
        vm.warp(block.timestamp + 365 days);

        vm.prank(solver);
        esc.claim(id);

        (, address claimedSolver, , , , , , ) = esc.bounties(id);
        assertEq(claimedSolver, solver);
    }

    // ─────────────────────────────────────────────────────────────────────
    // Double-Claim / Double-Pay Prevention Tests
    // ─────────────────────────────────────────────────────────────────────

    function test_cannotClaimAlreadyClaimedBounty() public {
        vm.prank(owner);
        uint256 id = esc.createEthBounty{value: 1 ether}(keccak256("m"), 0);

        vm.prank(solver);
        esc.claim(id);

        // Second solver tries to claim
        vm.prank(solver2);
        vm.expectRevert(
            abi.encodeWithSelector(
                BountyEscrow.BadStatus.selector,
                BountyEscrow.Status.Open,
                BountyEscrow.Status.Claimed
            )
        );
        esc.claim(id);
    }

    function test_cannotPayTwice() public {
        vm.prank(owner);
        uint256 id = esc.createEthBounty{value: 1 ether}(keccak256("m"), 0);

        vm.prank(solver);
        esc.claim(id);

        vm.prank(solver);
        esc.submit(id, keccak256("w"), "url");

        vm.prank(owner);
        esc.acceptAndPay(id);

        // Try to pay again
        vm.prank(owner);
        vm.expectRevert(
            abi.encodeWithSelector(
                BountyEscrow.BadStatus.selector,
                BountyEscrow.Status.Submitted,
                BountyEscrow.Status.Paid
            )
        );
        esc.acceptAndPay(id);
    }

    function test_cannotCancelPaidBounty() public {
        vm.prank(owner);
        uint256 id = esc.createEthBounty{value: 1 ether}(keccak256("m"), 0);

        vm.prank(solver);
        esc.claim(id);

        vm.prank(solver);
        esc.submit(id, keccak256("w"), "url");

        vm.prank(owner);
        esc.acceptAndPay(id);

        // Try to cancel after paid
        vm.prank(owner);
        vm.expectRevert(
            abi.encodeWithSelector(
                BountyEscrow.BadStatus.selector,
                BountyEscrow.Status.Open,
                BountyEscrow.Status.Paid
            )
        );
        esc.cancel(id);
    }

    function test_cannotCancelTwice() public {
        vm.prank(owner);
        uint256 id = esc.createEthBounty{value: 1 ether}(keccak256("m"), 0);

        vm.prank(owner);
        esc.cancel(id);

        // Try to cancel again
        vm.prank(owner);
        vm.expectRevert(
            abi.encodeWithSelector(
                BountyEscrow.BadStatus.selector,
                BountyEscrow.Status.Open,
                BountyEscrow.Status.Cancelled
            )
        );
        esc.cancel(id);
    }

    // ─────────────────────────────────────────────────────────────────────
    // Invalid State Transition Tests
    // ─────────────────────────────────────────────────────────────────────

    function test_cannotSubmitWithoutClaim() public {
        vm.prank(owner);
        uint256 id = esc.createEthBounty{value: 1 ether}(keccak256("m"), 0);

        vm.prank(solver);
        vm.expectRevert(BountyEscrow.NotSolver.selector);
        esc.submit(id, keccak256("w"), "url");
    }

    function test_cannotPayOpenBounty() public {
        vm.prank(owner);
        uint256 id = esc.createEthBounty{value: 1 ether}(keccak256("m"), 0);

        vm.prank(owner);
        vm.expectRevert(
            abi.encodeWithSelector(
                BountyEscrow.BadStatus.selector,
                BountyEscrow.Status.Submitted,
                BountyEscrow.Status.Open
            )
        );
        esc.acceptAndPay(id);
    }

    function test_cannotPayClaimedBounty() public {
        vm.prank(owner);
        uint256 id = esc.createEthBounty{value: 1 ether}(keccak256("m"), 0);

        vm.prank(solver);
        esc.claim(id);

        vm.prank(owner);
        vm.expectRevert(
            abi.encodeWithSelector(
                BountyEscrow.BadStatus.selector,
                BountyEscrow.Status.Submitted,
                BountyEscrow.Status.Claimed
            )
        );
        esc.acceptAndPay(id);
    }

    function test_onlySolverCanSubmit() public {
        vm.prank(owner);
        uint256 id = esc.createEthBounty{value: 1 ether}(keccak256("m"), 0);

        vm.prank(solver);
        esc.claim(id);

        // Different address tries to submit
        vm.prank(solver2);
        vm.expectRevert(BountyEscrow.NotSolver.selector);
        esc.submit(id, keccak256("w"), "url");
    }

    function test_cannotSubmitTwice() public {
        vm.prank(owner);
        uint256 id = esc.createEthBounty{value: 1 ether}(keccak256("m"), 0);

        vm.prank(solver);
        esc.claim(id);

        vm.prank(solver);
        esc.submit(id, keccak256("w"), "url");

        // Try to submit again
        vm.prank(solver);
        vm.expectRevert(
            abi.encodeWithSelector(
                BountyEscrow.BadStatus.selector,
                BountyEscrow.Status.Claimed,
                BountyEscrow.Status.Submitted
            )
        );
        esc.submit(id, keccak256("w2"), "url2");
    }

    // ─────────────────────────────────────────────────────────────────────
    // Access Control Tests
    // ─────────────────────────────────────────────────────────────────────

    function test_onlyOwnerCanCreateBounty() public {
        vm.prank(solver);
        vm.expectRevert(BountyEscrow.NotOwner.selector);
        esc.createEthBounty{value: 1 ether}(keccak256("m"), 0);
    }

    function test_onlyOwnerCanAcceptAndPay() public {
        vm.prank(owner);
        uint256 id = esc.createEthBounty{value: 1 ether}(keccak256("m"), 0);

        vm.prank(solver);
        esc.claim(id);

        vm.prank(solver);
        esc.submit(id, keccak256("w"), "url");

        vm.prank(solver);
        vm.expectRevert(BountyEscrow.NotOwner.selector);
        esc.acceptAndPay(id);
    }

    function test_onlyOwnerCanCancel() public {
        vm.prank(owner);
        uint256 id = esc.createEthBounty{value: 1 ether}(keccak256("m"), 0);

        vm.prank(solver);
        vm.expectRevert(BountyEscrow.NotOwner.selector);
        esc.cancel(id);
    }

    // ─────────────────────────────────────────────────────────────────────
    // Input Validation Tests
    // ─────────────────────────────────────────────────────────────────────

    function test_cannotCreateEthBountyWithZeroValue() public {
        vm.prank(owner);
        vm.expectRevert(BountyEscrow.ZeroAmount.selector);
        esc.createEthBounty{value: 0}(keccak256("m"), 0);
    }

    function test_cannotCreateErc20BountyWithZeroAmount() public {
        vm.prank(owner);
        vm.expectRevert(BountyEscrow.ZeroAmount.selector);
        esc.createErc20Bounty(address(token), 0, keccak256("m"), 0);
    }

    function test_cannotCreateErc20BountyWithZeroAddress() public {
        vm.prank(owner);
        vm.expectRevert(BountyEscrow.InvalidToken.selector);
        esc.createErc20Bounty(address(0), 100e18, keccak256("m"), 0);
    }

    function test_cannotInteractWithInvalidBounty() public {
        vm.prank(solver);
        vm.expectRevert(BountyEscrow.InvalidBounty.selector);
        esc.claim(999);
    }

    // ─────────────────────────────────────────────────────────────────────
    // Reentrancy Protection Tests
    // ─────────────────────────────────────────────────────────────────────

    function test_reentrancyOnAcceptAndPay_blocked() public {
        // Deploy attacker contract
        ReentrancyAttacker attacker = new ReentrancyAttacker(esc);

        // Create bounty
        vm.prank(owner);
        uint256 id = esc.createEthBounty{value: 5 ether}(keccak256("m"), 0);

        // Attacker claims the bounty
        vm.prank(address(attacker));
        esc.claim(id);

        // Attacker submits
        vm.prank(address(attacker));
        esc.submit(id, keccak256("w"), "url");

        // Set the attack target
        attacker.setAttackBountyId(id);

        // Owner accepts and pays - attacker's receive() will try to re-enter
        uint256 escrowBalBefore = address(esc).balance;
        vm.prank(owner);
        esc.acceptAndPay(id);

        // Verify only paid once (5 ether transferred)
        assertEq(address(esc).balance, escrowBalBefore - 5 ether);

        // Verify attacker only received once
        assertEq(address(attacker).balance, 5 ether);

        // Verify attack count shows reentry was attempted but blocked
        // (receive was called, but acceptAndPay was blocked on re-entry)
        assertEq(attacker.attackCount(), 1);
    }

    // ─────────────────────────────────────────────────────────────────────
    // Event Emission Tests
    // ─────────────────────────────────────────────────────────────────────

    // Events must be declared locally for older Foundry versions
    event BountyCreated(
        uint256 indexed bountyId,
        address indexed creator,
        address indexed token,
        uint256 amount,
        bytes32 metadataHash,
        uint64 deadline,
        uint64 createdAt
    );
    event BountyClaimed(uint256 indexed bountyId, address indexed solver, uint64 claimedAt);
    event BountySubmitted(
        uint256 indexed bountyId,
        address indexed solver,
        bytes32 workHash,
        string proofUrl,
        uint64 submittedAt
    );
    event BountyPaid(
        uint256 indexed bountyId,
        address indexed solver,
        address indexed token,
        uint256 amount,
        uint64 paidAt
    );
    event BountyCancelled(
        uint256 indexed bountyId,
        address indexed refundee,
        address indexed token,
        uint256 amount,
        uint64 cancelledAt
    );

    function test_bountyCreatedEvent_emitsCorrectData() public {
        bytes32 meta = keccak256("meta");
        uint64 deadline = uint64(block.timestamp + 1 days);

        vm.prank(owner);
        vm.expectEmit(true, true, true, true);
        emit BountyCreated(
            1,
            owner,
            address(0),
            1 ether,
            meta,
            deadline,
            uint64(block.timestamp)
        );
        esc.createEthBounty{value: 1 ether}(meta, deadline);
    }

    function test_bountyClaimedEvent_emitsCorrectData() public {
        vm.prank(owner);
        uint256 id = esc.createEthBounty{value: 1 ether}(keccak256("m"), 0);

        vm.prank(solver);
        vm.expectEmit(true, true, false, true);
        emit BountyClaimed(id, solver, uint64(block.timestamp));
        esc.claim(id);
    }

    function test_bountySubmittedEvent_emitsCorrectData() public {
        vm.prank(owner);
        uint256 id = esc.createEthBounty{value: 1 ether}(keccak256("m"), 0);

        vm.prank(solver);
        esc.claim(id);

        bytes32 workHash = keccak256("work");
        string memory proofUrl = "https://proof.url";

        vm.prank(solver);
        vm.expectEmit(true, true, false, true);
        emit BountySubmitted(
            id,
            solver,
            workHash,
            proofUrl,
            uint64(block.timestamp)
        );
        esc.submit(id, workHash, proofUrl);
    }

    function test_bountyPaidEvent_emitsCorrectData() public {
        vm.prank(owner);
        uint256 id = esc.createEthBounty{value: 1 ether}(keccak256("m"), 0);

        vm.prank(solver);
        esc.claim(id);

        vm.prank(solver);
        esc.submit(id, keccak256("w"), "url");

        vm.prank(owner);
        vm.expectEmit(true, true, true, true);
        emit BountyPaid(
            id,
            solver,
            address(0),
            1 ether,
            uint64(block.timestamp)
        );
        esc.acceptAndPay(id);
    }

    function test_bountyCancelledEvent_emitsCorrectData() public {
        vm.prank(owner);
        uint256 id = esc.createEthBounty{value: 1 ether}(keccak256("m"), 0);

        vm.prank(owner);
        vm.expectEmit(true, true, true, true);
        emit BountyCancelled(
            id,
            owner,
            address(0),
            1 ether,
            uint64(block.timestamp)
        );
        esc.cancel(id);
    }

    // ─────────────────────────────────────────────────────────────────────
    // Refund Correctness Tests
    // ─────────────────────────────────────────────────────────────────────

    function test_cancelRefundsToCreator_notOwner() public {
        // This test verifies refund goes to creator (who is also owner in this case)
        // The bounty.creator field stores the original creator
        vm.prank(owner);
        uint256 id = esc.createEthBounty{value: 3 ether}(keccak256("m"), 0);

        uint256 creatorBalBefore = owner.balance;

        vm.prank(owner);
        esc.cancel(id);

        assertEq(owner.balance, creatorBalBefore + 3 ether);
    }

    function test_erc20CancelRefundsCorrectly() public {
        vm.startPrank(owner);
        token.approve(address(esc), 50e18);
        uint256 id = esc.createErc20Bounty(address(token), 50e18, keccak256("m"), 0);
        vm.stopPrank();

        uint256 ownerBalBefore = token.balanceOf(owner);

        vm.prank(owner);
        esc.cancel(id);

        assertEq(token.balanceOf(owner), ownerBalBefore + 50e18);
    }
}
