// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "test/utils/Utilities.sol";

import "src/mock/mockERC20.sol";
import "src/MileysTCRegistries.sol";
import "src/MileysTCRVoting.sol";

contract RegistryTest is Test {
    mockERC20 internal token;
    MileysTCRegistries internal registry;
    MileysTCRVoting internal voting;

    Utilities internal utilities;
    address[] internal users;
    

    function setUp() public {
        utilities = new Utilities();
        users = utilities.createUsers(10);

        token = new mockERC20();
        voting = new MileysTCRVoting(address(token), utilities.predictContractAddress(address(this), 1));
        registry = new MileysTCRegistries(address(token), address(voting));
        _setupChallenge();
    }

    function _setupChallenge() public {
        vm.startPrank(users[0]);
        token.mint(users[0], registry.PROPOSAL_COST());
        token.approve(address(registry), registry.PROPOSAL_COST());
        registry.propose("QmZ5Y2JjZmM1");
        vm.stopPrank();

        vm.startPrank(users[1]);
        token.mint(users[1], registry.ITEM_COST());
        token.approve(address(registry), registry.ITEM_COST());
        string[] memory dataIds = new string[](1);
        bytes32 proposalId = keccak256(abi.encode("QmZ5Y2JjZmM1"));
        dataIds[0] = "QmZ5Y2JjZmMDZIJ29";
        registry.addItems(proposalId, dataIds);
        vm.stopPrank();

        vm.startPrank(users[2]);
        token.mint(users[2], registry.CHALLENGE_COST());
        token.approve(address(registry), registry.CHALLENGE_COST());

        string[] memory itemDataIds = new string[](1);
        itemDataIds[0] = "QmZ5Y2JjZmMDZIJ29";
        bytes32 itemId = keccak256(abi.encodePacked(proposalId, itemDataIds[0]));

        bytes32[] memory itemsIds = new bytes32[](1);
        string[] memory challengeDataId = new string[](1);
        itemsIds[0] = itemId;
        challengeDataId[0] = "QmZ5Y2JjZmdezaiocjezaoij8382";


        registry.challengeItems(itemsIds, challengeDataId);
        vm.stopPrank();
    }

    function testDeployment_ShouldSucceed() public {
        assertEq(voting.pollId(), 1);
    }

    function testRequestVotingRights_ShouldRevert_WhenNotEnoughBalance() public {
        vm.startPrank(users[1]);
        token.mint(users[1], 1 ether);
        token.approve(address(voting), 2 ether);
        vm.expectRevert("ERC20: transfer amount exceeds balance");
        voting.requestVotingRights(2 ether);
        vm.stopPrank();
    }

    function testRequestVotingRights_ShouldSucceed() public {
        vm.startPrank(users[1]);
        token.mint(users[1], 2 ether);
        token.approve(address(voting), 2 ether);
        voting.requestVotingRights(2 ether);
        vm.stopPrank();
        uint256 userVoteBalance = voting.voteTokenBalance(users[1]);
        assertEq(2 ether, userVoteBalance);
    }

    function testRequestVotingRights_ShouldRevert_WhenNotEnoughBalance2() public {
        vm.startPrank(users[1]);
        token.mint(users[1], 2 ether);
        token.approve(address(voting), 4 ether);
        voting.requestVotingRights(2 ether);

        vm.expectRevert("ERC20: transfer amount exceeds balance");
        voting.requestVotingRights(2 ether);
        vm.stopPrank();
    }

    function testWithdrawVotingRights_ShouldRevert_IfAmountExceededVotingRights() public {
        vm.startPrank(users[1]);
        token.mint(users[1], 2 ether);
        token.approve(address(voting), 4 ether);
        voting.requestVotingRights(2 ether);

        vm.expectRevert();
        voting.withdrawVotingRights(3 ether);
    }

    function testCommitVote_ShouldSucceed() public {
        vm.startPrank(users[4]);
        token.mint(users[4], 4 ether);
        token.approve(address(voting), 4 ether);
        voting.requestVotingRights(4 ether);

        bytes32 secret = keccak256(abi.encodePacked(MileysTCRVoting.Party.Requester, "password"));

        voting.commitVote(1, secret, 4 ether, 0);
        assertEq(voting.getLockedTokens(users[4]), 4 ether);
    }

    function testCommitVote_ShouldRevert_IfHashIsNull() public {
        vm.startPrank(users[4]);
        token.mint(users[4], 4 ether);
        token.approve(address(voting), 4 ether);
        voting.requestVotingRights(4 ether);

        bytes32 secret = "";

        vm.expectRevert(MileysTCRVoting.InvalidCommitHash.selector);
        voting.commitVote(1, secret, 4 ether, 0);
    }

    function testCommitVote_ShouldSucceed2() public {
        vm.startPrank(users[4]);
        token.mint(users[4], 6 ether);
        token.approve(address(voting), 6 ether);
        voting.requestVotingRights(4 ether);

        bytes32 secret = keccak256(abi.encodePacked(MileysTCRVoting.Party.Requester, "password"));

        voting.commitVote(1, secret, 6 ether, 0);
    }

    function testCommitVote_ShouldRevert_WhenPollDoesNotExist() public {
        vm.startPrank(users[4]);
        token.mint(users[4], 4 ether);
        token.approve(address(voting), 4 ether);
        voting.requestVotingRights(4 ether);

        bytes32 secret = keccak256(abi.encodePacked(MileysTCRVoting.Party.Requester, "password"));

        vm.expectRevert(MileysTCRVoting.PollDoesNotExist.selector);
        voting.commitVote(2, secret, 4 ether, 0);
    }

    function testCommitVote_ShouldRevert_WhenCommitPeriodHasEnded() public {
        vm.startPrank(users[4]);
        token.mint(users[4], 4 ether);
        token.approve(address(voting), 4 ether);
        voting.requestVotingRights(4 ether);

        bytes32 secret = keccak256(abi.encodePacked(MileysTCRVoting.Party.Requester, "password"));

        vm.warp(block.timestamp + 15 days);
        vm.expectRevert(MileysTCRVoting.CommitPeriodEnded.selector);
        voting.commitVote(1, secret, 4 ether, 0);
    }

    function testCommitVote_ShouldRevert_WhenUserHasNotEnoughVotingPower() public {
        vm.startPrank(users[4]);
        token.mint(users[4], 4 ether);
        token.approve(address(voting), 5 ether);
        voting.requestVotingRights(4 ether);

        bytes32 secret = keccak256(abi.encodePacked(MileysTCRVoting.Party.Requester, "password"));

        vm.expectRevert("ERC20: transfer amount exceeds balance");
        voting.commitVote(1, secret, 5 ether, 0);
    }
}