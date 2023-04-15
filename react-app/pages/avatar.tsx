import InputField from "@/pages/registerProduct";
import Jazzicon from "@/components/Jazzicon";
import { useEffect, useState } from "react";
import { useAccount, useContract, useProvider, useNetwork, useContractRead } from "wagmi";
import StorageABI from "../abis/Storage";
import AvatarABI from "../abis/Avatar.json";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import MintButton from "@/components/MintButton";
import RadarChart from "@/components/RadarChart";
import Image from "next/image";
import { contractAddressNFT } from "abis/addresses";

export default function Avatar() {
    const { isConnected } = useAccount();
    const { chain } = useNetwork();
    const [previousUsers, setPreviousUsers] = useState<any[]>([]);
    const [value, setValue] = useState<number | null>(null);
    const [isWalletConnected, setWalletConnected] = useState(false);
    const [isMinted, setIsMinted] = useState(false);

    const provider = useProvider();
    const currentAddy = useAccount().address;

    const contract = useContract({
        // Addresses for Celo and Alfajores
        address:
            chain?.id === 42220
                ? contractAddressNFT
                : contractAddressNFT,
        abi: AvatarABI.abi,
        signerOrProvider: provider,
    });

    const { data } = useContractRead({
            address: contractAddressNFT,
            abi: AvatarABI.abi,
            functionName: 'balanceOf',
            args: [currentAddy],
    })

    const src = `https://i.imgur.com/8Iav7eo.png`;

    const balance = Number(data);

    useEffect(()=>{
    if (balance === 1) {
        setIsMinted(true);
    }
    })

    useEffect(() => {
        setWalletConnected(isConnected);
    }, [isConnected]);

    return (
        <div className="w-[500px]  m-auto  flex flex-col space-y-2">
            {!isMinted ? (
                <>
                <div>
                    <div className="mb-5 text-lg font-bold">
                        You don&apos;t have a profile yet :( Let&apos;s mint your profile nft !
                    </div>
                </div>
                    <MintButton
                    />
                </>
            ) : (
                <>
                    <div className="mb-5 text-lg font-bold">
                        Welcome back. Here is your profile :
                    </div>
                    <div className="Profile_div">                    
                        <div className="NFT_div">
                            <div> Your NFT : </div>
                            <Image
                            className="nftProfile"
                            loader={() => src} 
                            src={src}
                            width="200"
                            height="200"
                            alt=""  
                            />
                        </div>
                        <div className="Stats_div">
                            <div> Analysis of your consumption : </div>
                            <RadarChart />
                        </div>
                    </div>
                </>
            )}
            <div>
                <table className="table mt-7 w-full">
                    <caption className="mb-5 text-lg font-bold">
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
