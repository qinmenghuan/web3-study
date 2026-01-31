import { useEffect, useMemo, useState, useCallback } from "react";
import { BrowserProvider, Contract } from 'ethers';
import { StakeContractAddress } from '../utils/env';
import { stakeAbi } from '../assets/abis/stake';
// import { useAccount } from 'wagmi';

type UseContractOptions = {
  chainId?: number, 
}

export function useContract(addressOrAddressMap? : string , abi?: any, options?: UseContractOptions) { 
  return useMemo(() => {
    if (!addressOrAddressMap || !abi) return null;
    if (typeof window === "undefined" || !window.ethereum) return null;
    try {
      const provider = new BrowserProvider(window.ethereum)
      const signer = provider.getSigner();
      console.log("signer:", signer);
      let address: string | undefined;
      if (typeof addressOrAddressMap === "string") {
        address = addressOrAddressMap
      } else {
        const chainId = options?.chainId;
        if (!chainId)  return null;
        address = addressOrAddressMap[chainId];        
      }

      if (!address) return null;
      console.log("address:", address);

      // return new Contract(address, abi, signer);
      // 返回一个只读合约（provider）
      // 注意：只有在发送交易时才需要 signer
      return new Contract(address, abi, provider);
    } catch (error) {
      console.error("Failed to get ethers contract", error);
      return null;
    }
  },[addressOrAddressMap, abi, options?.chainId])
}

export const useStakeContract = () => {
  return useContract(StakeContractAddress, stakeAbi);
}

// export const useStakeWriterContract = () => {
//   const stakeContract = useContract(StakeContractAddress, stakeAbi);
  
//   const contractWithSigner = async () => {
//     if (!stakeContract) return null;
//     if (typeof window === "undefined" || !window.ethereum) return null;
//     const provider = new BrowserProvider(window.ethereum);
//     await provider.send("eth_requestAccounts", []);
//     const signer = await provider.getSigner();
//     return stakeContract.connect(signer);
//   };
//   return contractWithSigner;
// }


// export const useStakeWriterContract = () => {
//   const stakeContract = useContract(StakeContractAddress, stakeAbi);
//   const { data: walletClient } = useWalletClient();

//   return useMemo(() => {
//     if (!stakeContract || !walletClient) return null;

//     const provider = new BrowserProvider(walletClient.transport);
//     const signer = provider.getSigner();

//     return stakeContract.connect(signer);
//   }, [stakeContract, walletClient]);
// };



// export const useStakeWriterContract = () => {
//   const { data: walletClient } = useWalletClient();

//   return useMemo(() => {
//     if (!walletClient) return null;

//     return new Contract(
//       StakeContractAddress,
//       stakeAbi,
//       walletClient // ✅ wagmi 的 walletClient 本身就是 signer runner
//     );
//   }, [walletClient]);
// };


// import { useEffect, useMemo, useState } from "react";
// import { BrowserProvider, Contract, type JsonRpcSigner } from "ethers";
// import { useAccount } from "wagmi";
// import { StakeContractAddress, stakeAbi } from "@/constants";

// export const useStakeWriterContract = () => {
//   const { isConnected } = useAccount();
//   const [signer, setSigner] = useState<JsonRpcSigner | null>(null);

//   // 1️⃣ 只在钱包连接后创建 signer
//   useEffect(() => {
//     if (!isConnected) {
//       setSigner(null);
//       return;
//     }

//     if (typeof window === "undefined" || !window.ethereum) return;

//     const initSigner = async () => {
//       const provider = new BrowserProvider(window.ethereum);
//       const signer = await provider.getSigner();
//       setSigner(signer);
//     };

//     initSigner();
//   }, [isConnected]);

//   // 2️⃣ memo 合约实例（关键）
//   const contract = useMemo(() => {
//     if (!signer) return null;

//     return new Contract(
//       StakeContractAddress,
//       stakeAbi,
//       signer
//     );
//   }, [signer]);

//   return contract;
// };



// import { BrowserProvider, Contract } from "ethers";
// import { useEffect, useState } from "react";
// import { StakeContractAddress, stakeAbi } from "../constants";

// export const useStakeWriterContract = () => {
//   const [contract, setContract] = useState<Contract | null>(null);

//   useEffect(() => {
//     const init = async () => {
//       if (typeof window === "undefined" || !window.ethereum) return;

//       const provider = new BrowserProvider(window.ethereum);
//       await provider.send("eth_requestAccounts", []);
//       const signer = await provider.getSigner();

//       const c = new Contract(
//         StakeContractAddress,
//         stakeAbi,
//         signer
//       );

//       setContract(c);
//     };

//     init();
//   }, []);

//   return contract;
// };


export const useStakeWriterContract = () => {
  // 使用你现有的 useContract 获取只读合约
  const readContract = useContract(StakeContractAddress, stakeAbi);

  const [writerContract, setWriterContract] = useState<Contract | null>(null);

  const initWriterContract = useCallback(async () => {
    if (!readContract || typeof window === "undefined" || !window.ethereum) return;

    try {
      // 请求钱包授权
      const provider = new BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);

      const signer = await provider.getSigner();

      // 连接 signer，返回可写合约
      setWriterContract(readContract.connect(signer));
    } catch (err) {
      console.error("Failed to init writer contract:", err);
      setWriterContract(null);
    }
  }, [readContract]);

  useEffect(() => {
    initWriterContract();
  }, [initWriterContract]);

  return writerContract;
};