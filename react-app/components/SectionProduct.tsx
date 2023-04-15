import { useState, useEffect } from "react";
import { contractAddressRegistries, contractAddressVoting } from "abis/addresses";
import ContractAbiRegistries from "abis/TCRegistries.json";

import { ethers } from "ethers";
import { BeatLoader } from "react-spinners";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { getParsedEthersError } from "@enzoferey/ethers-error-parser";
import { useAccount, useContract, useContractRead, useSigner } from "wagmi";

const SectionProduct: React.FC = () => {
  const [isContract, setIsContract] = useState<any>();
  const [productItem, setProductItem] = useState<any[]>([]);
  const [numberOfItems, setNumberOfItems] = useState<number>(1);
  const [productOwner, setProductOwner] = useState<string>("");

  const [isParticipants, setIsParticipants] = useState("");
  const [isSelected, setIsSelected] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDrawLoading, setIsDrawLoading] = useState<boolean>(false);
  const [startDate, setStartDate] = useState<number>(0);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [calculateFees, setCalculateFees] = useState<string[]>([]);
  const [winner, setWinner] = useState<string>("");
  const [nftRank, setNftRank] = useState<string>("");
  const [nftName, setNftName] = useState<string>("");
  const router = useRouter();
  const { product } = router.query;
  const { address } = useAccount();
  const { data: signer, isError } = useSigner();

  console.log("product is :", product);
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
      const productItem = await contract?.proposals(product);
      console.log("productItem is :", productItem);
      let token: any = [];

      const calculate = await contract?.calculateRaffleFees(
        parseInt(productItem[0])
      );

      const count = productItem[11].reduce(
        (accumulator: { [x: string]: any }, value: string | number) => {
          return { ...accumulator, [value]: (accumulator[value] || 0) + 1 };
        },
        {}
      );

      const lol = [...productItem];

      setIsAdmin(admin);
      setCalculateFees(calculate[1]);
      setIsParticipants(count);
      setProductItem(lol);
      setStartDate(Date.now());
      setWinner(winner);
      await fetch(
        `https://api.ebisusbay.com/nft?collection=${productItem[3]}&tokenId=${productItem[4]}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
        .then((res) => res.json())
        .then((data) => {
          token = data;
        });
      setNftRank(token.nft.rank);
      setNftName(token.nft.name);
    } catch (e) {
      console.log(e);
    }
    setIsContract(contract);
  };

  const addNumberOfTickets = () => {
    setNumberOfItems(numberOfItems + 1);
  };

  const removeNumberOfTickets = () => {
    if (numberOfItems > 1) {
      setNumberOfItems(numberOfItems - 1);
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
        <div className="w-full flex flex-col lg:flex-row mt-7">
          <div className="w-full lg:w-1/3 md:mr-8 px-8 pt-5 md:pt-0 md:px-0 self-start">
            <div>
              <img src={productItem[5]} className="w-100" />
            </div>
            <div className="flex justify-around mt-5">
              <div>
                <button
                  className="text-white text-2xl"
                  onClick={removeNumberOfTickets}
                >
                  -
                </button>
              </div>
              <div>
                <span className="text-white text-2xl">{numberOfItems}</span>
              </div>
              <div>
                <button
                  className="text-white text-2xl"
                  onClick={addNumberOfTickets}
                >
                  +
                </button>
              </div>
            </div>
            <div className="text-center mt-5 w-full">
              <button
                className="w-full bg-orange-400 rounded-lg text-white py-3 text-xl font-bold hover:bg-orange-500 transition duration-300"
                onClick={enterRaffle}
              >
                {isLoading ? (
                  <BeatLoader color={"#fff"} size={10} />
                ) : (
                  "Enter Raffle"
                )}
              </button>
            </div>
          </div>
          <div className="lg:w-2/3 bg-white dark:bg-offbase md:rounded-2xl p-8 mt-5 md:mt-0 transition">
            <div className="flex gap-5">
              <div className="text-xl font-bold">
                <button
                  onClick={() => setIsSelected(0)}
                  className={`${
                    isSelected == 0 ? "text-orange-400" : "text-black-400"
                  }`}
                >
                  Details
                </button>
              </div>
              <div className="text-xl font-bold">
                <button
                  onClick={() => setIsSelected(1)}
                  className={`${
                    isSelected == 1 ? "text-orange-400" : "text-black-400"
                  }`}
                >
                  Participants
                </button>
              </div>
              <div className="text-xl font-bold">
                <button
                  onClick={() => setIsSelected(2)}
                  className={`${
                    isSelected == 2 ? "text-orange-400" : "text-black-400"
                  }`}
                >
                  Fees
                </button>
              </div>
            </div>
            <hr className="mt-3" />
            {isSelected == 0 && (
              <div className="mt-5">
                <div className="flex justify-between mt-5">
                  <div className="text-xl font-bold w-full text-center">
                    <span className="text-sm">Collection</span>
                    <br />
                    <span className="text-xl text-orange-400">
                      {nftName}
                    </span>
                  </div>
                  <div className="text-xl font-bold w-full text-center">
                    <span className="text-sm">Rank</span>
                    <br />
                    <span className="text-xl text-orange-400">
                      {nftRank} 
                    </span>
                  </div>
                </div>
                <div className="flex justify-between mt-5">
                  <div className="text-xl font-bold w-full text-center">
                    <span className="text-sm"> Raffle ends on </span>
                    <br />
                    <span className="text-xl text-orange-400">
                      {new Date(productItem[2] * 1000).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-xl font-bold w-full text-center">
                    <span className="text-sm">Raffle price</span>
                    <br />
                    <span className="text-xl text-orange-400">
                      {productItem[6] / 10 ** 18} CRO
                    </span>
                  </div>
                </div>
                
                <div className="flex justify-between mt-5">
                  <div className="text-xl font-bold w-full text-center">
                    <span className="text-sm">Tickets sold</span>
                    <br />
                    <span className="text-xl text-orange-400">
                      {parseInt(productItem[8])} / {parseInt(productItem[7])}
                    </span>
                  </div>
                  <div className="text-xl font-bold w-full text-center">
                    
                    <br />
                    <span className="text-xl">
                      
                    </span>
                  </div>
                </div>

                
                {winner !== "0x0000000000000000000000000000000000000000" && (
                  <div className="mt-10 text-center">
                    Winner is : {winner} ✅
                  </div>
                )}
                {isAdmin && (
                  <div className="mt-10">
                    <div className="text-center mb-3">
                      <span className="text-xl text-center font-bold">
                        Admin actions
                      </span>
                    </div>
                    <div className="w-full text-center">
                      <div className="text-center">
                        {(Date.now() > productItem[2] * 1000 || parseInt(productItem[8]) == parseInt(productItem[7])) && (productItem[12] == false)  && (
                          <button
                            className="w-1/2 bg-orange-400 rounded-lg text-white py-3 text-xl font-bold hover:bg-orange-500 transition duration-300"
                            onClick={() => drawRaffle(parseInt(productItem[0]))}
                          >
                            {(parseInt(productItem[8]) >= 70/100 * parseInt(productItem[7])) ? (isDrawLoading ? (
                              <BeatLoader color={"#fff"} size={10} />
                            ) : (
                              "Draw Winner"
                            )) : (isDrawLoading ? (<BeatLoader color={"#fff"} size={10} />) : ("Refund raffle"))}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            {isSelected == 1 && (
              <div className="mt-5">
                <ul className="overflow-scroll">
                  {Object.keys(isParticipants).map((key) => {
                    return (
                      <li key={key} className="flex justify-between">
                        <div className="text-xl font-bold">
                          <span className="text-sm"> {key} </span>
                        </div>
                        <div className="text-xl font-bold">
                          <span className="text-sm">
                            {isParticipants[key as unknown as number]}{" "}
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
            {isSelected == 2 && (
              <div className="mt-10">
                <div className="text-center mb-3">
                  <span className="text-xl text-center font-bold">
                    Table fees
                  </span>
                </div>
                <table className="w-full border-2">
                  <thead className="border-2">
                    <tr>
                      <th className="text-center border-2 text-sm font-bold">
                        DAO
                      </th>
                      <th className="text-center border-2 text-sm font-bold">
                        Project Owner
                      </th>
                      <th className="text-center border-2 text-sm font-bold">
                        Raffle Host / Raffle Creator
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      {calculateFees.map((fee, index) => (
                        <td
                          key={index}
                          className="text-center border-2 text-sm"
                        >
                          {parseInt(fee) / 10} %
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SectionProduct;
