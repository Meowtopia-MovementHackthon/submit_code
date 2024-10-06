import logo from "@/assets/logo.png";
import { getDeepLink } from '@binance/w3w-utils';
import { useEffect, useState } from 'react';
import { BrowserView, MobileView } from 'react-device-detect';

import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger
} from "@/components/ui/drawer";

import {
    Card,
    CardFooter,
    CardHeader,
    CardTitle
} from "@/components/ui/card";

import binanceWallet from "@/assets/wallet/binance.webp";
import bitgetWallet from "@/assets/wallet/bitget.webp";
import metamaskWallet from "@/assets/wallet/metamask.svg";
import okxWallet from "@/assets/wallet/okx.webp";


import CatNFTABI from "@/abi/CatNFT.json";
import MaterialABI from "@/abi/MaterialNFT.json";
import { Button } from '@/components/ui/button';
import ConnectButton from '@/components/ui/ConnectButton';
import { ClipboardWithTooltip } from '@/components/ui/copyToClipboard';
import { CATNFT_CONTRACT_ADDRESS, MATERIAL_CONTRACT_ADDRESS } from '@/config';
import { Spinner } from '@radix-ui/themes';
import { CircleCheckBig, CircleX, Contact, Globe, LogOut, MousePointerClick, Pickaxe, Shapes, TriangleAlert, Wallet, ShieldPlus } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { BaseError } from 'viem';
import { useAccount, useConnect, useDisconnect, useSwitchChain, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { injected } from 'wagmi/connectors';

const UpgradeMaterialNFT = () => {
    const [searchParams, setSearchParams] = useSearchParams()
    const [userID, setUserID] = useState<string>(searchParams.get("userID") || "")
    const [chainId, setChainId] = useState<number>(() => Number(searchParams.get("chainId")));
    const [materialId, setMaterialId] = useState<string>(searchParams.get("materialId") || "")
    console.log("🚀 ~ UpgradeMaterialNFT ~ materialId:", materialId)

    const { isConnected, address, chain, isReconnecting, status } = useAccount()
    const { connect } = useConnect()
    const { disconnect } = useDisconnect()
    const { switchChainAsync, isPending: isSwitchingChain } = useSwitchChain()
    const [isNotSupportNetwork, setIsNotSupportNetwork] = useState<boolean>(false)

    useEffect(() => {
        if (!isConnected) {
            connect({
                connector: injected(),
            })
        }
    }, []);

    useEffect(() => {
        if (isConnected && !isReconnecting) {
            if (chainId && chainId !== chain?.id) {
                setIsNotSupportNetwork(true)
            } else {
                setIsNotSupportNetwork(false)
            }
        }
    }, [isReconnecting, isConnected, status, chainId, chain?.id, address])



    const { data: hash, isPending: isWriteContracting, writeContract, error } = useWriteContract();
    const { isLoading: isConfirming, isSuccess: isConfirmed } =
        useWaitForTransactionReceipt({
            hash,
            confirmations: 3
        })


    window.open = (function (open) {
        return function (url, _, features) {
            return open.call(window, url, "_blank", features);
        };
    })(window.open);

    const handleClickMetamask = () => {
        if (userID && materialId && chainId) {
            const url = `https://metamask.app.link/dapp/meowtopia-wallet-connect.vercel.app/upgrade-cat-nft?materialId=${materialId}&userID=${userID}&chainId=${chainId}`
            window.open(url)
        }
    }

    const handClickOKX = () => {
        if (userID && materialId && chainId) {
            const url = `https://meowtopia-wallet-connect.vercel.app/upgrade-cat-nft?materialId=${materialId}&userID=${userID}&chainId=${chainId}`
            const deepLink = "okx://wallet/dapp/url?dappUrl=" + encodeURIComponent(url);
            const encodedUrl = "https://www.okx.com/download?deeplink=" + encodeURIComponent(deepLink);
            window.open(encodedUrl)
        }
    }

    const handClickBitget = () => {
        if (userID && materialId && chainId) {
            const url = `https://meowtopia-wallet-connect.vercel.app/upgrade-cat-nft?materialId=${materialId}&userID=${userID}&chainId=${chainId}`
            const deepLink = "https://bkcode.vip?action=dapp&url=" + encodeURIComponent(url);
            window.open(deepLink)
        }
    }

    const handleMintCatNFT = async () => {
        writeContract({
            address: MATERIAL_CONTRACT_ADDRESS,
            abi: MaterialABI,
            functionName: 'upgradeMaterialToEquipment',
            args: [materialId],
        });
    }

    const handleClickCoin98 = () => {
        if (userID && materialId && chainId) {
            const url = `https://meowtopia-wallet-connect.vercel.app/upgrade-cat-nft?materialId=${materialId}&userID=${userID}&chainId=${chainId}`
            const deepLink = `https://coin98.com/dapp/${url}/${chainId}`
            window.open(deepLink)
        }
    }

    const handleClickBinance = () => {
        if (userID && materialId && chainId) {
            const url = encodeURIComponent(`https://meowtopia-wallet-connect.vercel.app/upgrade-cat-nft?materialId=${materialId}&userID=${userID}&chainId=${chainId}`)
            const deeplink = getDeepLink(url, chainId)
            window.open(deeplink.http)
        }
    }

    return (
        <div className="relative w-full px-[1rem] pb-[2vh] min-h-screen flex flex-col items-center justify-start gap-y-[40px] bg-[url('@/assets/bg.png')] bg-cover bg-center bg-no-repeat font-Rubik">
            <div className="w-[250px] mt-[12vh]">
                <img src={logo} className="w-full h-full" alt="logo" />
            </div>
            <div className="flex justify-center items-center flex-wrap gap-4">
                <Button variant="outline" className="bg-[#f68329] border-2 border-black text-black hover:bg-[#f68329]">{isNotSupportNetwork && isConnected ? <TriangleAlert color="orange" className='mr-2' /> : <Globe className='mr-2' />} {chain?.name ? chain?.name : "Network"}</Button>
                <Drawer>
                    {
                        address ? (
                            <div className="flex gap-x-3">
                                <div className="flex items-center gap-x-3">
                                    <Button className="flex items-center gap-x-2 bg-[#f68329] hover:bg-green-900 border-2 border-black text-black hover:text-white">{`${address.slice(0, 5)}...${address.slice(-5)}`} <ClipboardWithTooltip content={address} bg="white" /></Button>
                                </div>
                                <BrowserView>
                                    <Button onClick={() => disconnect()} className='p-4 shadow-lg active:translate-y-1 bg-[#f68329] hover:bg-green-900 border-2 border-black text-black hover:text-white flex items-center justify-center'><LogOut /></Button>
                                </BrowserView>
                            </div>
                        ) : (
                            <>
                                <BrowserView>
                                    <ConnectButton />
                                </BrowserView>
                                <MobileView>
                                    <DrawerTrigger>
                                        <Button className='px-[24px] shadow-lg active:translate-y-1'><Wallet className='mr-2' />Connect wallet</Button>
                                    </DrawerTrigger>
                                </MobileView>

                            </>
                        )
                    }
                    <DrawerContent className='flex justify-center items-center border-4 border-black' >
                        <DrawerHeader>
                            <DrawerTitle>Choose Your Wallet:</DrawerTitle>
                            <div className="flex flex-col w-full gap-y-4 mt-4">
                                <Button onClick={handleClickMetamask} className='min-w-[300px] flex items-center justify-start gap-x-3 active:translate-y-1' variant="outline">
                                    <div className="w-[25px] h-[25px] overflow-hidden">
                                        <img src={metamaskWallet} alt="" className='w-full h-full' />
                                    </div>
                                    Metamask
                                </Button>
                                {/* <Button onClick={handleClickCoin98} className='min-w-[300px] flex items-center justify-start gap-x-3 active:translate-y-1' variant="outline">
                                    <div className="w-[25px] h-[25px] overflow-hidden">
                                        <img src={coin98Wallet} alt="" className='w-full h-full' />
                                    </div>
                                    Coin98 Super Wallet
                                </Button> */}
                                <Button onClick={handClickOKX} className='min-w-[300px] flex items-center justify-start gap-x-3' variant="outline">
                                    <div className="w-[25px] h-[25px] overflow-hidden">
                                        <img src={okxWallet} alt="" className='w-full h-full' />
                                    </div>
                                    OKX Wallet
                                </Button>
                                <Button onClick={handClickBitget} className='min-w-[300px] flex items-center justify-start gap-x-3' variant="outline">
                                    <div className="w-[25px] h-[25px] overflow-hidden">
                                        <img src={bitgetWallet} alt="" className='w-full h-full' />
                                    </div>
                                    Bitget Wallet
                                </Button>
                                <Button onClick={handleClickBinance} className='min-w-[300px] flex items-center justify-start gap-x-3' variant="outline">
                                    <div className="w-[25px] h-[25px] overflow-hidden">
                                        <img src={binanceWallet} alt="" className='w-full h-full' />
                                    </div>
                                    Binance Wallet
                                </Button>
                            </div>
                        </DrawerHeader>
                        <DrawerFooter >
                            <DrawerClose>
                                <Button>Cancel</Button>
                            </DrawerClose>
                        </DrawerFooter>
                    </DrawerContent>
                </Drawer>
            </div >
            <div className="w-full flex flex-col gap-4 max-w-[500px]">
                {isWriteContracting && <div className='flex items-center gap-x-2 justify-center'>
                    <Spinner size="3" style={{ color: 'white' }} />
                    <div className="text-blue-500 font-bold">Requesting transaction...</div>
                </div>}
                {isConfirming && <div className="flex items-center gap-x-2 justify-center">
                    <Spinner size="3" style={{ color: 'white' }} />
                    <div className="text-blue-500 font-bold">Waiting for confirmation...</div>
                </div>}
                {error && (
                    <div className='text-red-500 font-bold p-2 rounded-lg border-2 border-black shadow-lg flex items-center justify-center bg-white'><CircleX className='mr-2' />Error: {(error as BaseError).shortMessage || error.message}</div>
                )}
                {
                    isConfirmed && <div className='text-green-500 font-bold p-2 rounded-lg border-2 border-black shadow-lg flex items-center justify-center bg-white'><CircleCheckBig className='mr-2' />Upgrade NFT success. Check your item in Meowtopia</div>
                }
                <Card className='border-2 border-black shadow-lg'>
                    <CardHeader>
                        <CardTitle className='justify-center text-[16px] break-words flex items-center gap-x-2 mb-2'><ShieldPlus color='green' size={25} />UPGRADE MATERIAL NFT</CardTitle>
                        {userID && <div className='text-black font-bold flex items-center gap-x-2'><Contact color='green' size={25} /> User ID: {userID}</div>}
                        {materialId && <div className='text-black font-bold flex items-center gap-x-2'><Shapes color='green' size={25} /> Material ID: {materialId}</div>}
                        {isConnected && materialId && userID && chainId === chain?.id && !isConfirmed && <div className="w-full flex items-center justify-center">
                            <Button disabled={isWriteContracting || isConfirming} onClick={handleMintCatNFT} className={`${isConfirming ? 'w-full active:translate-y-1 bg-green-800 mt-3' : 'active:translate-y-1 bg-[#f68329] mt-3 hover:animate-none hover:bg-green-900 border-2 border-black text-black hover:text-white flex items-center justify-center shadow-lg w-fit duration-200'}`}>
                                {!isConfirming && <MousePointerClick className='mr-2' />}{isConfirming ? 'Confirming...' : 'UPGRADE NOW'}
                            </Button>
                        </div>
                        }
                    </CardHeader>
                </Card>
                {
                    isNotSupportNetwork && isConnected && <Card className='border-2 border-black shadow-lg bg-yellow-500 overflow-hidden'>
                        <CardHeader className="w-full">
                            <CardTitle className='w-full flex flex-col items-center justify-center text-[16px] break-words'><TriangleAlert color="black" className='mr-2' />Your current network is not support by this transaction</CardTitle>
                        </CardHeader>
                        <CardFooter className="w-full flex justify-center">
                            <Button disabled={isSwitchingChain} onClick={() => switchChainAsync({ chainId: chainId })} className="w-full active:translate-y-1">{isSwitchingChain ? <Spinner size="3" /> : "Switch Network to continue"}</Button>
                        </CardFooter>
                    </Card>
                }
                {
                    hash && <Card className='border-2 border-black shadow-lg'>
                        <CardHeader className='flex flex-col gap-y-2'>
                            <CardTitle className='text-left text-[16px] break-words'><div className="flex items-center gap-x-2">Transaction Hash: <ClipboardWithTooltip content={hash} bg="black" /></div>  <span className='text-yellow-900 break-words'>{hash}</span></CardTitle>
                            {/* {hash && chain?.blockExplorers?.default?.url && <a href={`${chain?.blockExplorers?.default?.url}/#/txn/${hash}`} target="_blank" rel="noopener noreferrer" className='text-blue-800 font-bold hover:text-blue-500'>View on {chain?.blockExplorers?.default?.name}</a>} */}
                            {hash && chain?.blockExplorers?.default?.url && <a href={`${chain?.blockExplorers?.default?.url}/tx/${hash}`} target="_blank" rel="noopener noreferrer" className='text-blue-800 font-bold hover:text-blue-500'>View on {chain?.blockExplorers?.default?.name}</a>}
                        </CardHeader>
                    </Card>
                }
            </div>
        </div >
    )
}

export default UpgradeMaterialNFT