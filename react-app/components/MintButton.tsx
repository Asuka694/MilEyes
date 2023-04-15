import AvatarABI from "../abis/Avatar";
import { useContractWrite, usePrepareContractWrite } from "wagmi";
import Button from "./Button";

const STORAGE_CELO = {
    address: "0xB50BFE4E3E792Dc72450aB25a730CECFE4F60C6a",
    abi: AvatarABI.abi,
};

const STORAGE_ALFAJORES = {
    address: "0xB50BFE4E3E792Dc72450aB25a730CECFE4F60C6a",
    abi: AvatarABI.abi,
};

export default function MintButton({
    chainId,
    storeValue,
}: {
    chainId: number;
    storeValue: number;
}) {
    console.log(chainId);

    const { config } = usePrepareContractWrite({
        address: "0xB50BFE4E3E792Dc72450aB25a730CECFE4F60C6a",
        abi: AvatarABI.abi,
        functionName: 'createAvatar',
    });

    const { data, isLoading, isSuccess, write } = useContractWrite(
        config
    );

    if (!chainId) return null;
    if (storeValue === undefined) return null;

    return (
        <Button 
        disabled={!write} onClick={() => write?.()}
        text="Create Avatar"
        isLoading={isLoading && <div>Check Wallet</div>}
        isSuccess={isSuccess && <div>Transaction: {JSON.stringify(data)}</div>}
        />  
    );
}
