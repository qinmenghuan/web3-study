import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

/**
 * GET /api/pools
 *
 * 功能：
 * 返回带分页的流动池列表，并附带 token 元数据
 *
 * 查询参数：
 * - page  当前页码（默认 1）
 * - limit 每页数量（默认 10）
 */
export async function GET(request: NextRequest) {
  try {
    // 从请求 URL 中解析查询参数
    const { searchParams } = new URL(request.url);

    // 每页数量，默认 10
    const limit = parseInt(searchParams.get("limit") || "10");

    // 当前页码，默认 1
    const page = parseInt(searchParams.get("page") || "1");

    // 计算数据库查询偏移量
    const offset = (page - 1) * limit;

    /**
     * 从 Supabase 查询 pools 表
     *
     * - 联表查询 token 信息
     * - 按流动性 liquidity 降序排序
     * - 使用 range 做分页
     * - 获取精确总条数（用于分页）
     */
    const {
      data: pools,
      error,
      count,
    } = await supabase
      .from("pools")
      .select(
        `
        *,
        token0_data:tokens!token0(symbol, decimals),
        token1_data:tokens!token1(symbol, decimals)
      `,
        { count: "exact" },
      )
      .range(offset, offset + limit - 1)
      .order("liquidity", { ascending: false });

    // 如果查询出错，返回 500
    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    /**
     * 对查询结果进行格式化
     *
     * - 规范 token 元数据
     * - 提供默认值（防止为空）
     * - 生成展示字段（例如 pair、feePercent）
     */
    const formattedPools = pools.map((pool: any) => ({
      // 基础信息
      pool: pool.address,
      token0: pool.token0,
      token1: pool.token1,

      // token 元数据（如果没有则使用默认值）
      token0Symbol: pool.token0_data?.symbol || "UNK",
      token1Symbol: pool.token1_data?.symbol || "UNK",
      token0Decimals: pool.token0_data?.decimals || 18,
      token1Decimals: pool.token1_data?.decimals || 18,

      // 手续费信息
      fee: pool.fee,

      // 将 fee 转换为百分比字符串（例如 3000 -> 0.30%）
      feePercent: `${(pool.fee / 10000).toFixed(2)}%`,

      // 链上核心状态数据
      liquidity: pool.liquidity,
      sqrtPriceX96: pool.sqrt_price_x96,
      tick: pool.tick,

      /**
       * 以下字段为占位字段
       * 实际项目中应通过：
       * - 流动性计算
       * - swap 聚合统计
       * - 价格喂价服务
       * 来计算真实值
       */
      tvl: "0", // 总锁仓价值（未计算）
      tvlUSD: 0, // 美元计价 TVL
      volume24h: "0", // 24 小时交易量
      feesUSD: 0, // 24 小时手续费

      // 交易对显示名称
      pair: `${pool.token0_data?.symbol || "UNK"} / ${pool.token1_data?.symbol || "UNK"}`,

      // 预留字段（如数据库中有 index 可使用）
      index: 0,

      /**
       * token 余额字段
       * 需要：
       * - 链上调用
       * - 或 indexer 同步余额
       */
      token0Balance: "0",
      token1Balance: "0",
    }));

    // 返回分页数据
    return NextResponse.json({
      data: formattedPools,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: count ? Math.ceil(count / limit) : 0,
      },
    });
  } catch (error) {
    // 捕获运行时异常
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
