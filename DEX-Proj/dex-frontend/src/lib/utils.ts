// 导入 clsx 的类型和函数，用于条件性合并类名
import { type ClassValue, clsx } from "clsx";
// 导入 tailwind-merge 用于合并 Tailwind CSS 类，解决类名冲突
import { twMerge } from "tailwind-merge";

/**
 * =====================================================
 * 1. Tailwind CSS 工具函数
 * =====================================================
 */

/**
 * 合并 Tailwind CSS 类名，自动处理条件类和冲突类
 * @param inputs - 类名数组，支持字符串、对象、数组等多种格式
 * @returns 合并后的类名字符串
 *
 * @example
 * cn('px-2 py-1', { 'bg-blue-500': true }, ['rounded-lg'])
 * // 返回: 'px-2 py-1 bg-blue-500 rounded-lg'
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * =====================================================
 * 2. 数字格式化工具函数
 * =====================================================
 */

/**
 * 通用数字格式化函数
 * 根据数字大小自动选择显示格式（K/M/小数）
 * @param num - 要格式化的数字
 * @returns 格式化后的字符串
 *
 * @example
 * formatNumber(0)        // '0'
 * formatNumber(0.0005)   // '<0.001'
 * formatNumber(1234)     // '1.23K'
 * formatNumber(1234567)  // '1.23M'
 * formatNumber(1.2345)   // '1.235'
 */
export function formatNumber(num: number): string {
  // 处理零值
  if (num === 0) return "0";
  // 处理极小值（小于0.001）
  if (num < 0.001) return "<0.001";
  // 处理百万以上数值（M）
  if (num >= 1000000) return (num / 1000000).toFixed(2) + "M";
  // 处理千以上数值（K）
  if (num >= 1000) return (num / 1000).toFixed(2) + "K";
  // 处理普通数值：保留3位小数，去除末尾无意义的0和小数点
  return num.toFixed(3).replace(/\.?0+$/, "");
}

/**
 * 格式化代币数量
 * 专门用于显示代币余额/数量，保留更多小数位
 * @param amount - 代币数量（字符串或数字）
 * @returns 格式化后的字符串
 *
 * @example
 * formatTokenAmount('0')           // '0'
 * formatTokenAmount('0.0005')      // '<0.001'
 * formatTokenAmount('1234.5678')   // '1.23K'
 * formatTokenAmount('1.23456789')  // '1.234568'
 */
export function formatTokenAmount(amount: string | number): string {
  // 统一转换为数字类型
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  // 处理零值
  if (num === 0) return "0";
  // 处理极小值
  if (num < 0.001) return "<0.001";
  // 处理百万以上
  if (num >= 1000000) return (num / 1000000).toFixed(2) + "M";
  // 处理千以上
  if (num >= 1000) return (num / 1000).toFixed(2) + "K";
  // 普通数值：保留6位小数（适合代币精度），去除末尾无意义0
  return num.toFixed(6).replace(/\.?0+$/, "");
}

/**
 * 格式化价格
 * 专门用于显示代币价格，支持更小的小数位
 * @param price - 代币价格（字符串或数字）
 * @returns 格式化后的字符串
 *
 * @example
 * formatPrice('0')           // '0'
 * formatPrice('0.00005')     // '<0.0001'
 * formatPrice('1234.5678')   // '1.23K'
 * formatPrice('0.12345678')  // '0.123457'
 */
export function formatPrice(price: string | number): string {
  // 统一转换为数字类型
  const num = typeof price === "string" ? parseFloat(price) : price;
  // 处理零值
  if (num === 0) return "0";
  // 价格支持更小的精度阈值（0.0001）
  if (num < 0.0001) return "<0.0001";
  // 处理百万以上
  if (num >= 1000000) return (num / 1000000).toFixed(2) + "M";
  // 处理千以上
  if (num >= 1000) return (num / 1000).toFixed(2) + "K";
  // 普通价格：保留6位小数，去除末尾无意义0
  return num.toFixed(6).replace(/\.?0+$/, "");
}

/**
 * =====================================================
 * 3. 区块链地址工具函数
 * =====================================================
 */

/**
 * 缩短以太坊地址显示
 * @param address - 完整的以太坊地址（42位，包含0x）
 * @param chars - 保留的首尾字符数，默认4个
 * @returns 缩短后的地址字符串
 *
 * @example
 * shortenAddress('0x1234567890abcdef1234567890abcdef12345678')
 * // 返回: '0x1234...5678'
 *
 * shortenAddress('0x1234567890abcdef1234567890abcdef12345678', 6)
 * // 返回: '0x123456...345678'
 */
export function shortenAddress(address: string, chars = 4): string {
  // 保留前几个字符（包含0x前缀）
  // 保留后几个字符
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

/**
 * =====================================================
 * 4. 交易计算工具函数
 * =====================================================
 */

/**
 * 计算滑点后的最小接收量
 * 用于交易时的滑点保护，确保用户不会收到低于预期的代币
 * @param amount - 预期收到的代币数量（字符串）
 * @param slippage - 滑点容忍度百分比（如0.5表示0.5%）
 * @returns 最小接收量的字符串表示
 *
 * @example
 * calculateMinReceived('100', 0.5)  // 滑点0.5%
 * // 返回: '99.5'（100 * (1 - 0.5/100) = 99.5）
 *
 * calculateMinReceived('1000', 1)   // 滑点1%
 * // 返回: '990'
 */
export function calculateMinReceived(amount: string, slippage: number): string {
  // 将字符串转换为数字
  const num = parseFloat(amount);
  // 计算公式：预期数量 × (1 - 滑点%)
  const minReceived = num * (1 - slippage / 100);
  // 返回字符串格式
  return minReceived.toString();
}

/**
 * =====================================================
 * 5. 输入处理工具函数
 * =====================================================
 */

/**
 * 解析用户输入的金额字符串
 * 过滤非法字符，确保格式正确（只允许数字和一个小数点）
 * @param input - 用户输入的原始字符串
 * @returns 清理后的有效数字字符串
 *
 * @example
 * parseInputAmount('123.456')     // '123.456'
 * parseInputAmount('abc123.456')  // '123.456'（过滤字母）
 * parseInputAmount('1.2.3.4')     // '1.234'（只保留第一个小数点）
 * parseInputAmount('00123')       // '00123'（保留前导零，由后续逻辑处理）
 */
export function parseInputAmount(input: string): string {
  // 第一步：移除非数字字符，只保留数字和小数点
  // [^0-9.] 表示：不是数字也不是小数点的字符
  const cleaned = input.replace(/[^0-9.]/g, "");

  // 第二步：确保只有一个小数点
  // 将字符串按小数点分割成数组
  const parts = cleaned.split(".");
  // 如果有多于2个部分，说明有多个小数点
  if (parts.length > 2) {
    // 只保留第一个小数点和其后的所有数字（去除多余的小数点）
    // parts[0]：小数点前的部分
    // parts.slice(1).join('')：将所有小数点后的部分连接起来
    return parts[0] + "." + parts.slice(1).join("");
  }

  // 第三步：返回处理后的有效字符串
  // 可能为空字符串，调用方需要处理空值
  return cleaned;
}

/**
 * =====================================================
 * 工具函数使用场景总结：
 *
 * 1. cn() - 组件样式合并，几乎每个组件都需要
 * 2. formatTokenAmount() - 显示代币余额、交易数量
 * 3. formatPrice() - 显示代币价格、汇率
 * 4. shortenAddress() - 显示钱包地址、交易哈希
 * 5. calculateMinReceived() - 交易确认前的滑点计算
 * 6. parseInputAmount() - 代币输入框的实时过滤
 * 7. formatNumber() - 通用数字格式化（备用）
 * =====================================================
 */
