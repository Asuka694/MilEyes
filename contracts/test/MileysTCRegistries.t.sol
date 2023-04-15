// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "test/utils/Utilities.sol";

import "src/mock/mockERC20.sol";
import "src/MileysTCRegistries.sol";

contract RegistryTest is Test {
    mockERC20 internal token;
    MileysTCRegistries internal registry;

    Utilities internal utilities;
    address[] internal users;
    

    function setUp() public {
        utilities = new Utilities();
        users = utilities.createUsers(10);

        token = new mockERC20();
        registry = new MileysTCRegistries(address(token));
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

    function testAddItems_ShouldSuceed2() public {
        _addProposal();
        _mintAndApproveToken(users[1], registry.ITEM_COST());

        string[] memory dataIds = new string[](10);
        bytes32 proposalId = keccak256(abi.encode("QmZ5Y2JjZmM1"));
        for(uint i = 0; i < 10; i++) {
            dataIds[i] = "QmZ5Y2JjZmMDZIJ29";
        }

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

        string[] memory proposalDataIds = new string[](1);
        bytes32 proposalId = keccak256(abi.encode("QmZ5Y2JjZmM1"));
        proposalDataIds[0] = "QmZ5Y2JjZmMDZIJ29";
        _addItems(users[1], proposalId, proposalDataIds);

        
        bytes32 itemId = keccak256(abi.encodePacked(proposalId, ));
    }
}
