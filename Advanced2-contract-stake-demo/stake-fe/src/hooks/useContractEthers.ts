import { useMemo } from 'react';
import { BrowserProvider, Contract } from 'ethers';
import { StakeContractAddress } from '../utils/env';
import { stakeAbi } from '../assets/abis/stake';

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