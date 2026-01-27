import 'dotenv/config';
import { createPublicClient, http, formatEther, erc20Abi  } from "viem";
import { sepolia } from "viem/chains";

const client = createPublicClient({
  chain: sepolia,
  transport: http(process.env.RPC_URL1)
});

async function getBalance() {
  const balance = await client.readContract({
    address: "0xE896553c48F180a2763D75C2508b4943a20Fe97d",
    abi: erc20Abi,
    functionName: "balanceOf",
    args: ["0x72d65507184DEb402C9cb416cBc44C5FA268C7fb"]
  });
  console.log('Raw balance (bigint):', formatEther(balance))
}

getBalance();