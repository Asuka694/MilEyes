import { gql, useQuery } from "urql";
import { useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/20/solid";
import { contractAddressRegistries } from "abis/addresses";
import ContractAbiTCRegistries from "abis/TCRegistries.json";

import { useAccount, useContract, useSigner } from "wagmi";

export default function Registries() {

  let [first, setFirst] = useState(15);
  let [skip, setSkip] = useState(0);

  const [registry, setRegistry] = useState<string[][]>([]);
  const [filesList, setfilesList] = useState<any[]>([]);
  const { data: signer } = useSigner();
  const { address, isConnected } = useAccount();

  const newData = (direction: string) => {
    switch(direction) {
      case "forward":
        (skip==0) ? setSkip(first) : setSkip(skip + first);
        break;
      case "backward":
        (skip==0) ? setSkip(0) : setSkip(skip - first);
        break;
      default:
        console.log("check direction data...");
        break;
    }
  }

  const getDatas = async () => {
    try {
      const registryIndex = await contract?.proposalsLength();
      const parsedregistryIndex = parseInt(registryIndex);
      const registryArray = [];
      const imageArray = [];

      for (let i = parsedregistryIndex - 1; i >= 0; i--) {
        const registryItem = await contract?.proposalsId(i);
        const item = await contract?.proposals(registryItem);
        const url = "https://cmb.mypinata.cloud/ipfs/" + item.data;
        const response = await fetch(url);
        const jsonResponse = await response.json();
        imageArray.push(jsonResponse.image);
        filesList.push(jsonResponse);
        registryArray.push(registryItem);
      }
      setRegistry(registryArray);
    } catch (e) {
      console.log(e);
    }
  };

  const contract = useContract({
    address: contractAddressRegistries,
    abi: ContractAbiTCRegistries.abi,
    signerOrProvider: signer,
  });

  useEffect(() => {
    if (!signer) return;
    if (address) {
      getDatas();
    }
  }, [address, signer]);

  const graphQuery = gql`
    query ($first: Int!, $skip: Int!) {
      tokens(first: $first, skip: $skip, orderBy: tokenID, orderDirection: asc) {
        id
        tokenID
        tokenURI
        ipfsURI {
          id
          description
          image
          lowerLeft
          lowerRight
          name
          randomNumber
          randomWord
          upperLeft
          upperRight
        }
      }
    }
  `;

  type Token = {
    id: string;
    tokenID: string;
    tokenURI: string;
    ipfsURI: {
      id: string;
      description: string;
      image: string;
      lowerLeft: string;
      lowerRight: string;
      name: string;
      randomNumber: Number;
      randomWord: string;
      upperLeft: string;
      upperRight: string;
    }
  }

  const [result, reexecuteQuery] = useQuery({
    query: graphQuery,
    variables: { first, skip }
  });
  const { data, fetching, error } = result;
  if (fetching) return <p>Loading...</p>;
  if (error) return <p>Error... {error.message}</p>;

  if (!address) {
    return (
      <div className="fixed h-full w-full flex items-center justify-center ">
        <div className="z-10">
          <div className="text-black font-bold text-2xl">
            Connect your wallet first
          </div>
        </div>
      </div>
    );
  }
  return (
    <div>
      { registry.length > 0 ? (
        <>
      <h2 className="text-3xl font-bold text-onyx p-4 ">Registries</h2>   
      <ul role="list" className="grid grid-cols-2 mx-4 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 xl:gap-x-8">
        {registry.map((item, index) => (
          <li key={index} className="relative">
            <div className="group aspect-h-10 aspect-w-10 block w-full overflow-hidden bg-gray-100 focus-within:ring-2 focus-within:ring-forest focus-within:ring-offset-2 focus-within:ring-offset-gray-100">
              <Image src={`${filesList[index].image}?w=1000&q=75`}
                alt={item[1]}
                className="pointer-events-none object-cover group-hover:opacity-75"
                width={1000}
                height={1000}
            />
              <button type="button" className="absolute inset-0 focus:outline-none">
                {/*<span className="sr-only">View details for {token.ipfsURI.name}</span>*/}
              </button>
            </div>
            <p className="pointer-events-none mt-2 block truncate text-sm font-medium text-gray-900">{filesList[index].product_name}</p>
          </li>
        ))}
      </ul>
      <div className="flex items-center justify-between border-t border-onyx px-4 my-10 py-3">
        <div className="flex flex-1 justify-between sm:hidden">
          <a
            onClick={() => {
              newData("backward");
            }}
            className="relative inline-flex items-center border border-onyx bg-gypsum px-4 py-2 text-sm font-medium text-onyx hover:bg-prosperity"
          >
            Previous
          </a>
          <a
            onClick={() => {
              newData("forward");
            }}
            className="relative ml-3 inline-flex items-center border border-onyx bg-gypsum px-4 py-2 text-sm font-medium text-onyx hover:bg-prosperity"
          >
            Next
          </a>
        </div>
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
            </p>
          </div>
          <div>
            <nav className="isolate inline-flex -space-x-px shadow-sm" aria-label="Pagination">
              <a
                onClick={() => {
                  newData("backward");
                }}
                className="relative inline-flex items-center px-2 py-2 text-onyx ring-1 ring-inset ring-onyx hover:bg-prosperity focus:z-20 focus:outline-offset-0"
              >
                <span className="sr-only">Previous</span>
                <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
              </a>
              <a
                onClick={() => {
                  newData("forward");
                }}
                className="relative inline-flex items-center px-2 py-2 text-onyx ring-1 ring-inset ring-onyx hover:bg-prosperity focus:z-20 focus:outline-offset-0"
              >
                <span className="sr-only">Next</span>
                <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
              </a>
            </nav>
          </div>
        </div>
      </div>
      </>
      ) : (
        <div className="fixed h-full w-full flex items-center justify-center ">
          <div className="z-10">
            <div className="text-black font-bold text-2xl">
              No registries yet
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
