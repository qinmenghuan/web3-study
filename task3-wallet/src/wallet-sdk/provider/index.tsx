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
  });

  const [modalOpen, setModalOpen] = useState(false);
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
        await wallet.connector();
        setState({
          ...state,
          isConnected: true,
          address: wallet.address,
          chainID: wallet.chainID,
        });
      } catch (error) {
        setState({
          ...state,
          error: error as Error,
        });
      }
    },
    disconnect: async () => {},
    switchChain: async () => {},
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
      // value.connect();
    }
  }, []);

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
