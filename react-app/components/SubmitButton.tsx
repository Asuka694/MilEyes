import StorageABI from "../abis/Storage";
import { useContractWrite, usePrepareContractWrite } from "wagmi";
import Button from "./Button";

const STORAGE_CELO = {
    address: "0xbF4A19703bee67a66dFAc3b7a0b478265E0FBCdF",
    abi: StorageABI,
};

const STORAGE_ALFAJORES = {
    address: "0x63556B57a5dDa94cA061D1178715Fe2b8Dc32C46",
    abi: StorageABI,
};

export default function StorageButton({
    chainId,
    storeValue,
}: {
    chainId: number;
    storeValue: number;
}) {

    const { config } = usePrepareContractWrite({
        ...(chainId === 42220 ? STORAGE_CELO : STORAGE_ALFAJORES),
        functionName: "store",
        args: [storeValue ?? 0],
    });
    const { data, isLoading, isSuccess, write: store } = useContractWrite(
        config
    );

    if (!chainId) return null;
    if (storeValue === undefined) return null;

    return (
        <Button
            text="Submit"
            isLoading={isLoading}
            disabled={storeValue == null}
            onClick={store ?? (() => {})}
        />
    );
}
