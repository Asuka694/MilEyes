import { gql, useQuery } from "urql";
import { useState } from "react";
import Image from "next/image";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/20/solid";


export default function NFT() {

  let [first, setFirst] = useState(4);
  let [skip, setSkip] = useState(0);

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

  return (
    <div>
      <h2 className="text-3xl font-bold text-onyx p-4 ">Celo Boxes</h2>   
      <ul role="list" className="grid grid-cols-2 mx-4 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 xl:gap-x-8">
        {data.tokens.map((token: Token) => (
          <li key={token.tokenID} className="relative">
            <div className="group aspect-h-10 aspect-w-10 block w-full overflow-hidden bg-gray-100 focus-within:ring-2 focus-within:ring-forest focus-within:ring-offset-2 focus-within:ring-offset-gray-100">
              <Image src={`${token.ipfsURI.image}?w=1000&q=75`}
                alt={token.ipfsURI.name}
                className="pointer-events-none object-cover group-hover:opacity-75"
                width={1000}
                height={1000}
              />
              <button type="button" className="absolute inset-0 focus:outline-none">
                <span className="sr-only">View details for {token.ipfsURI.name}</span>
              </button>
            </div>
            <p className="pointer-events-none mt-2 block truncate text-sm font-medium text-gray-900">{token.ipfsURI.name}</p>
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
    </div>
  )
}
