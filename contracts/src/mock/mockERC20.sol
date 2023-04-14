// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract mockERC20 is ERC20 {
    constructor() ERC20("mock", "mock") {}

    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }

    function burnFrom(address from, uint256 amount) public {
        _burn(from, amount);
    }
}