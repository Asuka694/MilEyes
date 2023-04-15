import AvatarABI from "../abis/Avatar";
import { useContractWrite, usePrepareContractWrite } from "wagmi";
import { useEffect, useState } from "react";
import Button from "./Button";

export default function MintButton() {

    const { config } = usePrepareContractWrite({
        address: "0x0180C107b564bd47cc96EE6ab428A9a2b8A8a363",
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
