import React from "react";
import { useState, useEffect } from "react";
import { useWallet } from "../provider";

interface ConnectButtonProps {
  chains: [];
  // selectedChain: {};
  // onChainChange?: () => void;
}

const ChainSelect = () => {
  const { chains, switchChain } = useWallet();

  console.log("chains:", chains);
  const change = (item) => {
    console.log("change item", item);
    // switchChain()
  };

  return (
    <div>
      <select onChange={change}>
        {chains.map((item) => (
          <option key={item.id}>{item.name}</option>
        ))}
      </select>
      <p>Chain Select</p>
    </div>
  );
};

export default ChainSelect;
