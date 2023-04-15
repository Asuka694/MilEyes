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
}
