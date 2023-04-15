import AvatarABI from "../abis/Avatar";
import { useContractWrite, usePrepareContractWrite } from "wagmi";
import { useEffect, useState } from "react";
import Button from "./Button";
import { contractAddressNFT } from "abis/addresses";

export default function MintButton() {

    const { config } = usePrepareContractWrite({
        address: contractAddressNFT,
        abi: AvatarABI.abi,
        functionName: 'createAvatar',
    });
    
    const { data, isLoading, isSuccess, write } = useContractWrite(config);

    return (
        <Button 
        disabled={!write} onClick={() => write?.()}
        text="Create Avatar"
        isLoading={isLoading && <div>Check Wallet</div>}
        isSuccess={isSuccess && <div>Transaction: {JSON.stringify(data)}</div>}
        />
    );
}
