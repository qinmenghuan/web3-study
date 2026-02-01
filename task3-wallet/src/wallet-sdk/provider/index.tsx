import React, { createContext, useContext, useState, useEffect } from "react";
import type {
  WalletContextValue,
  WalletProviderProps,
  WalletState,
} from "../types";

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

  const value: WalletContextValue = {
    ...state,
    connect: async () => {},
    disconnect: async () => {},
    switchChain: async () => {},
    openModal: function (): void {},
  };

  useEffect(() => {
    if (autoConnect) {
      // value.connect();
    }
  }, []);

  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
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
