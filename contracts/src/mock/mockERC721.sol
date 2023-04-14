// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract mockERC721 is ERC721 {
    uint count;

    constructor() ERC721("mock", "mock") {}

    function mint(address to, uint256 amount) public {
        for (uint i = 0; i < amount; i++) {
            count++;
            _safeMint(to, count);
        }
    }
}