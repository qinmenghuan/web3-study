import React from "react";
import type { Wallet } from "../types";

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallets: Wallet[];
  onSelectWallet: (walletId: string) => void;
  connecting: boolean;
  error: Error | null;
}

const WalletModal = ({
  isOpen,
  onClose,
  wallets,
  onSelectWallet,
  connecting,
  error,
}: WalletModalProps) => {
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 bg-[rgba(0,0,0,0.5)] flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div className="bg-white rounded-lg p-6 w-96">
        <h2 className="text-xl font-semibold mb-4">Select Wallet</h2>
        {error && <div className="text-red-500 mb-4">{error.message}</div>}
        <ul className="space-y-4">
          {wallets.map((wallet) => (
            <li key={wallet.id}>
              <button
                className="w-full bg-gray-100 hover:bg-gray-200 p-3 rounded-lg text-left"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectWallet(wallet.id);
                }}
              >
                {wallet.name}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default WalletModal;
