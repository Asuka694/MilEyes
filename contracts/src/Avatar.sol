// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Strings} from "./Strings.sol";

contract Avatar is ERC721 {
    using Strings for uint256;

    mapping(address => bool) public AvatarClaimed;
    string public baseURI = "";
    string public uriPrefix = "";
    string public uriSuffix = ".json";

    constructor() ERC721("Avatar", "AVA") {}

    function createAvatar() public {
        require(!AvatarClaimed[_msgSender()], "Avatar already claimed");
        _safeMint(msg.sender, 1);
        AvatarClaimed[_msgSender()] = true;
    }

    function avatarOwner(
        uint256 _tokenId
    ) public view virtual returns (address) {
        return _ownerOf(_tokenId);
    }

    /*
    function _transferFrom(address from, address to, uint256) internal pure {
        require(
            from == address(0) || to == address(0),
            "This a Soulbound token. It cannot be transferred. It can only be burned by the token owner."
        );
    }

    function _burn(uint256 tokenId) internal override(ERC721) {
        super._burn(tokenId);
    }
    */

    function getBaseURI() internal view virtual returns (string memory) {
        return uriPrefix;
    }

    function getTokenURI(
        uint256 _tokenId
    ) public view virtual returns (string memory) {
        require(
            _exists(_tokenId),
            "ERC721Metadata: URI query for nonexistent token"
        );

        string memory currentBaseURI = _baseURI();
        return
            bytes(currentBaseURI).length > 0
                ? string(
                    abi.encodePacked(
                        currentBaseURI,
                        _tokenId.toString(),
                        uriSuffix
                    )
                )
                : "";
    }
}
