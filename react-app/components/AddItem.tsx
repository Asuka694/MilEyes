import { useState, useEffect } from "react";
import { contractAddressRegistries, contractAddressVoting } from "abis/addresses";
import ContractAbiRegistries from "abis/TCRegistries.json";

import { ethers } from "ethers";
import { toast } from "react-toastify";
import { BeatLoader } from "react-spinners";
import { useRouter } from "next/router";
import { getParsedEthersError } from "@enzoferey/ethers-error-parser";
import { useAccount, useContract, useContractRead, useSigner } from "wagmi";

interface IFormData {
    [key: string]: string;
}
  
interface IItem {
  name: string;
  image: string;
  seller: string;
  manufacturer: string;
  productRegistry: string;
}
  
interface IProps {
  item: IItem;
}

const SectionItem: React.FC = () => {
  const router = useRouter();
  const { address } = useAccount();
  const { data: signer, isError } = useSigner();
  const [productItem, setProductItem] = useState<any>([]);
  const [productHash, setProductHash] = useState<any>([]);

  const { product, id } = router.query;

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
    const productHash = await contract?.proposalsId(id);
    console.log(productHash);
    
    const url = "https://cmb.mypinata.cloud/ipfs/" + product;
    const response = await fetch(url);
    const jsonResponse = await response.json();
    setProductItem(jsonResponse);
    setProductHash(productHash);
  };

  const [formData, setFormData] = useState<IFormData>({});

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    console.log(formData);
  };

  const inputElements = Object.entries(productItem).map(([key, value]) => {
    if (key === 'image') return null; // Skip label for 'image' key
    return (
      <div key={key}>
        <label htmlFor={key}>{key}: </label>
        <input
          type="text"
          name={key}
          id={key}
          value={value}
          onChange={handleChange}
        />
      </div>
    );
  });

  return (
    <form onSubmit={handleSubmit}>
      {inputElements}
      <button type="submit">Submit</button>
    </form>
  );
}

export default SectionItem;
