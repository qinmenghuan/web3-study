export interface WalletState {
  address: string | null;
  chainID: number | null;
  isConnecting: boolean;
  isConnected: boolean;
  ensName: string | null;
  error: Error | null;
  chains: Chain[];
  provider: any;
}

export interface WalletContextValue extends WalletState {
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  switchChain: () => Promise<void>;
  openModal: () => void;
  closeModal: () => void;
}

export type Chain = {
  id: number;
  name: string;
  rpcUrl: string;
  currency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  blockExplorer: {
    name: string;
    url: string;
  };
};

export type WalletProviderProps = {
  children: React.ReactNode;
  chains: Chain[];
  wallets: Wallet[];
  autoConnect?: boolean;
  provider?: any;
};

export interface Wallet {
  id: string;
  name: string;
  icon: string;
  connector: () => Promise<any>;
  description?: string;
  installed?: boolean;
  downloadLink: string;
}
