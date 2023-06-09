import { Disclosure } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";
import { useRouter } from "next/router";

export default function Header() {
    const router = useRouter();
    const { pathname } = router;
    return (
        <Disclosure as="nav" className="bg-forest border-b border-sand">
            {({ open }) => (
                <>
                    <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
                        <div className="relative flex h-16 justify-between">
                            <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                                {/* Mobile menu button */}
                                <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-gypsum focus:outline-none focus:ring-1 focus:ring-inset focus:rounded-none focus:ring-black">
                                    <span className="sr-only">
                                        Open main menu
                                    </span>
                                    {open ? (
                                        <XMarkIcon
                                            className="block h-6 w-6"
                                            aria-hidden="true"
                                        />
                                    ) : (
                                        <Bars3Icon
                                            className="block h-6 w-6"
                                            aria-hidden="true"
                                        />
                                    )}
                                </Disclosure.Button>
                            </div>
                            <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                                <div className="flex flex-shrink-0 items-center">
                                    <a href="/" >                                    <Image
                                        className="block h-8 w-auto sm:block lg:block"
                                        src="/logo_3.png"
                                        width="1000"
                                        height="1000"
                                        alt="Mileyes Logo"
                                    />
                                    </a>
                                </div>
                                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                                    <a
                                        href="/"
                                        className={`inline-flex items-center ${
                                            pathname === "/"
                                                ? "border-b-2 border-sand"
                                                : ""
                                        } px-1 pt-1 text-gypsum font-medium text-gray-900`}
                                    >
                                        Home
                                    </a>
                                    <a
                                        href="/registerProduct"
                                        className={`inline-flex ${
                                            pathname === "/registerProduct"
                                                ? "border-b-2 border-sand"
                                                : ""
                                        } items-center px-1 pt-1 text-gypsum font-medium text-gray-900`}
                                    >
                                        Register a product
                                    </a>
                                    <a
                                        href="/avatar"
                                        className={`inline-flex items-center px-1 pt-1 text-gypsum font-medium ${
                                            pathname === "/avatar"
                                                ? "border-b-2 border-sand"
                                                : ""
                                        } text-gray-900`}
                                    >
                                        Avatar
                                    </a>
                                </div>
                            </div>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                                <ConnectButton
                                    showBalance={{
                                        smallScreen: true,
                                        largeScreen: false,
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    <Disclosure.Panel className="sm:hidden">
                        <div className="space-y-1 pt-2 pb-4">
                            <Disclosure.Button
                                as="a"
                                href="/"
                                className={`block ${
                                    pathname === "/"
                                        ? "border-l-4 border-black"
                                        : ""
                                } py-2 pl-3 pr-4 text-base font-medium text-black`}
                            >
                                Home
                            </Disclosure.Button>
                            <Disclosure.Button
                                as="a"
                                href="/nft"
                                className={`block py-2 pl-3 pr-4 text-base font-medium text-black ${
                                    pathname === "/nft"
                                        ? "border-l-4 border-black"
                                        : ""
                                }`}
                            >
                                NFT
                            </Disclosure.Button>
                        </div>
                    </Disclosure.Panel>
                </>
            )}
        </Disclosure>
    );
}
