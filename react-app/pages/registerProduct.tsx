import InputField from "@/pages/registerProduct";
import Jazzicon from "@/components/Jazzicon";
import { useEffect, useState } from "react";
import { useAccount, useContract, useProvider, useNetwork } from "wagmi";
import StorageABI from "../abis/Storage";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import SubmitButton from "@/components/SubmitButton";
import UploadToIPFS from "@/components/UploadImage";
import HandleForm from "@/components/HandleForm";
import { contractAddressNFT } from "abis/addresses";

export default function Storage() {
    const { isConnected } = useAccount();
    const { chain } = useNetwork();
    const [previousUsers, setPreviousUsers] = useState<any[]>([]);
    const [value, setValue] = useState<number | null>(null);
    const [isWalletConneted, setWalletConnected] = useState(false);

    const provider = useProvider();

    const contract = useContract({
        // Addresses for Celo and Alfajores
        address:
            chain?.id === 42220
                ? contractAddressNFT
                : contractAddressNFT,
        abi: StorageABI,
        signerOrProvider: provider,
    });

    useEffect(() => {
        setWalletConnected(isConnected);
    }, [isConnected]);

    return (
        <div className="w-[500px]  m-auto  flex flex-col space-y-2">
            {isWalletConneted ? (
                <>
                 <HandleForm />
                </>
            ) : (
                <div className="flex justify-center">
                    <ConnectButton
                        showBalance={{
                            smallScreen: true,
                            largeScreen: false,
                        }}
                    />
                </div>
            )}
            <div>
            </div>
        </div>
    );
}
