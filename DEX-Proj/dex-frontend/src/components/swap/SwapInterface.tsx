"use client";

// React核心库
import { useState, useEffect, useCallback } from "react";

// 图标库
import {
  ArrowUpDown,
  Settings,
  ChevronDown,
  CheckCircle,
  Clock,
} from "lucide-react";

// Wagmi - Web3钱包连接库
import { useAccount, useBalance } from "wagmi";

// viem - 以太坊工具库
import { parseUnits } from "viem";

// 本地导入
import { TOKENS } from "@/lib/constants"; // 代币常量配置
import {
  cn,
  formatTokenAmount,
  parseInputAmount,
  shortenAddress,
} from "@/lib/utils"; // 工具函数
import { useSwap } from "@/hooks/useSwap"; // 自定义swap hook
import { usePools } from "@/hooks/usePools"; // 自定义流动性池hook

// 代币类型定义
type Token = {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
};

export default function SwapInterface() {
  // ============ 钱包状态 ============
  const { address, isConnected } = useAccount();

  // ============ 代币状态 ============
  const [fromToken, setFromToken] = useState<Token>(TOKENS.MNTokenA); // 源代币
  const [toToken, setToToken] = useState<Token>(TOKENS.MNTokenB); // 目标代币
  const [fromAmount, setFromAmount] = useState(""); // 源代币数量
  const [toAmount, setToAmount] = useState(""); // 目标代币数量

  // ============ 交易设置 ============
  const [slippage, setSlippage] = useState(0.5); // 滑点容忍度百分比
  const [showSettings, setShowSettings] = useState(false); // 是否显示设置面板

  // ============ 交易状态 ============
  const [needsApproval, setNeedsApproval] = useState(false); // 是否需要授权   TODO: 初始值为false，后续根据授权状态更新
  const [isQuoting, setIsQuoting] = useState(false); // 是否正在获取报价
  const [isSimulated, setIsSimulated] = useState(false); // 是否是模拟报价
  const [quoteError, setQuoteError] = useState<string | null>(null); // 报价错误信息

  // ============ 自定义Hooks ============
  // 使用swap hook，获取swap相关功能
  const {
    executeSwap, // 执行交换函数
    approveToken, // 授权代币函数
    getQuote, // 获取报价函数
    useTokenAllowance, // 获取授权额度hook
    isPending, // 交易是否等待钱包确认
    isConfirming, // 交易是否正在确认中
    isConfirmed, // 交易是否已确认
    hash, // 交易哈希
  } = useSwap();

  // 使用流动性池hook，获取池子数据
  const { pools, loading: poolsLoading, error: poolsError } = usePools();

  // 调试：打印池子数据
  useEffect(() => {
    // 开发时可取消注释查看池子数据
    // console.log('pools', pools)
  }, [pools]);

  // ============ 获取代币余额 ============
  // 获取源代币余额
  const { data: fromTokenBalance } = useBalance({
    address: address,
    token: fromToken.address as `0x${string}`, // 类型断言为wagmi期望的类型
    query: {
      enabled: Boolean(address && isConnected), // 只有连接钱包时才查询
    },
  });

  // 获取目标代币余额
  const { data: toTokenBalance } = useBalance({
    address: address,
    token: toToken.address as `0x${string}`,
    query: {
      enabled: Boolean(address && isConnected),
    },
  });

  // ============ 检查授权状态 ============
  // 获取当前代币授权额度
  const { data: allowance, refetch: refetchAllowance } = useTokenAllowance(
    fromToken.address,
  );

  // ============ 工具变量 ============
  // 代币列表（从常量转换）
  const tokenList = Object.values(TOKENS);

  // ============ 副作用与逻辑 ============
  // 检查是否需要授权：当授权额度或输入金额变化时
  useEffect(() => {
    console.log("Checking allowance:", {
      allowance,
      fromAmount,
    });
    if (allowance && fromAmount) {
      try {
        // 将输入金额转换为wei单位（最小单位）
        const amountWei = parseUnits(fromAmount, fromToken.decimals);
        console.log("Checking allowance:", {
          allowance,
          amountWei: amountWei.toString(),
        });
        // 如果授权额度小于所需金额，则需要授权
        setNeedsApproval(allowance < amountWei);
      } catch {
        // 解析失败时不需授权
        setNeedsApproval(false);
      }
    } else {
      setNeedsApproval(false);
    }
  }, [allowance, fromAmount, fromToken.decimals]);

  // 获取报价函数（使用useCallback缓存，避免重复创建）
  const updateQuote = useCallback(async () => {
    // 如果输入为空或为0，清除报价
    if (!fromAmount || parseFloat(fromAmount) === 0) {
      setToAmount("");
      setQuoteError(null);
      return;
    }

    setIsQuoting(true);
    setQuoteError(null);
    try {
      // 调用getQuote获取报价
      const quote = await getQuote({
        tokenIn: fromToken.address,
        tokenOut: toToken.address,
        amountIn: fromAmount,
        slippage,
      });

      if (quote) {
        // 设置报价结果
        setToAmount(quote.amountOut);
        setIsSimulated(quote.simulated || false);
        setQuoteError(null);
      } else {
        setToAmount("");
        setQuoteError(null);
      }
    } catch (error) {
      console.error("Quote failed:", error);
      setToAmount("");
      // 提取错误消息，优先使用Error对象的消息
      const errorMessage =
        error instanceof Error ? error.message : "获取报价失败";
      setQuoteError(errorMessage);
    } finally {
      setIsQuoting(false);
    }
  }, [fromAmount, fromToken.address, toToken.address, slippage, getQuote]);

  // 当输入参数变化时获取报价（带防抖）
  useEffect(() => {
    console.log("Checking allowance1111:", {
      allowance,
      fromAmount,
    });
    // 如果输入为空，清除报价
    if (!fromAmount || parseFloat(fromAmount) === 0) {
      setToAmount("");
      setQuoteError(null);
      return;
    }

    // 设置500ms防抖，避免频繁请求
    const timer = setTimeout(() => {
      updateQuote();
    }, 500);

    // 清理函数：组件卸载或依赖变化时清除定时器
    return () => clearTimeout(timer);
  }, [fromAmount, fromToken.address, toToken.address, slippage, updateQuote]);

  // ============ 事件处理函数 ============
  // 处理源代币数量变化
  const handleFromAmountChange = (value: string) => {
    console.log("Input changed:", value);
    // 使用工具函数解析输入金额（防止无效输入）
    const parsed = parseInputAmount(value);
    setFromAmount(parsed);
  };

  // 交换源代币和目标代币
  const handleSwapTokens = () => {
    // 交换代币
    setFromToken(toToken);
    setToToken(fromToken);
    // 交换金额
    setFromAmount(toAmount);
    setToAmount(fromAmount);
    // 清除错误
    setQuoteError(null);
  };

  // 处理授权操作
  const handleApprove = async () => {
    if (!fromAmount) return;

    try {
      await approveToken(fromToken.address, fromAmount);
    } catch (error) {
      console.error("Approval failed:", error);
    }
  };

  // 处理交换操作
  const handleSwap = async () => {
    // 验证输入
    if (!fromAmount || !toAmount || !isConnected) return;

    try {
      await executeSwap({
        tokenIn: fromToken.address,
        tokenOut: toToken.address,
        amountIn: fromAmount,
        slippage,
      });
    } catch (error) {
      console.error("Swap failed:", error);
    }
  };

  // 使用最大余额
  const handleMaxAmount = () => {
    if (fromTokenBalance) {
      setFromAmount(fromTokenBalance.formatted);
    }
  };

  // ============ 交易完成后的处理 ============
  // 当交易确认后，刷新授权状态
  useEffect(() => {
    if (isConfirmed) {
      refetchAllowance();
    }
  }, [isConfirmed, refetchAllowance]);

  // ============ 子组件：代币选择器 ============
  const TokenSelector = ({
    selectedToken,
    onSelect,
    label,
  }: {
    selectedToken: Token;
    onSelect: (token: Token) => void;
    label: string;
  }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <div className="relative">
        {/* 代币选择按钮 */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground px-3 py-2 rounded-lg transition-colors"
          type="button" // 明确指定按钮类型
        >
          {/* 代币图标（使用渐变背景） */}
          <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">
              {selectedToken.symbol[0]}
            </span>
          </div>
          {/* 代币符号 */}
          <span className="font-medium">{selectedToken.symbol}</span>
          {/* 下拉箭头 */}
          <ChevronDown className="w-4 h-4" />
        </button>

        {/* 下拉菜单 */}
        {isOpen && (
          <div className="absolute top-full mt-1 w-48 bg-background border border-border rounded-lg shadow-lg z-50">
            <div className="p-2">
              {/* 下拉菜单标题 */}
              <div className="text-sm text-muted-foreground px-2 py-1">
                {label}
              </div>
              {/* 代币列表 */}
              {tokenList.map((token) => (
                <button
                  key={token.address}
                  onClick={() => {
                    onSelect(token);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center space-x-3 px-2 py-2 rounded hover:bg-accent transition-colors",
                    selectedToken.address === token.address && "bg-accent",
                  )}
                  type="button"
                >
                  {/* 代币图标 */}
                  <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      {token.symbol[0]}
                    </span>
                  </div>
                  {/* 代币信息 */}
                  <div className="text-left">
                    <div className="font-medium text-foreground">
                      {token.symbol}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {token.name}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  // ============ 子组件：交易状态显示 ============
  const TransactionStatus = () => {
    // 没有交易哈希时不显示
    if (!hash) return null;

    return (
      <div className="mb-6 p-4 bg-primary/10 border border-primary/20 rounded-lg">
        <div className="flex items-center space-x-2">
          {/* 等待钱包确认状态 */}
          {isPending && (
            <>
              <Clock className="w-5 h-5 text-primary animate-spin" />
              <span className="text-primary">等待钱包确认...</span>
            </>
          )}
          {/* 交易确认中状态 */}
          {isConfirming && (
            <>
              <Clock className="w-5 h-5 text-primary animate-spin" />
              <span className="text-primary">交易确认中...</span>
            </>
          )}
          {/* 交易成功状态 */}
          {isConfirmed && (
            <>
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="text-green-700 dark:text-green-300">
                交易成功！
              </span>
            </>
          )}
        </div>
        {/* 显示交易哈希 */}
        <div className="mt-2 text-sm text-primary">
          交易哈希: {shortenAddress(hash)}
        </div>
      </div>
    );
  };

  // ============ 渲染组件 ============
  return (
    <div className="w-full max-w-md mx-auto">
      {/* 主卡片容器 */}
      <div className="bg-card border border-border rounded-2xl shadow-lg p-4">
        {/* Header - 标题和设置按钮 */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-card-foreground">交换</h2>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
            type="button"
            aria-label={showSettings ? "隐藏设置" : "显示设置"}
          >
            <Settings className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* 交易状态显示 */}
        <TransactionStatus />

        {/* 钱包连接状态显示 */}
        {isConnected && address && (
          <div className="mb-4 p-3 bg-primary/10 rounded-lg">
            <div className="text-sm text-primary">
              已连接: {shortenAddress(address)}
            </div>
          </div>
        )}

        {/* 设置面板 */}
        {showSettings && (
          <div className="mb-6 p-4 bg-muted rounded-lg">
            <div className="text-sm font-medium mb-2 text-muted-foreground">
              滑点容忍度
            </div>
            <div className="flex space-x-2">
              {/* 滑点预设按钮 */}
              {[0.1, 0.5, 1.0].map((value) => (
                <button
                  key={value}
                  onClick={() => setSlippage(value)}
                  className={cn(
                    "px-3 py-1 rounded text-sm transition-colors",
                    slippage === value
                      ? "bg-primary text-primary-foreground"
                      : "bg-background border border-border hover:bg-accent",
                  )}
                  type="button"
                >
                  {value}%
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 源代币输入区域 */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">从</span>
            <div className="flex items-center space-x-2">
              {/* 显示余额 */}
              <span className="text-sm text-muted-foreground">
                余额:{" "}
                {fromTokenBalance
                  ? formatTokenAmount(fromTokenBalance.formatted)
                  : "0"}
              </span>
              {/* 最大按钮（当余额大于0时显示） */}
              {fromTokenBalance &&
                parseFloat(fromTokenBalance.formatted) > 0 && (
                  <button
                    onClick={handleMaxAmount}
                    className="text-xs text-primary hover:text-primary/80 font-medium"
                    type="button"
                  >
                    最大
                  </button>
                )}
            </div>
          </div>
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            {/* 金额输入框 */}
            <input
              type="text"
              value={fromAmount}
              onChange={(e) => handleFromAmountChange(e.target.value)}
              placeholder="0"
              className="text-2xl font-medium bg-transparent outline-none flex-1 text-foreground placeholder:text-muted-foreground"
              inputMode="decimal" // 移动端显示数字键盘
            />
            {/* 代币选择器 */}
            <TokenSelector
              selectedToken={fromToken}
              onSelect={setFromToken}
              label="选择代币"
            />
          </div>
        </div>

        {/* 交换箭头按钮 */}
        <div className="flex justify-center mb-4">
          <button
            onClick={handleSwapTokens}
            className="p-2 bg-muted hover:bg-accent border border-border rounded-lg transition-colors"
            type="button"
            aria-label="交换代币"
          >
            <ArrowUpDown className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* 目标代币显示区域 */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">到</span>
            {/* 显示目标代币余额 */}
            <span className="text-sm text-muted-foreground">
              余额:{" "}
              {toTokenBalance
                ? formatTokenAmount(toTokenBalance.formatted)
                : "0"}
            </span>
          </div>
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            {/* 金额显示区域 */}
            <div className="text-2xl font-medium text-foreground flex-1">
              {isQuoting ? (
                // 加载中状态
                <div className="flex items-center">
                  <Clock className="w-4 h-4 animate-spin mr-2 text-muted-foreground" />
                  <span className="text-muted-foreground">获取报价中...</span>
                </div>
              ) : quoteError ? (
                // 错误状态
                <div className="text-sm text-red-600 dark:text-red-400">
                  {quoteError}
                </div>
              ) : (
                // 正常显示报价
                toAmount || "0"
              )}
            </div>
            {/* 目标代币选择器 */}
            <TokenSelector
              selectedToken={toToken}
              onSelect={setToToken}
              label="选择代币"
            />
          </div>
          {/* 报价错误提示 */}
          {quoteError && (
            <div className="mt-2 text-xs text-red-600 dark:text-red-400">
              ⚠️ {quoteError}
            </div>
          )}
          {/* 模拟报价提示（已注释） */}
          {/* {isSimulated && (
            <div className="mt-2 text-xs text-yellow-600 dark:text-yellow-400">
              ⚠️ 模拟报价，实际价格可能有差异
            </div>
          )} */}
        </div>

        {/* 操作按钮区域 */}
        <div className="space-y-3">
          {/* 未连接钱包状态 */}
          {!isConnected ? (
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-muted-foreground">请先连接钱包</p>
            </div>
          ) : needsApproval ? (
            /* 需要授权按钮 */
            <button
              onClick={handleApprove}
              disabled={isPending || isConfirming || !fromAmount}
              className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition-colors"
              type="button"
            >
              {isPending || isConfirming
                ? "处理中..."
                : `授权 ${fromToken.symbol}`}
            </button>
          ) : (
            /* 交换按钮 */
            <button
              onClick={handleSwap}
              disabled={
                isPending ||
                isConfirming ||
                !fromAmount ||
                !toAmount ||
                parseFloat(fromAmount) === 0
              }
              className="w-full bg-primary hover:bg-primary/90 disabled:bg-muted disabled:cursor-not-allowed text-primary-foreground font-medium py-3 px-4 rounded-lg transition-colors"
              type="button"
            >
              {isPending || isConfirming ? "交换中..." : "交换"}
            </button>
          )}

          {/* 汇率信息显示 */}
          {fromAmount &&
            toAmount &&
            parseFloat(fromAmount) > 0 &&
            parseFloat(toAmount) > 0 && (
              <div className="text-xs text-muted-foreground text-center">
                1 {fromToken.symbol} ≈{" "}
                {(parseFloat(toAmount) / parseFloat(fromAmount)).toFixed(6)}{" "}
                {toToken.symbol}
              </div>
            )}
        </div>
      </div>
    </div>
  );
}

// 注意：这是一个功能完整的DEX交换界面组件，包含以下主要功能：
// 1. 钱包连接管理
// 2. 代币选择和余额显示
// 3. 实时报价获取（带防抖）
// 4. 代币授权管理
// 5. 交易执行和状态跟踪
// 6. 滑点设置
// 7. 响应式UI和状态反馈

// 使用此组件需要：
// 1. 正确的Next.js 14+ App Router配置
// 2. Wagmi和viem配置
// 3. 对应的hooks实现（useSwap, usePools）
// 4. Tailwind CSS样式系统
