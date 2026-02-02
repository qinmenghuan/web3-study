import { ethers } from "ethers";
import type { Wallet } from "../types";
// import { disconnect } from "process";

function isCoinbaseWalletInstalled(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof (window as any).coinbaseWalletExtension !== "undefined"
  );
}

const connectCoinbaseWallet = async () => {
  try {
    if (!isCoinbaseWalletInstalled()) {
      throw new Error("Coinbase Wallet extension is not installed");
    }

    // 创建一个coinbase 的provider
    const coinbaseProvider = (window as any).coinbaseWalletExtension;
    const provider = new ethers.BrowserProvider(coinbaseProvider);

    // 请求链接账号
    const accounts = await coinbaseProvider.send("eth_requestAccounts", []);

    // 获取signer和地址
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    const { chainId } = await provider.getNetwork();

    coinbaseProvider.on("accountsChanged", (newAccounts: string[]) => {
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

    coinbaseProvider.on("chainChanged", (newChainIdHex: string) => {
      const newChainId = parseInt(newChainIdHex, 16);
      window.dispatchEvent(
        new CustomEvent("wallet_chain_changed", {
          detail: { chainId: newChainId },
        }),
      );
    });

    coinbaseProvider.on(
      "disconnect",
      (error: { code: number; message: string }) => {
        window.dispatchEvent(
          new CustomEvent("wallet_disconnected", { detail: { error } }),
        );
      },
    );

    console.log("Connected to Coinbase Wallet:", {
      accounts,
      address,
      chainId,
    });

    return {
      accounts,
      signer,
      address,
      chainId,
      provider,
      disconnect: async () => {
        coinbaseProvider.removeAllListeners();
      },
    };
  } catch (error: Error) {
    throw new Error(error.message || "Failed to connect to Coinbase Wallet");
  }
};

export const coinbaseWallet: Wallet = {
  id: "coinbase",
  name: "Coinbase Wallet",
  icon: "https://avatars.githubusercontent.com/u/18060234?s=200&v=4",
  connector: connectCoinbaseWallet,
  description: "Connect to your Coinbase Wallet extension",
  installed: isCoinbaseWalletInstalled(),
  downloadLink: "https://www.coinbase.com/wallet/downloads",
};

export default coinbaseWallet;
