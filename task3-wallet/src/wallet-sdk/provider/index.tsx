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
      if (!window.ethereum || !state.isConnected) {
        throw new Error("Wallet not connected");
      }

      const chain = chains.find((item) => item.id === targetChainId);
      if (!chain) {
        throw new Error("Unsupported chain");
      }

      // 切换以太网的网络
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${targetChainId.toString(16)}` }],
      });
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

    if (!window.ethereum) return;

    // 判断状态
    if (!state.provider || !state.address) return;
    // 更新余额
    const refreshBalance = async () => {
      try {
        const balanceBN = await state.provider.getBalance(state.address);
        setState((prev) => ({
          ...prev,
          balance: formatEther(balanceBN),
        }));
      } catch (err) {
        // ⭐ 网络切换瞬间的错误可以直接忽略
        if (err.code === "NETWORK_ERROR") return;
        throw err;
      }
    };

    refreshBalance();

    window.addEventListener("wallet_accounts_changed", refreshBalance);
    window.addEventListener("wallet_chain_changed", refreshBalance);

    // 更新链的id
    const handleChainChanged = (chainIdHex: string) => {
      const newChainId = parseInt(chainIdHex, 16);
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
