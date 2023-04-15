// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

/// @notice Forked and adapted from https://github.com/ConsenSys/evm-analyzer-benchmark-suite/blob/master/benchmarks/attribute_store.sol
library AttributeStore {
    struct Data {
        mapping(bytes32 => uint) store;
    }

    function getAttribute(Data storage self, bytes32 _UUID, string calldata _attrName) public view returns (uint) {
        bytes32 key = keccak256(abi.encodePacked(_UUID, _attrName));
        return self.store[key];
    }

    function attachAttribute(Data storage self, bytes32 _UUID, string calldata _attrName, uint _attrVal) public {
        bytes32 key = keccak256(abi.encodePacked(_UUID, _attrName));
        self.store[key] = _attrVal;
    }
}