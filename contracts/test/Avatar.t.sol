// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "test/utils/Utilities.sol";

import "src/mock/mockERC20.sol";
import "src/Avatar.sol";

contract AvatarTest is Test {
    mockERC20 internal token;
    Avatar internal avatar;

    Utilities internal utilities;
    address[] internal users;

    function setUp() public {
        utilities = new Utilities();
        users = utilities.createUsers(10);

        token = new mockERC20();
        avatar = new Avatar();
    }

    function testAvatarCreation() public {
        vm.startPrank(users[0]);
        avatar.createAvatar();
        vm.stopPrank();
    }

    function testAvatarCreation_AlreadyClaimed() public {
        vm.startPrank(users[0]);
        avatar.createAvatar();
        vm.expectRevert("Avatar already claimed");
        avatar.createAvatar();
        vm.stopPrank();
    }

    function testAvatarCreation_GetTokenURI() public {
        vm.startPrank(users[0]);
        avatar.createAvatar();
        avatar.getTokenURI(1);
        vm.stopPrank();
    }

    function testAvatarCreation_GetBaseURI() public {
        vm.startPrank(users[0]);
        avatar.createAvatar();
        vm.stopPrank();
        avatar.getTokenURI(1);
    }

    function testAvatarCreation_GetBalanceOfOrNot() public {
        avatar.balanceOf(users[0]);
        vm.startPrank(users[0]);
        avatar.createAvatar();
        avatar.balanceOf(users[0]);
        vm.stopPrank();
    }
}
