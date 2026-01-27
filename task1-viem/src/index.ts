import { createPublicClient, http } from "viem";
import { mainnet } from "viem/chains";
import { formatEther, parseEther } from 'viem'

const client = createPublicClient({
  chain: mainnet,
  // transport: http('https://mainnet.infura.io/v3/4b0a01cb618e4f139038fdf4306d6eb9')
  transport: http('https://eth-mainnet.g.alchemy.com/v2/NxyO2bjE2e6Y7kwCbXCny')
})

async function main() {
  const address = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2' // 示例地址
  const balance = await client.getBalance({ address });  
  console.log("address:", address);
  console.log("balance:", balance);
}

main().catch(console.error);
