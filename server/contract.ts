// EVM contract reader – BSC token (new ABI)
// Reads:
// - Fees received (BNB): quoteFounder (quote* are denominated in quote token, i.e. BNB/WBNB)
// - Liquidity (BNB): feeLiquidity (per requirement)

import { createPublicClient, http, formatUnits, type PublicClient } from "viem";
import { bsc } from "viem/chains";

const TOKEN_ADDRESS = process.env.TOKEN_CONTRACT_ADDRESS;

// New token ABI (minimal subset we need)
const TOKEN_ABI = [
  {
    type: "function",
    name: "pair",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "WETH",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "quoteFounder",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "quoteHolder",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "feeAccumulated",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "quoteClaimed",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "feeFounder",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "feeLiquidity",
    inputs: [],
    outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "decimals",
    inputs: [],
    outputs: [{ name: "", type: "uint8", internalType: "uint8" }],
    stateMutability: "view",
  },
] as const;

// Pancake/UniswapV2 pair ABI (minimal)
const PAIR_ABI = [
  {
    type: "function",
    name: "token0",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "token1",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getReserves",
    inputs: [],
    outputs: [
      { name: "_reserve0", type: "uint112", internalType: "uint112" },
      { name: "_reserve1", type: "uint112", internalType: "uint112" },
      { name: "_blockTimestampLast", type: "uint32", internalType: "uint32" },
    ],
    stateMutability: "view",
  },
] as const;

export interface ContractData {
  fundsBalance: string;
  liquidityBalance: string;
  debug?: {
    tokenAddress: string;
    pairAddress: string;
    weth: string;
    tokenDecimals: number;
    quoteFounder: string;
    quoteHolder: string;
    feeAccumulated: string;
    quoteClaimed: string;
    feeFounder: string;
    feeLiquidity: string;
    feesFromQuotes: string;
    feesUnclaimed: string;
  };
}

export async function getContractData(opts?: {
  tokenAddress?: string;
  includeDebug?: boolean;
}): Promise<ContractData> {
  try {
    const rpcUrl = process.env.EVM_RPC_URL || "https://bsc-dataseed1.binance.org";
    const publicClient: PublicClient = createPublicClient({
      chain: bsc,
      transport: http(rpcUrl),
    });

    const tokenAddress = (opts?.tokenAddress || TOKEN_ADDRESS) as
      | `0x${string}`
      | undefined;

    if (!tokenAddress) {
      throw new Error("TOKEN_CONTRACT_ADDRESS must be set");
    }

    const [
      pairAddress,
      weth,
      quoteFounder,
      quoteHolder,
      feeAccumulated,
      quoteClaimed,
      feeFounder,
      feeLiquidity,
      tokenDecimals,
    ] =
      await Promise.all([
        publicClient.readContract({
          address: tokenAddress,
          abi: TOKEN_ABI,
          functionName: "pair",
        }).catch(() => "0x0000000000000000000000000000000000000000"),
        publicClient.readContract({
          address: tokenAddress,
          abi: TOKEN_ABI,
          functionName: "WETH",
        }).catch(() => "0x0000000000000000000000000000000000000000"),
        publicClient.readContract({
          address: tokenAddress,
          abi: TOKEN_ABI,
          functionName: "quoteFounder",
        }).catch(() => BigInt(0)),
        publicClient.readContract({
          address: tokenAddress,
          abi: TOKEN_ABI,
          functionName: "quoteHolder",
        }).catch(() => BigInt(0)),
        publicClient.readContract({
          address: tokenAddress,
          abi: TOKEN_ABI,
          functionName: "feeAccumulated",
        }).catch(() => BigInt(0)),
        publicClient.readContract({
          address: tokenAddress,
          abi: TOKEN_ABI,
          functionName: "quoteClaimed",
        }).catch(() => BigInt(0)),
        publicClient.readContract({
          address: tokenAddress,
          abi: TOKEN_ABI,
          functionName: "feeFounder",
        }).catch(() => BigInt(0)),
        publicClient.readContract({
          address: tokenAddress,
          abi: TOKEN_ABI,
          functionName: "feeLiquidity",
        }).catch(() => BigInt(0)),
        publicClient.readContract({
          address: tokenAddress,
          abi: TOKEN_ABI,
          functionName: "decimals",
        }).catch(() => 18),
      ]);

    const quoteFounderRaw = quoteFounder as bigint;
    const quoteHolderRaw = quoteHolder as bigint;
    const feesFromQuotesRaw = quoteFounderRaw + quoteHolderRaw;
    const feeAccumulatedRaw = feeAccumulated as bigint;
    const quoteClaimedRaw = quoteClaimed as bigint;
    const feeFounderRaw = feeFounder as bigint;
    const feeLiquidityRaw = feeLiquidity as bigint;
    const feesUnclaimedRaw =
      feeAccumulatedRaw > quoteClaimedRaw
        ? feeAccumulatedRaw - quoteClaimedRaw
        : BigInt(0);

    // "Fees received" (Funds) – BNB amount is tracked in quoteFounder
    const fundsBalance = formatUnits(quoteFounderRaw, 18);

    // "Liquidity" (BNB) – per new requirement: feeLiquidity
    let liquidityBalance = formatUnits(feeLiquidityRaw, 18);
    // liquidityTokens removed (no longer needed)

    const pair = pairAddress as string;
    const wbnb = (weth as string).toLowerCase();
    if (pair && pair !== "0x0000000000000000000000000000000000000000") {
      const [token0, token1, reserves] = await Promise.all([
        publicClient.readContract({
          address: pair as `0x${string}`,
          abi: PAIR_ABI,
          functionName: "token0",
        }),
        publicClient.readContract({
          address: pair as `0x${string}`,
          abi: PAIR_ABI,
          functionName: "token1",
        }),
        publicClient.readContract({
          address: pair as `0x${string}`,
          abi: PAIR_ABI,
          functionName: "getReserves",
        }),
      ]).catch((e) => {
        console.warn("[Contract] pair read error:", e);
        return [null, null, null] as const;
      });

      if (token0 && token1 && reserves) {
        const t0 = (token0 as string).toLowerCase();
        const t1 = (token1 as string).toLowerCase();
        const [r0, r1] = reserves as unknown as [bigint, bigint, number];

        const reserve0 = BigInt(r0 as any);
        const reserve1 = BigInt(r1 as any);

        // liquidityTokens removed (no longer needed)
      }
    }

    console.log("[Contract] Successfully read contract data:", {
      fundsBalance,
      liquidityBalance,
    });

    return {
      fundsBalance,
      liquidityBalance,
      ...(opts?.includeDebug
        ? {
            debug: {
              tokenAddress: tokenAddress,
              pairAddress: pair,
              weth: weth as string,
              tokenDecimals: Number(tokenDecimals),
              quoteFounder: formatUnits(quoteFounderRaw, 18),
              quoteHolder: formatUnits(quoteHolderRaw, 18),
              feeAccumulated: formatUnits(feeAccumulatedRaw, 18),
              quoteClaimed: formatUnits(quoteClaimedRaw, 18),
              feeFounder: formatUnits(feeFounderRaw, 18),
              feeLiquidity: formatUnits(feeLiquidityRaw, 18),
              feesFromQuotes: formatUnits(feesFromQuotesRaw, 18),
              feesUnclaimed: formatUnits(feesUnclaimedRaw, 18),
            },
          }
        : {}),
    };
  } catch (e) {
    console.warn("[Contract] getContractData error:", e);
    return {
      fundsBalance: "0",
      liquidityBalance: "0",
    };
  }
}
