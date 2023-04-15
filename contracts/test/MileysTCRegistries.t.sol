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
    }

    function _addProposal() public {
        vm.startPrank(users[0]);
        token.mint(users[0], 1 ether);
        token.approve(address(registry), 1 ether);
        registry.propose("QmZ5Y2JjZmM1");
        vm.stopPrank();
    }

    function _mintAndApproveToken(address _user, uint _amount) internal {
        vm.startPrank(_user);
        token.mint(_user, _amount);
        token.approve(address(registry), _amount);
        vm.stopPrank();
    }

    function _addItems(address user, bytes32 _proposalId, string[] memory _dataIds) internal {
        vm.prank(user);
        registry.addItems(_proposalId, _dataIds);
    }

    function testProposal_ShouldRevert_WhenNotEnoughTokenBalance() public {
        vm.startPrank(users[0]);
        token.approve(address(registry), 1 ether);
        vm.expectRevert("ERC20: transfer amount exceeds balance");
        registry.propose("QmZ5Y2JjZmM1");
    }

    function testProposal_ShouldRevert_WhenAlreadyExists() public {
        vm.startPrank(users[0]);
        token.mint(users[0], 1 ether);
        token.approve(address(registry), 1 ether);
        registry.propose("QmZ5Y2JjZmM1");

        vm.expectRevert(MileysTCRegistries.ProposalAlreadyExists.selector);
        registry.propose("QmZ5Y2JjZmM1");
    }

    function testProposal_ShouldSucceed() public {
        vm.startPrank(users[0]);
        token.mint(users[0], 1 ether);
        token.approve(address(registry), 1 ether);
        registry.propose("QmZ5Y2JjZmM1");
    }

    function testProposal_ShouldSucceed2() public {
        vm.startPrank(users[0]);
        token.mint(users[0], 1 ether);
        token.approve(address(registry), 1 ether);
        registry.propose("QmZ5Y2JjZmM1");

        token.mint(users[0], 1 ether);
        token.approve(address(registry), 1 ether);
        registry.propose("QmZ5Y2JjZmM2");
    }

    function testAddItems_ShouldRevert_WhenProposalIdDoesNotExist() public {
        _addProposal();

        _mintAndApproveToken(users[1], registry.ITEM_COST());

        string[] memory dataIds = new string[](1);
        bytes32 proposalId = keccak256(abi.encode("QmZ5Y2J"));
        dataIds[0] = "QmZ5Y2JjZmMDZIJ29";

        vm.expectRevert(MileysTCRegistries.ProposalDoesNotExist.selector);
        registry.addItems(proposalId, dataIds);
    }

    function testAddItems_ShouldRevert_WhenNotEnoughBalance() public {
        _addProposal();
        _mintAndApproveToken(users[1], registry.ITEM_COST());

        vm.startPrank(users[1]);
        token.transfer(users[0], registry.ITEM_COST());

        string[] memory dataIds = new string[](1);
        bytes32 proposalId = keccak256(abi.encode("QmZ5Y2JjZmM1"));
        dataIds[0] = "QmZ5Y2JjZmMDZIJ29";

        vm.expectRevert("ERC20: transfer amount exceeds balance");
        registry.addItems(proposalId, dataIds);
    }

    function testAddItems_ShouldSuceed1() public {
        _addProposal();
        _mintAndApproveToken(users[1], registry.ITEM_COST());

        string[] memory dataIds = new string[](1);
        bytes32 proposalId = keccak256(abi.encode("QmZ5Y2JjZmM1"));
        dataIds[0] = "QmZ5Y2JjZmMDZIJ29";

        vm.prank(users[1]);
        registry.addItems(proposalId, dataIds);
    }

    function testAddItems_ShouldRevert_WhenLengthExceeded() public {
        _addProposal();
        _mintAndApproveToken(users[1], registry.ITEM_COST());

        string[] memory dataIds = new string[](11);
        bytes32 proposalId = keccak256(abi.encode("QmZ5Y2JjZmM1"));
        for(uint i = 0; i < 11; i++) {
            dataIds[i] = "QmZ5Y2JjZmMDZIJ29";
        }

        vm.prank(users[1]);
        vm.expectRevert(MileysTCRegistries.LengthExceeded.selector);
        registry.addItems(proposalId, dataIds);
    }

    function testChallenge_ShouldRevert_WhenItemDoesNotExist() public {
        _addProposal();
        _mintAndApproveToken(users[1], registry.ITEM_COST());

        string[] memory itemDataIds = new string[](1);
        bytes32 proposalId = keccak256(abi.encode("QmZ5Y2JjZmM1"));
        itemDataIds[0] = "QmZ5Y2JjZmMDZIJ29";
        _addItems(users[1], proposalId, itemDataIds);
        
        string memory wrongDataIds = "QmZ5Y2";
        bytes32 itemId = keccak256(abi.encodePacked(proposalId, wrongDataIds));

        bytes32[] memory itemsIds = new bytes32[](1);
        string[] memory challengeDataId = new string[](1);
        itemsIds[0] = itemId;
        challengeDataId[0] = "QmZ5Y2JjZmdezaiocjezaoij8382";

        _mintAndApproveToken(users[2], registry.CHALLENGE_COST());
        vm.prank(users[2]);
        vm.expectRevert(MileysTCRegistries.ItemDoesNotExist.selector);
        registry.challengeItems(itemsIds, challengeDataId);
    }

    function testChallenge_ShouldSucceed() public {
        _addProposal();
        _mintAndApproveToken(users[1], registry.ITEM_COST());

        string[] memory itemDataIds = new string[](1);
        bytes32 proposalId = keccak256(abi.encode("QmZ5Y2JjZmM1"));
        itemDataIds[0] = "QmZ5Y2JjZmMDZIJ29";
        _addItems(users[1], proposalId, itemDataIds);
        
        bytes32 itemId = keccak256(abi.encodePacked(proposalId, itemDataIds[0]));

        bytes32[] memory itemsIds = new bytes32[](1);
        string[] memory challengeDataId = new string[](1);
        itemsIds[0] = itemId;
        challengeDataId[0] = "QmZ5Y2JjZmdezaiocjezaoij8382";

        _mintAndApproveToken(users[2], registry.CHALLENGE_COST());
        vm.prank(users[2]);
        registry.challengeItems(itemsIds, challengeDataId);
    }

    function testChallenge_ShouldRevert_IfChallengerIsItemRequester() public {
        _addProposal();
        _mintAndApproveToken(users[1], registry.ITEM_COST());

        string[] memory itemDataIds = new string[](1);
        bytes32 proposalId = keccak256(abi.encode("QmZ5Y2JjZmM1"));
        itemDataIds[0] = "QmZ5Y2JjZmMDZIJ29";
        _addItems(users[1], proposalId, itemDataIds);
        
        bytes32 itemId = keccak256(abi.encodePacked(proposalId, itemDataIds[0]));

        bytes32[] memory itemsIds = new bytes32[](1);
        string[] memory challengeDataId = new string[](1);
        itemsIds[0] = itemId;
        challengeDataId[0] = "QmZ5Y2JjZmdezaiocjezaoij8382";

        _mintAndApproveToken(users[1], registry.CHALLENGE_COST());
        vm.prank(users[1]);
        vm.expectRevert(MileysTCRegistries.ChallengerIsItemRequester.selector);
        registry.challengeItems(itemsIds, challengeDataId);
    }

    function testChallenge_ShouldRevert_IfItemHasPendingChallenge() public {
        _addProposal();
        _mintAndApproveToken(users[1], registry.ITEM_COST());

        string[] memory itemDataIds = new string[](1);
        bytes32 proposalId = keccak256(abi.encode("QmZ5Y2JjZmM1"));
        itemDataIds[0] = "QmZ5Y2JjZmMDZIJ29";
        _addItems(users[1], proposalId, itemDataIds);
        
        bytes32 itemId = keccak256(abi.encodePacked(proposalId, itemDataIds[0]));

        bytes32[] memory itemsIds = new bytes32[](1);
        string[] memory challengeDataId = new string[](1);
        itemsIds[0] = itemId;
        challengeDataId[0] = "QmZ5Y2JjZmdezaiocjezaoij8382";

        _mintAndApproveToken(users[2], registry.CHALLENGE_COST());
        vm.prank(users[2]);
        registry.challengeItems(itemsIds, challengeDataId);

        _mintAndApproveToken(users[2], registry.CHALLENGE_COST());
        vm.prank(users[2]);
        vm.expectRevert(MileysTCRegistries.ItemHasPendingChallenge.selector);
        registry.challengeItems(itemsIds, challengeDataId);
    }

    function testChallenge_ShouldRevert_IfItemChallengeExpired() public {
        _addProposal();
        _mintAndApproveToken(users[1], registry.ITEM_COST());

        string[] memory itemDataIds = new string[](1);
        bytes32 proposalId = keccak256(abi.encode("QmZ5Y2JjZmM1"));
        itemDataIds[0] = "QmZ5Y2JjZmMDZIJ29";
        _addItems(users[1], proposalId, itemDataIds);
        
        bytes32 itemId = keccak256(abi.encodePacked(proposalId, itemDataIds[0]));

        bytes32[] memory itemsIds = new bytes32[](1);
        string[] memory challengeDataId = new string[](1);
        itemsIds[0] = itemId;
        challengeDataId[0] = "QmZ5Y2JjZmdezaiocjezaoij8382";

        _mintAndApproveToken(users[2], registry.CHALLENGE_COST());
        vm.prank(users[2]);
        vm.warp(block.timestamp + 31 days);
        vm.expectRevert(MileysTCRegistries.ItemChallengeExpired.selector);
        registry.challengeItems(itemsIds, challengeDataId);
    }
}
