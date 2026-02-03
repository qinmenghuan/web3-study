import React from "react";
import { useState, useEffect } from "react";
import { useWallet } from "../provider";

interface ConnectButtonProps {
  label?: string;
  showBalance?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;

  onConnect?: () => void;
  onDisconnect?: () => void;
  onChainChange?: (chainId: number) => void;
  onBalanceChange?: (balance: string) => void;
}

const ConnectButton = ({
  label = "Connect Wallet",
  showBalance = false,
  size = "md",
  className = "",
  onConnect,
  onDisconnect,
  onChainChange,
  onBalanceChange,
}: ConnectButtonProps) => {
  const {
    isConnected,
    address,
    chainID,
    balance,
    connect,
    disconnect,
    ensName,
    error,
    openModal,
    closeModal,
  } = useWallet();

  // 展示余额
  // const [balance, setBalance] = useState<string>("");

  // 样式
  const sizeClasses = {
    sm: "px-3 py-1 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-5 py-3 text-lg",
  };

  const handleConnect = async () => {
    try {
      await connect("injected");
      if (onConnect) onConnect();
    } catch (err) {
      console.error("Connect wallet failed:", err);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
      if (onDisconnect) onDisconnect();
    } catch (err) {
      console.error("Disconnect wallet failed:", err);
    }
  };

  if (!isConnected) {
    return (
      <button
        className={`bg-blue-500 text-white font-bold py-2 px-4 rounded ${sizeClasses[size]} ${className}`}
        onClick={openModal}
      >
        {label}
      </button>
    );
  }

  return (
    <div>
      <p>Connected to wallet: {address}</p>
      <p>chainID: {chainID}</p>
      <p>balance: {balance}</p>
      <button
        className={`bg-blue-500 text-white font-bold py-2 px-4 rounded ${sizeClasses[size]} ${className}`}
        onClick={handleDisconnect}
      >
        {label}
      </button>
    </div>
  );
};

export default ConnectButton;
