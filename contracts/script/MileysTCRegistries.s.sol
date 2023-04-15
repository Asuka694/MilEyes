// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Script.sol";

import "src/mock/mockERC20.sol";
import "src/MileysTCRegistries.sol";
import "src/MileysTCRVoting.sol";
import "test/utils/LibRLP.sol";

contract MileysTCRegistriesScript is Script {
    mockERC20 internal token;
    MileysTCRegistries internal registries;
    MileysTCRVoting internal voting;    

    function run() public {
        uint256 registriesDeployerKey = vm.envUint("REGISTRIES_DEPLOYER_KEY");

        address registriesDeployerAddress = vm.addr(registriesDeployerKey);
        address registriesAddress = LibRLP.computeAddress(registriesDeployerAddress, 2);

        vm.startBroadcast(registriesDeployerKey);
        token = new mockERC20();

        voting = new MileysTCRVoting(address(token), registriesAddress);

        registries = new MileysTCRegistries(address(token), address(voting));
        vm.stopBroadcast();
    }
}
