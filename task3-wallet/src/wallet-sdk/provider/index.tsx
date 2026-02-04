import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from "react";
import type {
  WalletContextValue,
  WalletProviderProps,
  WalletState,
  Wallet,
} from "../types";
import WalletModal from "../components/WalletModal";
import { formatEther, ethers } from "ethers";

const WalletContext = createContext<WalletContextValue>({
  connect: async () => {},
  disconnect: async () => {},
  isConnected: false,
  isConnecting: false,
  address: "",
  chainID: 0,
  switchChain: async () => {},
  openModal: function (): void {},
  closeModal: function (): void {},
  ensName: null,
  error: null,
  chains: [],
  provider: undefined,
});

const WalletProvider: React.FC<WalletProviderProps> = ({
  children,
  chains,
  provider,
  autoConnect,
  wallets,
}) => {
  const [state, setState] = useState<WalletState>({
    address: "",
    chainID: -1,
    isConnecting: false,
    isConnected: false,
    ensName: "",
    error: null,
    chains,
    provider,
    balance: "",
  });

  // 弹框状态
  const [modalOpen, setModalOpen] = useState(false);

  // 钱包id到钱包信息的映射
  const walletsMap = useMemo(() => {
    return wallets.reduce(
      (map, wallet) => {
        map[wallet.id] = wallet;
        return map;
      },
      {} as Record<string, Wallet>,
    );
  }, [wallets]);

  const value: WalletContextValue = {
    ...state,
    connect: async (walletId: string) => {
      const wallet = walletsMap[walletId];
      if (!wallet) {
        throw new Error(`Wallet with id ${walletId} not found`);
      }
      try {
        // 调用对应wallet的connector方法进行连接
        const { address, chainId, provider } = await wallet.connector();

        // 连接后获取余额
        const balanceBN = await provider.getBalance(address);
        const balance = formatEther(balanceBN);
        console.log("Wallet connected:", { address, chainId });
        setState({
          ...state,
          isConnected: true,
          address: address,
          chainID: chainId,
          balance: balance,
        });

        // 关闭modal
        setModalOpen(false);
      } catch (error) {
        setState({
          ...state,
          error: error as Error,
        });
      }
    },
    disconnect: async () => {},
    switchChain: async (targetChainId: number) => {
      console.log("targetChainId111:" + targetChainId);
      console.log("targetChainId111:" + typeof targetChainId);
      if (!window.ethereum || !state.isConnected) {
        throw new Error("Wallet not connected");
      }

      // const chain = chains.find((item) => item.id === targetChainId);
      // if (!chain) {
      //   throw new Error("Unsupported chain");
      // }

      // 切换以太网的网络
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${targetChainId.toString(16)}` }],
        // params: [{ targetChainId }],
      });

      // 🔹 切换完成后重新创建 provider
      const newProvider = new ethers.BrowserProvider(window.ethereum);
      setState((prev) => ({
        ...prev,
        chainID: targetChainId,
        provider: newProvider,
      }));

      // 🔹 立即刷新余额
      if (state.address) {
        const balanceBN = await newProvider.getBalance(state.address);
        setState((prev) => ({
          ...prev,
          balance: ethers.formatEther(balanceBN),
        }));
      }
    },
    openModal: function (): void {
      setModalOpen(true);
    },
    closeModal: function (): void {
      console.log("modal close");
      setModalOpen(false);
    },
  };

  useEffect(() => {
    if (autoConnect) {
      // TODO: 暂时不自动连接
      // value.connect();
    }

    if (!window.ethereum) {
      console.log("window.ethereum 不存在");
      return;
    }

    // 判断状态
    if (!state.provider || !state.address) return;
    // 更新余额
    // const refreshBalance = async () => {
    //   try {
    //     const balanceBN = await state.provider.getBalance(state.address);
    //     setState((prev) => ({
    //       ...prev,
    //       balance: formatEther(balanceBN),
    //     }));
    //   } catch (err) {
    //     // ⭐ 网络切换瞬间的错误可以直接忽略
    //     if (err.code === "NETWORK_ERROR") return;
    //     throw err;
    //   }
    // };

    const refreshBalance = async (
      provider: ethers.BrowserProvider,
      address: string,
    ) => {
      if (!provider || !address) return;
      try {
        const balanceBN = await provider.getBalance(address);
        setState((prev) => ({
          ...prev,
          balance: ethers.formatEther(balanceBN),
        }));
      } catch (err: any) {
        if (err.code === "NETWORK_ERROR") return;
        console.error(err);
      }
    };

    // refreshBalance();

    // window.addEventListener("wallet_accounts_changed", refreshBalance);
    // window.addEventListener("wallet_chain_changed", refreshBalance);

    window.addEventListener("wallet_accounts_changed", async (e: any) => {
      const accounts = e.detail.accounts;
      if (accounts.length === 0) {
        setState((prev) => ({
          ...prev,
          isConnected: false,
          address: "",
          balance: "",
        }));
      } else {
        setState((prev) => ({ ...prev, address: accounts[0] }));
        await refreshBalance(state.provider!, accounts[0]);
      }
    });

    window.addEventListener("wallet_chain_changed", async (e: any) => {
      const newChainId = e.detail.chainId;
      const newProvider = new ethers.BrowserProvider(window.ethereum);
      setState((prev) => ({
        ...prev,
        chainID: newChainId,
        provider: newProvider,
      }));
      await refreshBalance(newProvider, state.address);
    });

    // 更新链的id
    const handleChainChanged = (chainIdHex: string) => {
      const newChainId = parseInt(chainIdHex, 16);
      console.log("handleChainChanged:", newChainId);
      const newProvider = new ethers.BrowserProvider(window.ethereum);
      setState((prev) => ({
        ...prev,
        chainID: newChainId,
        provider: newProvider,
      }));
    };

    window.ethereum.on("chainChanged", handleChainChanged);

    return () => {
      window.removeEventListener("wallet_accounts_changed", refreshBalance);
      window.removeEventListener("wallet_chain_changed", refreshBalance);

      // 移除监听
      window.ethereum.removeListener("chainChanged", handleChainChanged);
    };
  }, [state.provider, state.address, state.chainID]);

  return (
    <WalletContext.Provider value={value}>
      {children}
      <WalletModal
        isOpen={modalOpen}
        onClose={value.closeModal}
        wallets={wallets}
        onSelectWallet={value.connect}
        connecting={value.isConnecting}
        error={value.error}
      />
    </WalletContext.Provider>
  );
};

export const useWallet = (): WalletContextValue => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be within a walletProvider");
  }
  return context;
};

export default WalletProvider;
