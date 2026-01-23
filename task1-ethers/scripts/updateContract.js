const ethers = require("ethers");
// 利用Alchemy的rpc节点连接以太坊测试网络
const ALCHEMY_SEPOLIA_URL =
  "https://eth-sepolia.g.alchemy.com/v2/It-dPWtmHqFiPOYIjf-zD";
const provider = new ethers.JsonRpcProvider(ALCHEMY_SEPOLIA_URL);

const privateKey =
  "adf12e06e253c809667dee9cd80ff432531bee0f10e1b7705112bdc0a738efea";
const wallet = new ethers.Wallet(privateKey, provider);

const abiWETH = [
  "function balanceOf(address) public view returns(uint)",
  "function deposit() public payable",
  "function transfer(address, uint) public returns (bool)",
  "function withdraw(uint) public",
];
// WETH合约地址（sepolia测试网）
const addressWETH = "0x7b79995e5f793a07bc00c21412e50ecae098e7f9";
const contractWETH = new ethers.Contract(addressWETH, abiWETH, wallet);

const main = async () => {
  const address = await wallet.getAddress();
  console.log(`读取余额：${address}`);
  const balanceWETH = await contractWETH.balanceOf(address);
  console.log(`存款钱WETH持仓: ${ethers.formatEther(balanceWETH)}\n`);

  const tx = await contractWETH.deposit({ value: ethers.parseEther("0.001") });
  await tx.wait();
  console.log("交易详情：", tx);
  const balanceWETH_deposit = await contractWETH.balanceOf(address);
  console.log(
    `存款之后，WETH持仓： ${ethers.formatEther(balanceWETH_deposit)}`
  );

  const tx2 = await contractWETH.transfer(
    "vitalik.eth",
    ethers.parseEther("0.001")
  );
  await tx2.wait();
  const balanceWETH_transfer = await contractWETH.balanceOf(address);
  console.log(`转账后WETH持仓： ${ethers.formatEther(balanceWETH_transfer)}`);
};

main();
