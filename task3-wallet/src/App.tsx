import "./App.css";
import { ethers } from "ethers";
// import WalletProvider from "./wallet-sdk/provider";
import { WalletProvider, ConnectButton } from "./wallet-sdk";
import type { Wallet } from "./wallet-sdk/types";
import metaMaskWallet from "./wallet-sdk/connectors/metamask";
import coinbaseWallet from "./wallet-sdk/connectors/coinbase";

declare global {
  interface Window {
    ethereum: any;
  }
}

const chains = [
  {
    id: 1,
    name: "Ethereum",
    rpcUrl: "https://eth-mainnet.g.alchemy.com/v2/NxyO2bjE2e6Y7kwCbXCny",
    currency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18,
    },
    blockExplorer: {
      name: "Etherscan",
      url: "https://etherscan.io",
    },
  },
  {
    id: 11155111,
    name: "Sepolia",
    rpcUrl: "https://eth-sepolia.g.alchemy.com/v2/It-dPWtmHqFiPOYIjf-zD",
    currency: {
      name: "Sepolia Ether",
      symbol: "ETH",
      decimals: 18,
    },
    blockExplorer: {
      name: "Sepolia Etherscan",
      url: "https://eth-sepolia.g.alchemy.com",
    },
  },
];

const wallets: Wallet[] = [metaMaskWallet, coinbaseWallet];

function App() {
  const provider = new ethers.BrowserProvider(window.ethereum);

  return (
    <>
      <WalletProvider
        chains={chains}
        provider={provider}
        autoConnect={true}
        wallets={wallets}
      >
        <div className="text-3xl font-bold underline">helle world</div>
        <ConnectButton></ConnectButton>
      </WalletProvider>
    </>
  );
}

export default App;
