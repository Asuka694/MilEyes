import { NameResolutionResults, NameResolver } from "./types";

import { providers } from "ethers";
import { Masa } from "@masa-finance/masa-sdk";
import { Address } from "wagmi";

export class ResolveMasa implements NameResolver {
    masa: Masa;

    constructor({
        providerUrl,
        networkName,
        masa,
    }: {
        providerUrl?: string;
        networkName?: string;
        masa?: Masa;
    }) {
        this.masa = masa
            ? masa
            : new Masa({
                  wallet: new providers.JsonRpcProvider(
                      providerUrl
                  ).getSigner(),
                  networkName: networkName === "celo" ? "celo" : "alfajores",
              });
    }

    async resolve(id: string): Promise<NameResolutionResults> {
        const result: NameResolutionResults = {
            resolutions: [],
            errors: [],
        };

        try {
            const extension = await this.masa.contracts.instances.SoulNameContract.extension();

            if (!id.endsWith(extension)) {
                return result;
            }

            const name = id.replace(extension, "");

            const address = await this.masa.soulName.resolve(name);
            if (address) {
                result.resolutions.push({
                    address: address as Address,
                    name,
                });
            }
        } catch (error) {
            result.errors.push({
                error: error as Error,
            });
        }

        return result;
    }
}
