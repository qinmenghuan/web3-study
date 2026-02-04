// utils/chains.ts
export type ChainConfig = {
  chainId: number;
  name: string;
  rpcUrls: string[];
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  blockExplorerUrls: string[];
};

export const CHAINS: Record<number, ChainConfig> = {
  1: {
    chainId: 1,
    name: "Ethereum Mainnet",
    rpcUrls: ["https://rpc.ankr.com/eth"],
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    blockExplorerUrls: ["https://etherscan.io"],
  },
  11155111: {
    chainId: 11155111,
    name: "Sepolia Testnet",
    rpcUrls: ["https://rpc.sepolia.org"],
    nativeCurrency: {
      name: "Sepolia ETH",
      symbol: "ETH",
      decimals: 18,
    },
    blockExplorerUrls: ["https://sepolia.etherscan.io"],
  },
};

// const chains = [
//   {
//     id: 1,
//     name: "Ethereum",
//     rpcUrl: "https://eth-mainnet.g.alchemy.com/v2/NxyO2bjE2e6Y7kwCbXCny",
//     currency: {
//       name: "Ether",
//       symbol: "ETH",
//       decimals: 18,
//     },
//     blockExplorer: {
//       name: "Etherscan",
//       url: "https://etherscan.io",
//     },
//   },
//   {
//     id: 11155111,
//     name: "Sepolia",
//     rpcUrl: "https://eth-sepolia.g.alchemy.com/v2/It-dPWtmHqFiPOYIjf-zD",
//     currency: {
//       name: "Sepolia Ether",
//       symbol: "ETH",
//       decimals: 18,
//     },
//     blockExplorer: {
//       name: "Sepolia Etherscan",
//       url: "https://eth-sepolia.g.alchemy.com",
//     },
//   },
// ];
