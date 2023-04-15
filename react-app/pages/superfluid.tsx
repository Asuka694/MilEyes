import { Framework } from "@superfluid-finance/sdk-core";
import { Signer } from "ethers";
import { useEffect } from "react";
import { useProvider, useSigner } from "wagmi";

export default function SuperFluid() {
    const provider = useProvider();
    const { data: signer } = useSigner();

    useEffect(() => {
        (async () => {
            const sf = await Framework.create({
                chainId: 44787, //your chainId here
                provider,
            });
            const sfSigner = sf.createSigner({ signer: signer as Signer });
        })();
    }, []);

    return (
        <div>
            <h1>SuperFluid</h1>
        </div>
    );
}
