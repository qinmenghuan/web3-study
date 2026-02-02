import { ethers } from "ethers";
import type { Wallet } from "../types";

const connectMetamask = async (): Promise<any> => {
  // TODO: 判断是否安装了metamask
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("MetaMask is not installed");
  }

  try {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    if (!accounts || accounts.length === 0) {
      throw new Error("no accounts found");
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    const { chainId } = await provider.getNetwork();

    // 监听账户链接变化
    window.ethereum.on("accountsChanged", (newAccounts: string[]) => {
      if (newAccounts.length === 0) {
        window.dispatchEvent(new CustomEvent("wallet_disconnected"));
      } else {
        window.dispatchEvent(
          new CustomEvent("wallet_accounts_changed", {
            detail: { accounts: newAccounts },
          }),
        );
      }
    });

    // 监听区块链网络的切换
    window.ethereum.on("chainChanged", (newChainIdHex: string) => {
      const newChainId = parseInt(newChainIdHex, 16);
      window.dispatchEvent(
        new CustomEvent("wallet_chain_changed", {
          detail: { chainId: newChainId },
        }),
      );
    });

    return {
      accounts,
      chainId,
      address,
    };
  } catch (error: Error) {
    throw new Error(error.message || "Failed to connect to MetaMask");
  }
};

export const metaMaskWallet: Wallet = {
  id: "metamask",
  name: "MetaMask",
  icon: "https://assets.coingecko.com/coins/images/279/large/ethereum.png?1696501628",
  connector: connectMetamask,
  description:
    "MetaMask is a browser extension that allows you to interact with Ethereum-based blockchains",
  installed: true,
  downloadLink: "https://metamask.io/download/",
};

export default metaMaskWallet;
