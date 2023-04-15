import { useState, useEffect } from "react";
import { contractAddressRegistries, contractAddressVoting } from "abis/addresses";
import ContractAbiRegistries from "abis/TCRegistries.json";
import Image from "next/image";

import Link from "next/link";

import { ethers } from "ethers";
import { BeatLoader } from "react-spinners";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { getParsedEthersError } from "@enzoferey/ethers-error-parser";
import { useAccount, useContract, useContractRead, useSigner } from "wagmi";

const SectionProduct: React.FC = () => {
  const [isContract, setIsContract] = useState<any>();
  const [productItem, setProductItem] = useState<any>([]);
  const [numberOfItems, setNumberOfItems] = useState<number>(1);
  const [productOwner, setProductOwner] = useState<string>("");
  
  const router = useRouter();
  const { product, id } = router.query;
  const { address } = useAccount();
  const { data: signer, isError } = useSigner();

  const contract = useContract({
    address: contractAddressRegistries,
    abi: ContractAbiRegistries.abi,
    signerOrProvider: signer,
  });

  useEffect(() => {
    if (!signer) return;
    if (address) {
      getDatas();
    }
  }, [address, signer]);

  const getDatas = async () => {
    try {
      const productHash = await contract?.proposalsId(id);
      const productStruct = await contract?.proposals(productHash);
      const url = "https://cmb.mypinata.cloud/ipfs/" + product;
      const response = await fetch(url);
      const jsonResponse = await response.json();
      setProductItem(jsonResponse);
      setProductOwner(productStruct.requester);
    } catch (e) {
      console.log(e);
    }
  };

  if (!address) {
    return (
      <div className="fixed h-full w-full flex items-center justify-center ">
        <div className="z-10">
          <div className="text-white font-bold text-2xl">
            Connect your wallet first
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="container-fluid pl-14 pr-14">
        <div className="mt-5">
          <button
            className="bg-orange-400 rounded-lg text-white py-2 pl-4 pr-4 text-xl font-bold hover:bg-orange-500 transition duration-300"
            onClick={() => router.back()}
          >
            Back
          </button>
        </div>
      <div className="container mx-auto mt-10 flex flex-col lg:flex-row">
        <div className="w-full lg:w-1/3 lg:mr-8 px-8 pt-5 md:pt-0 md:px-0 self-start">
          <img src={productItem.image} className="w-full h-auto lg:max-w-sm" alt={productItem.name} />
        </div>
        <div className="w-full lg:w-2/3">
        <h1 className="text-2xl">Registry creator: </h1> <p>{productOwner}</p>
          <br/>
          <h1 className="text-2xl font-bold">{productItem.product_name}</h1>
          <div className="my-5">
            {Object.entries(productItem).map(([key, value]) => {
              if (Array.isArray(value)) {
                return (
                  <div key={key}>
                    <h3 className="font-bold">{key.toUpperCase()}:</h3>
                    <ul>
                      {value.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </div>
                );
              } else if (typeof value === "object" && value !== null) {
                return (
                  <div key={key}>
                    <h3 className="font-bold">{key.toUpperCase()}:</h3>
                    <ul>
                      {Object.entries(value).map(([innerKey, innerValue]) => (
                        <li key={innerKey}>
                          {innerKey.charAt(0).toUpperCase() + innerKey.slice(1)}: {innerValue}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              } else {
                return (
                  <div key={key}>
                    <h3 className="font-bold">{key.toUpperCase()}:</h3>
                    <p>{value}</p>
                  </div>
                );
              }
            })}
          </div>
            <Link href={`/addItem/?product=${product}&id=${id}`}>
              <button
              className="bg-orange-400 rounded-lg text-white py-2 pl-4 pr-4 text-xl font-bold hover:bg-orange-500 transition duration-300"
              >
                Add item
              </button>
            </Link>
        </div>
      </div>
    </div>
    </div>
  );

  
};

export default SectionProduct;
