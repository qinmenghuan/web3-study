"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { useRouter } from "next/navigation";
import { formatNumber } from "@/lib/utils";
import { NetworkChecker } from "@/components/NetworkChecker";
import { Loader2, Droplets, Plus, TrendingUp } from "lucide-react";

// 定义流动性池数据结构接口，基于API返回格式
interface PoolData {
  pool: string; // 池子合约地址
  token0: string; // 第一个代币地址
  token1: string; // 第二个代币地址
  token0Symbol: string; // 第一个代币符号
  token1Symbol: string; // 第二个代币符号
  token0Decimals: number; // 第一个代币精度
  token1Decimals: number; // 第二个代币精度
  fee: number; // 手续费率（基点）
  feePercent: string; // 手续费百分比显示
  liquidity: string; // 流动性数量（原始值）
  sqrtPriceX96: string; // 平方根价格（Uniswap V3格式）
  tick: number; // 当前价格点
  tvl: string; // 总锁定价值（原始值）
  tvlUSD: number; // 总锁定价值（美元）
  volume24h: string; // 24小时交易量
  feesUSD: number; // 手续费收入（美元）
  pair: string; // 交易对名称
  index: number; // 索引
  token0Balance: string; // 代币0余额
  token1Balance: string; // 代币1余额
}

export default function PoolsPage() {
  // 使用wagmi获取钱包连接状态
  const { isConnected } = useAccount();
  // 使用Next.js路由进行页面导航
  const router = useRouter();

  // 状态管理：池子数据列表
  const [pools, setPools] = useState<PoolData[]>([]);
  // 状态管理：数据加载状态
  const [loading, setLoading] = useState(true);
  // 状态管理：错误信息
  const [error, setError] = useState<string | null>(null);
  // 状态管理：总统计信息
  const [totalStats, setTotalStats] = useState({
    totalPools: 0, // 总池子数量
    totalTVL: 0, // 总锁定价值
    totalVolume24h: 0, // 总24小时交易量（占位符）
    totalFeesGenerated: 0, // 总手续费收入（占位符）
  });

  // 获取池子数据的异步函数
  const fetchPools = async () => {
    setLoading(true); // 开始加载
    setError(null); // 清除之前的错误
    try {
      // 发送API请求获取池子数据
      const response = await fetch("/api/pools");
      if (!response.ok) {
        throw new Error("Failed to fetch pools");
      }
      const data = await response.json();

      // 更新池子数据状态
      setPools(data.data);

      // 计算并更新总统计信息
      setTotalStats({
        totalPools: data.pagination?.total || 0, // 总池子数量
        totalTVL: data.data.reduce(
          (acc: number, pool: PoolData) => acc + pool.tvlUSD, // 计算总TVL
          0,
        ),
        totalVolume24h: 0, // 占位符：实际需要从API获取
        totalFeesGenerated: 0, // 占位符：实际需要从API获取
      });
    } catch (err) {
      console.error("Error loading pools:", err);
      // 设置错误信息
      setError(err instanceof Error ? err.message : "加载失败");
    } finally {
      setLoading(false); // 加载完成
    }
  };

  // useEffect钩子：组件挂载时获取池子数据
  useEffect(() => {
    fetchPools();
  }, []); // 空依赖数组表示只在组件挂载时执行一次

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* 网络检查组件：确保用户在正确的网络上 */}
      <NetworkChecker>
        {/* 页面标题和操作按钮区域 */}
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Pool</h1>
          <div className="flex items-center space-x-2">
            {/* 添加流动性按钮 */}
            <button
              onClick={() => router.push("/liquidity")}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
            >
              Add Pool
            </button>
          </div>
        </div>

        {/* 池子数据表格区域 */}
        <div className="">
          {/* 状态1：钱包未连接 */}
          {!isConnected ? (
            <div className="p-16 text-center">
              <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Droplets className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Please connect wallet
              </h3>
              <p className="text-gray-500">Connect wallet to view pool data</p>
            </div>
          ) : /* 状态2：加载出错 */
          error ? (
            <div className="p-12 text-center">
              <div className="text-red-500 text-lg font-medium mb-2">
                Loading Failed
              </div>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={fetchPools}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Reload
              </button>
            </div>
          ) : /* 状态3：加载中 */
          loading ? (
            <div className="p-24 text-center">
              <Loader2 className="h-8 w-8 text-blue-600 mx-auto mb-4 animate-spin" />
              <p className="text-gray-500">Loading pools...</p>
            </div>
          ) : /* 状态4：没有池子数据 */
          pools.length === 0 ? (
            <div className="p-16 text-center">
              <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Droplets className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No pools found
              </h3>
              <p className="text-gray-500 mb-6">
                Be the first to provide liquidity!
              </p>
              <button
                onClick={() => router.push("/liquidity")}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors inline-flex items-center gap-2 shadow-sm"
              >
                <Plus className="h-4 w-4" />
                Add Pool
              </button>
            </div>
          ) : (
            /* 状态5：正常显示池子数据 */
            <div className="overflow-x-auto">
              {/* 池子数据表格 */}
              <table className="w-full">
                <thead className="bg-white border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Token
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fee Tier
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      TVL
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Volume 24h
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      APR
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Liquidity
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-50">
                  {/* 遍历池子数据生成表格行 */}
                  {pools.map((pool) => (
                    <tr
                      key={pool.pool} // 使用池子地址作为唯一键
                      onClick={() => router.push(`/pools/${pool.pool}`)} // 点击行跳转到池子详情页
                      className="hover:bg-gray-50/80 transition-colors group cursor-pointer"
                    >
                      {/* 代币对信息单元格 */}
                      <td className="px-6 py-6 whitespace-nowrap">
                        <div className="flex items-center">
                          {/* 代币图标显示区域 */}
                          <div className="flex -space-x-2 mr-3">
                            {/* 第一个代币图标 */}
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center border-2 border-white shadow-sm text-white text-xs font-bold z-10">
                              {pool.token0Symbol.charAt(0)}
                            </div>
                            {/* 第二个代币图标 */}
                            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-teal-500 rounded-full flex items-center justify-center border-2 border-white shadow-sm text-white text-xs font-bold">
                              {pool.token1Symbol.charAt(0)}
                            </div>
                          </div>
                          {/* 代币符号显示 */}
                          <div>
                            <div className="text-sm font-semibold text-gray-900">
                              {pool.token0Symbol} / {pool.token1Symbol}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 手续费等级单元格 */}
                      <td className="px-6 py-6 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600">
                          {pool.feePercent}
                        </span>
                      </td>

                      {/* 总锁定价值单元格 */}
                      <td className="px-6 py-6 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {pool.tvlUSD >= 1000
                            ? `$${formatNumber(pool.tvlUSD)}`
                            : `$${pool.tvlUSD.toFixed(2)}`}
                        </div>
                      </td>

                      {/* 24小时交易量单元格 */}
                      <td className="px-6 py-6 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {pool.volume24h}
                        </div>
                      </td>

                      {/* 年化收益率单元格（当前为占位符） */}
                      <td className="px-6 py-6 whitespace-nowrap">
                        <div className="text-sm text-green-600 flex items-center">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          --% {/* 实际需要计算或从API获取 */}
                        </div>
                      </td>

                      {/* 流动性数量单元格 */}
                      <td className="px-6 py-6 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-medium">
                          {formatNumber(parseFloat(pool.liquidity))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* 简单分页UI（当前为占位符） */}
              <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-2">
                <button
                  className="p-2 rounded-lg hover:bg-gray-100 text-gray-500 disabled:opacity-50"
                  disabled
                >
                  &lt; {/* 上一页按钮 */}
                </button>
                <button className="px-3 py-1 rounded-lg bg-blue-50 text-blue-600 font-medium text-sm">
                  1 {/* 当前页码 */}
                </button>
                <button className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
                  &gt; {/* 下一页按钮 */}
                </button>
                <span className="text-sm text-gray-500 ml-2">10 / page</span>{" "}
                {/* 每页显示数量 */}
              </div>
            </div>
          )}
        </div>
      </NetworkChecker>
    </div>
  );
}
