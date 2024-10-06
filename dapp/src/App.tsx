import { useAppKit } from "@reown/appkit/react";
import { useCallback, useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import {
  useAccount,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import CatNFTABI from "./abi/CatNFT.json";
import SoundBoundTokenABI from "./abi/SoundBoundToken.json";
import "./App.css";
import { CATNFT_CONTRACT_ADDRESS, SOUNDBOUND_TOKEN_CONTRACT_ADDRESS } from "./config";
import { convertBigIntJsonToString, convertToArray } from "./utils/utils";


function App() {
  const { open, close } = useAppKit()
  const { isConnected, address, chain, isReconnecting, status } = useAccount()
  const { data: hash, isPending: isWriteContracting, writeContract, error } = useWriteContract();
  const [lastOperation, setLastOperation] = useState<'mint' | 'claim' | null>(null);
  const [mintingToastId, setMintingToastId] = useState<string | null>(null);
  const [claimingToastId, setClaimingToastId] = useState<string | null>(null);

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash,
      confirmations: 3
    })

  useEffect(() => {
    if (error && mintingToastId) {
      toast.dismiss(mintingToastId);
      toast.error("Execute transaction failed");
      setMintingToastId(null);
    }
    if (error && claimingToastId) {
      toast.dismiss(claimingToastId);
      toast.error("Execute transaction failed");
      setClaimingToastId(null);
    }
  }, [error])

  const { data: tokensOfOwner, refetch: refetchNFT } = useReadContract({
    address: CATNFT_CONTRACT_ADDRESS,
    abi: CatNFTABI,
    functionName: 'getTokensOfOwner',
    args: [address],
  })

  const { data: soundboundTokenBalance, refetch: refetchSoundboundTokenBalance } = useReadContract({
    address: SOUNDBOUND_TOKEN_CONTRACT_ADDRESS,
    abi: SoundBoundTokenABI,
    functionName: 'balanceOf',
    args: [address]
  })


  // useEffect(() => {
  //   if (isConfirmed) {
  //     refetchNFT()
  //   }
  // }, [isConfirmed])

  const iframe = document.querySelector("#game") as HTMLIFrameElement;

  const sendMessageToGame = (type: string, message: string = "") => {
    console.log("Send GAME", type, message);

    iframe.contentWindow?.postMessage(
      {
        type,
        message,
      },
      "*"
    );
  };

  useEffect(() => {
    if (isConnected && address) {
      sendMessageToGame("connect-wallet", address);
    }
  }, [isConnected, address]);

  const connectWallet = useCallback(async () => {
    try {
      if (isConnected && address) {
        sendMessageToGame("connect-wallet", address);
      } else {
        await open();
      }

      // sendMessageToGame("connect-wallet", "0x123123123123");
    } catch (e) { }
  }, [isConnected, address, open]);

  const getNFTList = useCallback(async () => {
    // console.log("🚀 ~ getNFTList ~ data:", data)
    try {
      const { data: nftData } = await refetchNFT();
      if (nftData) {
        const convertedData = convertToArray(convertBigIntJsonToString(nftData));
        sendMessageToGame("get-nft-list", JSON.stringify(convertedData));
      } else {
        sendMessageToGame("get-nft-list", JSON.stringify({ data: [] }));
      }
    } catch (e) {
      console.error("Error in getNFTList:", e);
    }
  }, [refetchNFT]);

  const getTokenBalance = useCallback(async () => {
    try {
      const { data: balance } = await refetchSoundboundTokenBalance()
      if (balance) {
        sendMessageToGame("get-token-balance", JSON.stringify(Number(balance) / 10 ** 18));
        sendMessageToGame("refesh-token-balance", JSON.stringify(Number(balance) / 10 ** 18));
      } else {
        sendMessageToGame("get-token-balance", "0");
        sendMessageToGame("refesh-token-balance", "0");
      }
    } catch (e) { }
  }, [refetchSoundboundTokenBalance]);


  useEffect(() => {
    const handleConfirmation = async () => {
      if (isConfirmed) {
        if (lastOperation === 'mint') {
          if (mintingToastId) {
            toast.dismiss(mintingToastId);
            setMintingToastId(null);
          }
          toast.success("NFT minted successfully");
          try {
            const { data: nftData } = await refetchNFT();
            const convertedData = nftData
              ? convertToArray(convertBigIntJsonToString(nftData))
              : { data: [] };
            sendMessageToGame("mint-nft", JSON.stringify(convertedData));
          } catch (error) {
            console.error("Error in NFT minting:", error);
            toast.error("Failed to update NFT list");
          }
        } else if (lastOperation === 'claim') {
          if (claimingToastId) {
            toast.dismiss(claimingToastId);
            setClaimingToastId(null);
          }
          toast.success("Claim token successfully")
          const { data: nftData } = await refetchNFT();
          const convertedData = nftData
            ? convertToArray(convertBigIntJsonToString(nftData))
            : { data: [] };
          sendMessageToGame("claim-token", JSON.stringify(convertedData));
          try {
            await getTokenBalance();
          } catch (error) {
            console.error("Error in token claiming:", error);
            toast.error("Failed to update token balance");
          }
        }
      }
    };
    handleConfirmation();
  }, [isConfirmed, getNFTList, getTokenBalance, lastOperation])

  const mintNFT = useCallback(async () => {
    try {
      setLastOperation('mint');
      const toastId = toast.loading("Minting NFT...", { duration: Infinity });
      setMintingToastId(toastId);
      writeContract({
        address: CATNFT_CONTRACT_ADDRESS,
        abi: CatNFTABI,
        functionName: 'mint',
        args: [],
      });
    } catch (e) {
      console.error("Error in mintNFT:", e);
      if (mintingToastId) {
        toast.dismiss(mintingToastId);
        setMintingToastId(null);
      }
      toast.error("Failed to mint NFT");
      sendMessageToGame("nft-minted", "failed");
    }
  }, []);


  const claimToken = useCallback(async () => {
    try {
      setLastOperation('claim');
      const toastId = toast.loading("Claiming tokens...", { duration: Infinity });
      setClaimingToastId(toastId);
      const { data: nftData } = await refetchNFT();
      const listCatType = Array.isArray(nftData) ? nftData.map((item: any) => item.catId) : [];
      writeContract({
        address: CATNFT_CONTRACT_ADDRESS,
        abi: CatNFTABI,
        functionName: 'claimBatchFarmTokens',
        args: [listCatType],
      });

    } catch (e) {
      if (claimingToastId) {
        toast.dismiss(claimingToastId);
        setClaimingToastId(null);
      }
      toast.error("Failed to claim tokens");
      console.error("Error in claimToken:", e);
    }
  }, [refetchNFT]);

  // This hook is listening an event that came from the Iframe
  useEffect(() => {
    const handler = async (
      ev: MessageEvent<{ type: string; message: string }>
    ) => {
      if (typeof ev.data !== "object") return;

      console.log("ev", ev);

      if (ev.data.type == "connect-wallet") {
        connectWallet();
      }

      if (ev.data.type == "get-nft-list") {
        getNFTList();
      } else if (ev.data.type == "mint-nft") {
        mintNFT();
      } else if (ev.data.type == "claim-token") {
        claimToken();
      } else if (ev.data.type == "get-token-balance") {
        getTokenBalance();
      } else if (ev.data.type == "refesh-token-balance") {
        getTokenBalance();
      }
    };

    window.addEventListener("message", handler);

    // Don't forget to remove addEventListener
    return () => window.removeEventListener("message", handler);
  }, []);

  return (
    <>
    </>
  );
}

export default App;
