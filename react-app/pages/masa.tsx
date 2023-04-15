/*import Button from "@/components/Button";
import InputField from "@/pages/registerProduct";
import Jazzicon from "@/components/Jazzicon";
import { ResolveMasa } from "@/masa-resolver";
import { NameResolutionResults } from "@/types";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { Address, useAccount, useNetwork } from "wagmi";

const NETWORKS: Record<string, any> = {
    alfajores: {
        providerUrl: "https://alfajores-forno.celo-testnet.org",
    },
    celo: {
        providerUrl: "https://forno.celo.org",
    },
};

export default function MasaResolver() {
    const { isConnected } = useAccount();
    const [resolving, setResolving] = useState(false);
    const [resolvedAddress, setResolvedAddress] = useState<Address | null>(
        null
    );
    const [isWalletConneted, setWalletConnected] = useState(false);
    const { chain } = useNetwork();
    const [value, setValue] = useState<string | null>(null);
    const [masaResolver, setMasaResolver] = useState<ResolveMasa | undefined>(
        undefined
    );
    useEffect(() => {
        if (chain) {
            // When chain changes, Masa Resolver is changed to the respective chain resolver.
            let resolver = new ResolveMasa({
                providerUrl:
                    NETWORKS[chain?.name.toLowerCase() as string].providerUrl,
                networkName: chain?.name.toLowerCase() as string,
            });
            setMasaResolver(resolver);
        }
    }, [chain]);

    useEffect(() => {
        setWalletConnected(isConnected);
    }, [isConnected]);

    async function masaResolve() {
        if (value) {
            setResolving(true);
            const { resolutions, errors } = (await masaResolver?.resolve(
                value
            )) as NameResolutionResults;
            if (errors.length) {
                console.log(errors);
                setResolvedAddress(null);
                toast.error("Something went wrong!");
            } else {
                if (resolutions.length) {
                    setResolvedAddress(resolutions[0].address);
                } else {
                    setResolvedAddress(null);
                    toast.error("No Resolutions Found!");
                }
            }
        }
        setResolving(false);
    }

    function handleInput({ target }: any) {
        setValue(target.value);
    }

    return (
        <div className="w-[600px] m-auto flex flex-col space-y-4">
            {isWalletConneted ? (
                <>
                    <InputField
                        className="no-spinner"
                        label="Enter a .celo name"
                        value={value ?? ""}
                        onChange={handleInput}
                        type="text"
                    />
                    {resolvedAddress ? (
                        <div className="flex space-x-4 items-center">
                            <h1>Resolved Address: </h1>
                            <a
                                href={`https://${
                                    chain?.name.toLowerCase() == "alfajores"
                                        ? "alfajores."
                                        : ""
                                }celoscan.io/address/${resolvedAddress}`}
                                target="_blank"
                            >
                                <div className="flex space-x-2 items-center underline">
                                    <Jazzicon
                                        diameter={10}
                                        address={resolvedAddress}
                                    />
                                    <h1>{resolvedAddress}</h1>
                                </div>
                            </a>
                        </div>
                    ) : null}
                    <Button
                        text="Create Avatar"
                        isLoading={resolving}
                        disabled={value == null}
                        onClick={masaResolve ?? (() => {})}
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
        </div>
    );
}
*/