import 'dotenv/config';
import { createPublicClient, http, parseEther, formatEther, createWalletClient } from "viem";
import { privateKeyToAccount } from 'viem/accounts'
import { sepolia } from "viem/chains";

const privateKey1 = process.env.PRIVATE_KEY1 as `0x${string}`
const privateKey2 = process.env.PRIVATE_KEY2 as `0x${string}`

console.log("privateKey1:", privateKey1);
console.log("privateKey2:", privateKey2);

if (!privateKey1 || !privateKey2) {
  throw new Error("Missing private key");
}

// 创建账号
const account1 = privateKeyToAccount(privateKey1)
const account2 = privateKeyToAccount(privateKey2)

const walletClient = createWalletClient({
  account: account1,
  chain: sepolia,
  transport:http(process.env.RPC_URL1),
})


const client = createPublicClient({
  chain: sepolia,
  transport: http(process.env.RPC_URL1)
})

async function main() {
  const address = '0x72d65507184DEb402C9cb416cBc44C5FA268C7fb' // 示例地址
  const balance = await client.getBalance({ address });
  console.log("address:", address);
  console.log("balance:", formatEther(balance));
  const address2 = '0x8Cb3096FC90d2dFF0C10376731009773b53A9E2a' // 示例地址
  // const balance2 = await client.getBalance({ address });
  // console.log("address:", address2);
  // console.log("balance:", formatEther(balance2));
  
  const request = await walletClient.prepareTransactionRequest({
    account: account1,
    to: address2,
    value: parseEther('0.001'),
  })

  const hash = await walletClient.sendTransaction(request);
  const afterBalance = await client.getBalance({ address });
  console.log("afterBalance:", formatEther(afterBalance));
  console.log("hash:", hash);

  // console.log("tx hash:", hash);
}

main().catch(console.error);
