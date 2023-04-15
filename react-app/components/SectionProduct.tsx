import { useState, useEffect } from "react";
import { contractAddressRegistries, contractAddressToken } from "abis/addresses";
import ContractAbiRegistries from "abis/TCRegistries.json";
import ContractAbiERC20 from "abis/MockERC20.json";

const dotenv = require("dotenv")
dotenv.config()

const pinataSDK = require('@pinata/sdk');

import { ethers } from "ethers";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { useAccount, useContract, useContractRead, useSigner } from "wagmi";

const SectionProduct: React.FC = () => {
  const [productItem, setProductItem] = useState<any>([]);
  const [productOwner, setProductOwner] = useState<string>("");

  const [itemsRequested, setItemsRequested] = useState<any[]>([]);
  const [numberOfItemsMade, setNumberOfItemsMade] = useState<number>(0);
  const [cidsRequested, setCidsRequested] = useState<string[]>([]);

  const [itemsContent, setItemsContent] = useState<any[]>([]);
  
  const router = useRouter();
  const { product, id } = router.query;
  const { address } = useAccount();
  const { data: signer, isError } = useSigner();

  const [isApproved, setIsApproved] = useState<boolean>(false);

  const [itemHash, setItemHash] = useState<string>("");

  const contract = useContract({
    address: contractAddressRegistries,
    abi: ContractAbiRegistries.abi,
    signerOrProvider: signer,
  });

  const tokenContract = useContract({
    address: contractAddressToken,
    abi: ContractAbiERC20.abi,
    signerOrProvider: signer,
  });

  useEffect(() => {
    if (!signer) return;
    if (address) {
      getDatas();
      checkApprove();
      displayDifferencies();
    }
  }, [address, signer]);

  const getDatas = async () => {
    try {
      const productHash = await contract?.proposalsId(id);
      const productStruct = await contract?.proposals(productHash);
      const url = "https://cmb.mypinata.cloud/ipfs/" + product;
      const response = await fetch(url);
      const jsonResponse = await response.json();

      const itemsMadeOnProposal = parseInt(await contract?.getItemsLengthFromProposal(productHash));

      console.log("items made on proposal:", itemsMadeOnProposal);
      setNumberOfItemsMade(itemsMadeOnProposal);
      setProductItem(jsonResponse);
      setProductOwner(productStruct.requester);
    } catch (e) {
      console.log(e);
    }
  };

  const sendFileToIPFS = async () => {
    const pinata = new pinataSDK(`${process.env.NEXT_PUBLIC_PINATA_API_KEY}`, `${process.env.NEXT_PUBLIC_PINATA_API_SECRET}`);
    pinata.testAuthentication().then((result) => {
      //handle successful authentication here
      console.log(result);
      pinata.pinJSONToIPFS(productItem).then((result) => {
        //handle results here
        console.log(result);
        setItemHash(result.IpfsHash);
        console.log(itemHash);
      }).catch((err) => {
          //handle error here
          console.log(err);
      });
    }).catch((err) => {
        //handle error here
        console.log(err);
    });
    setTimeout(() => {
      console.log("item hash:", itemHash);
    }, 3000);
}

  const checkApprove = async () => {
    try {
      let cost = await contract?.ITEM_COST();
      cost = ethers.utils.formatEther(cost);
      let amountApproved = await tokenContract?.allowance(
        address,
        contractAddressRegistries
      );
      amountApproved = ethers.utils.formatEther(amountApproved);
      if (amountApproved > cost) {
        setIsApproved(true);
      } else {
        setIsApproved(false);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const approveToken = async () => {
    try {
      const cost = await contract?.ITEM_COST();
      const tx = await tokenContract?.approve(
        contractAddressRegistries,
        cost
      );
      await tx.wait();
      setIsApproved(true);
    } catch (e) {
      console.log(e);
    }
  };

  const displayDifferencies = async () => {
    try {
        const productHash = await contract?.proposalsId(id);
        const productStruct = await contract?.proposals(productHash);
        
  
        const itemsMadeOnProposal = parseInt(await contract?.getItemsLengthFromProposal(productHash));

        let itemsCIDs = [];
        let itemsStruct = [];
        let itemsContent = [];

        for (let i = numberOfItemsMade -1 ; i >= 0; i--) {
            const itemRequested = await contract?.getItemFromProposal(productHash, i);
            const itemStruct = await contract?.items(itemRequested);
            const itemCID = itemStruct.data;
            console.log("item struct:", itemStruct);
            console.log("item CID:", itemCID);
            itemsStruct.push(itemStruct);
            itemsCIDs.push(itemCID);
            const url = "https://cmb.mypinata.cloud/ipfs/" + itemCID;
            const response = await fetch(url);
            const jsonResponse = await response.json();
            itemsContent.push(jsonResponse);
          }
  
        console.log("items made on proposal:", itemsMadeOnProposal);
        setNumberOfItemsMade(itemsMadeOnProposal);
        setProductOwner(productStruct.requester);
        setItemsRequested(itemsStruct);
        setCidsRequested(itemsCIDs);
        setItemsContent(itemsContent);
      } catch (e) {
        console.log(e);
      }
  };

  const addItem = async() => {
    try {
      await sendFileToIPFS();
      console.log("item tx:", itemHash);
      const proposalId = await contract?.proposalsId(id);
      const tx = await contract?.addItems(proposalId, [itemHash]);
      await tx.wait();
      toast.success("Item added to your registry");
    } catch (e) {
      console.log(e);
    }
  };
  
  const handleObjectFieldChange = (fieldName, subFieldName, value) => {
    const updatedObject = {
      ...productItem[fieldName],
      [subFieldName]: value,
    };
    setProductItem({
      ...productItem,
      [fieldName]: updatedObject,
    });
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
            <img src={productItem.image} className="w-100 h-50 lg:max-w-sm" alt={productItem.name} />
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
                          <li key={index}>
                            {item}
                            {" "}
                            <label>
                            <input
                              type="text"
                              value={item}
                            />

                            </label>
                          </li>
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
                            {" "}
                            <label>
                              <input
                                type="text"
                                value={productItem[key][innerKey] || ""}
                                onChange={(event) =>
                                  handleObjectFieldChange(
                                    key,
                                    innerKey,
                                    event.target.value
                                  )
                                }
                              />
                            </label>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                } else {
                  return (
                    <div key={key}>
                      <h3 className="font-bold">
                        {key.toUpperCase()}:
                      </h3>
                      <p>
                        {value}
                      </p>
                    </div>
                  );
                }
              })}
            </div>
            {isApproved ? (
              <button
                className="bg-orange-400 rounded-lg text-white py-2 pl-4 pr-4 text-xl font-bold hover:bg-orange-500 transition duration-300"
                onClick={() => addItem()}
              >
                Add item
              </button>
            ) : (
              <button
                className="bg-orange-400 rounded-lg text-white py-2 pl-4 pr-4 text-xl font-bold hover:bg-orange-500 transition duration-300"
                onClick={() => approveToken()}
              >
                Approve
              </button>
            )}
            { numberOfItemsMade > 0 ? (
            <div className="pt-4">
            <button
                className="bg-orange-400 rounded-lg text-white py-2 pl-4 pr-4 text-xl font-bold hover:bg-orange-500 transition duration-300"
                onClick={() => displayDifferencies()}
              >
                Check items requested ({numberOfItemsMade})
              </button>
            </div>)
            : null}
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default SectionProduct;