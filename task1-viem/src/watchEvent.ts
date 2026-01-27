import 'dotenv/config';
import { createPublicClient, http, formatEther, erc20Abi  } from "viem";
import { sepolia } from "viem/chains";

const publicClient = createPublicClient({
  chain: sepolia,
  transport: http(process.env.RPC_URL1)
});

// 1000000000000000

const unwatch = publicClient.watchContractEvent({
  address: "0x0239fe4767f28E29f750701588153e6D06c8CEaa",
  abi: erc20Abi,
  eventName: "Transfer",
  onLogs: (logs) => {
    for (const log of logs) {
      const { from, to, value } = log.args;
      console.log('Transfer event:')
      console.log('from:', from)
      console.log('to:', to)
      console.log('value:', value.toString())
    }
  },
});

unwatch()