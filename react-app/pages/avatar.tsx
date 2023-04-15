import InputField from "@/components/InputField";
import Jazzicon from "@/components/Jazzicon";
import { useEffect, useState } from "react";
import { useAccount, useContract, useProvider, useNetwork } from "wagmi";
import StorageABI from "../abis/Storage";
import AvatarABI from "../abis/Avatar.json";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import MintButton from "@/components/MintButton";

export default function Avatar() {
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
                ? "0xB50BFE4E3E792Dc72450aB25a730CECFE4F60C6a"
                : "0xB50BFE4E3E792Dc72450aB25a730CECFE4F60C6a",
        abi: AvatarABI.abi,
        signerOrProvider: provider,
    });

    useEffect(() => {
        (async () => {
            const events = await contract?.queryFilter("newNumber", 17082530);
            const args = events?.map((event) => event.args);
            if (args) {
                setPreviousUsers(args);
            }
        })();
    }, [chain?.id]);

    /*

    useEffect(() => {
        (async () => {
            const events = await contract?.queryFilter("newNumber", 17082530);
            const args = events?.map((event) => event.args);
            if (args) {
                setPreviousUsers(args);
            }
        })();
    }, [chain?.id]);

    useEffect(() => {
        contract?.on("newNumber", (number, sender) => {
            setPreviousUsers([...previousUsers, { number, sender }]);
        });

        return () => {
            contract?.removeAllListeners();
        };
    }, [previousUsers]);

    */

    useEffect(() => {
        setWalletConnected(isConnected);
    }, [isConnected]);

    return (
        <div className="w-[500px]  m-auto  flex flex-col space-y-2">
            {isWalletConneted ? (
                <>
                    <MintButton
                        chainId={chain?.id as number}
                        storeValue={value as number}
                    />
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
                <table className="table mt-7 w-full">
                    <caption className="mb-5 text-lg font-bold">
                        Create NFT
                    </caption>
                    <tbody className="h-96 overflow-y-auto">
                        {previousUsers.map(({ number, sender }, index) => {
                            return (
                                <tr
                                    key={index}
                                    className="flex items-center space-x-2 w-full"
                                >
                                    <Jazzicon diameter={20} address={sender} />
                                    <td className="p-2">{sender}</td>
                                    <td className="p-2">{number.toString()}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
