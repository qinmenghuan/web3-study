import React from "react";
import { useState, useEffect } from "react";
import { useWallet } from "../provider";

interface ConnectButtonProps {
  chains: [];
  // selectedChain: {};
  // onChainChange?: () => void;
}

const NetworkSelect: React.FC = () => {
  const { chains, switchChain, isConnected, chainID } = useWallet();

  console.log("chains:", chains);
  console.log("isConnected:", isConnected);

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const targetChainId = Number(e.target.value);
    console.log("change item", e.target.value);
    if (targetChainId === chainID) return;
    try {
      await switchChain(targetChainId);
    } catch (err) {
      console.error("switch chain fail:", err);
    }
  };

  return (
    <div>
      <select onChange={handleChange} disabled={!isConnected} value={chainID}>
        {chains.map((item) => (
          <option key={item.id} value={item.id}>
            {item.name}
          </option>
        ))}
      </select>
      <p>Chain Select</p>
    </div>
  );
};

export default NetworkSelect;
