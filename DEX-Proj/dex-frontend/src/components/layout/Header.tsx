"use client"; // 表示这是一个客户端组件（Next.js 15+ 中的指令）

import Link from "next/link"; // Next.js 的客户端链接组件
import { useState } from "react"; // React 的状态钩子
import { Menu, X } from "lucide-react"; // 汉堡菜单图标和关闭图标
import { ConnectButton } from "@rainbow-me/rainbowkit"; // RainbowKit 钱包连接按钮组件
import { cn } from "@/lib/utils"; // 工具函数，用于合并 CSS 类名
import { ThemeToggle } from "./ThemeToggle"; // 主题切换组件（当前被注释）

// 导航菜单配置数组
const navigation = [
  { name: "交换", href: "/" }, // 代币交换页面
  { name: "流动性池", href: "/pools" }, // 流动性池管理页面
  { name: "头寸", href: "/positions" }, // 用户持仓页面
  { name: "发射", href: "/release" }, // 代币发行页面
];

export default function Header() {
  // 控制移动端菜单展开/收起的状态
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* 固定顶部导航栏 */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border shadow-sm bg-background/80 backdrop-blur-sm">
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            {/* Logo 区域 */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <span className="text-xl font-bold text-foreground">
                  MetaNodeSwap
                </span>
              </Link>
            </div>

            {/* 桌面端导航菜单（在中等屏幕及以上显示） */}
            <div className="hidden md:flex md:space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-muted-foreground hover:text-foreground px-3 py-2 text-sm font-medium transition-colors"
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* 钱包连接按钮和主题切换区域 */}
            <div className="flex items-center space-x-4">
              {/* 主题切换组件（当前被注释） */}
              {/* <ThemeToggle /> */}

              {/* 桌面端钱包连接按钮（在中等屏幕及以上显示） */}
              <div className="hidden md:block">
                <ConnectButton.Custom>
                  {/* RainbowKit 提供的渲染函数，包含钱包连接状态和操作方法 */}
                  {({
                    account, // 账户信息
                    chain, // 当前链信息
                    openAccountModal, // 打开账户详情弹窗的函数
                    openChainModal, // 打开网络切换弹窗的函数
                    openConnectModal, // 打开连接钱包弹窗的函数
                    authenticationStatus, // 认证状态
                    mounted, // 组件是否已挂载
                  }) => {
                    // 确保组件在客户端正确挂载后才渲染
                    const ready = mounted && authenticationStatus !== "loading";
                    // 判断钱包是否已连接
                    const connected =
                      ready &&
                      account &&
                      chain &&
                      (!authenticationStatus ||
                        authenticationStatus === "authenticated");

                    return (
                      <div
                        // 如果组件未准备好，隐藏并禁用交互
                        {...(!ready && {
                          "aria-hidden": true,
                          style: {
                            opacity: 0,
                            pointerEvents: "none",
                            userSelect: "none",
                          },
                        })}
                      >
                        {/* 根据连接状态显示不同UI */}
                        {(() => {
                          // 1. 钱包未连接状态
                          if (!connected) {
                            return (
                              <button
                                onClick={openConnectModal} // 点击打开钱包连接弹窗
                                type="button"
                                className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                              >
                                连接钱包
                              </button>
                            );
                          }

                          // 2. 当前网络不受支持状态
                          if (chain.unsupported) {
                            return (
                              <button
                                onClick={openChainModal} // 点击打开网络切换弹窗
                                type="button"
                                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                              >
                                网络错误
                              </button>
                            );
                          }

                          // 3. 钱包已连接状态
                          return (
                            <div className="flex items-center space-x-2">
                              {/* 网络切换按钮 */}
                              <button
                                onClick={openChainModal}
                                className="bg-secondary hover:bg-secondary/80 text-secondary-foreground px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
                                type="button"
                              >
                                {/* 显示当前网络图标 */}
                                {chain.hasIcon && (
                                  <div
                                    style={{
                                      background: chain.iconBackground, // 网络图标背景色
                                      width: 16,
                                      height: 16,
                                      borderRadius: 999,
                                      overflow: "hidden",
                                      marginRight: 4,
                                    }}
                                  >
                                    {/* 如果有网络图标URL，显示图标 */}
                                    {chain.iconUrl && (
                                      <img
                                        alt={chain.name ?? "Chain icon"}
                                        src={chain.iconUrl}
                                        style={{ width: 16, height: 16 }}
                                      />
                                    )}
                                  </div>
                                )}
                                <span>{chain.name}</span> {/* 显示网络名称 */}
                              </button>

                              {/* 账户信息按钮 */}
                              <button
                                onClick={openAccountModal} // 点击打开账户详情弹窗
                                type="button"
                                className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                              >
                                {account.displayName}{" "}
                                {/* 显示账户名（通常为缩写地址） */}
                                {/* 如果有余额信息，显示余额 */}
                                {account.displayBalance
                                  ? ` (${account.displayBalance})`
                                  : ""}
                              </button>
                            </div>
                          );
                        })()}
                      </div>
                    );
                  }}
                </ConnectButton.Custom>
              </div>

              {/* 移动端菜单切换按钮（仅在移动端显示） */}
              <button
                type="button"
                className="md:hidden" // 在中等屏幕及以上隐藏
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)} // 切换菜单状态
              >
                {/* 根据菜单状态显示不同的图标 */}
                {mobileMenuOpen ? (
                  <X className="w-6 h-6 text-muted-foreground" /> // 关闭图标
                ) : (
                  <Menu className="w-6 h-6 text-muted-foreground" /> // 汉堡菜单图标
                )}
              </button>
            </div>
          </div>

          {/* 移动端导航菜单（下拉式） */}
          <div className={cn("md:hidden", mobileMenuOpen ? "block" : "hidden")}>
            <div className="px-2 pt-2 pb-3 space-y-1 border-t border-border">
              {/* 移动端导航链接 */}
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-muted-foreground hover:text-foreground block px-3 py-2 text-base font-medium"
                  onClick={() => setMobileMenuOpen(false)} // 点击链接后关闭菜单
                >
                  {item.name}
                </Link>
              ))}
              {/* 移动端钱包连接按钮 */}
              <div className="mt-4 px-3">
                <ConnectButton /> {/* RainbowKit 默认钱包连接按钮 */}
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* 占位元素：防止页面内容被固定导航栏遮挡 */}
      <div className="h-16" />
    </>
  );
}
