// EVM contract reader – BSC token + tax processor (funds + liquidity)
// Same approach as Gold-main: read taxProcessor from token, then read funds/liquidity

import { createPublicClient, http, formatEther, type PublicClient } from "viem";
import { bsc } from "viem/chains";

const TOKEN_ADDRESS = process.env.TOKEN_CONTRACT_ADDRESS;
const TAX_PROCESSOR_ADDRESS_ENV = process.env.TAX_PROCESSOR_ADDRESS;

// Token Contract ABI - to read taxProcessor address
const TOKEN_ABI = [
  {
    type: "function",
    name: "taxProcessor",
    inputs: [],
    outputs: [{ name: "", type: "address", internalType: "address" }],
    stateMutability: "view",
  },
] as const;

// Tax Processor ABI - Complete ABI from contract
const TAX_PROCESSOR_ABI = [
  {
    inputs: [],
    name: "totalQuoteAddedToLiquidity",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalTokenAddedToLiquidity",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalQuoteSentToMarketing",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "marketQuoteBalance",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "feeQuoteBalance",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "lpQuoteBalance",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "dividendQuoteBalance",
    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

export interface ContractData {
  fundsBalance: string;
  liquidityBalance: string;
  liquidityTokens?: string;
}

export async function getContractData(): Promise<ContractData> {
  try {
    const rpcUrl = process.env.EVM_RPC_URL || "https://bsc-dataseed1.binance.org";
    const publicClient: PublicClient = createPublicClient({
      chain: bsc,
      transport: http(rpcUrl),
    });

    // Step 1: Get taxProcessor address from token contract (or use env var if provided)
    let taxProcessorAddress = TAX_PROCESSOR_ADDRESS_ENV;
    
    if (!taxProcessorAddress && TOKEN_ADDRESS) {
      console.log("[Contract] Reading taxProcessor from token contract:", TOKEN_ADDRESS);
      try {
        taxProcessorAddress = await publicClient.readContract({
          address: TOKEN_ADDRESS as `0x${string}`,
          abi: TOKEN_ABI,
          functionName: "taxProcessor",
        }) as string;
        console.log("[Contract] TaxProcessor address from token:", taxProcessorAddress);
      } catch (error: unknown) {
        console.error("[Contract] Error reading taxProcessor from token:", error);
        throw new Error(`Failed to get taxProcessor address: ${error instanceof Error ? error.message : String(error)}`);
      }
    } else if (taxProcessorAddress) {
      console.log("[Contract] Using TaxProcessor address from env var:", taxProcessorAddress);
    } else {
      throw new Error("Either TOKEN_CONTRACT_ADDRESS or TAX_PROCESSOR_ADDRESS must be set");
    }

    if (!taxProcessorAddress) {
      throw new Error("TaxProcessor address not found");
    }

    // Step 2: Read from tax processor contract
    console.log("[Contract] Reading from TaxProcessor:", taxProcessorAddress);

    const [
      totalLiquidityBNB,
      liquidityTokensRaw,
      fundsBNB,
    ] = await Promise.all([
      // totalQuoteAddedToLiquidity = total BNB added to liquidity
      publicClient
        .readContract({
          address: taxProcessorAddress as `0x${string}`,
          abi: TAX_PROCESSOR_ABI,
          functionName: "totalQuoteAddedToLiquidity",
        })
        .catch((e: unknown) => {
          console.warn("[Contract] totalQuoteAddedToLiquidity read error:", e);
          return BigInt(0);
        }),
      // totalTokenAddedToLiquidity = total $GOLD tokens added to liquidity
      publicClient
        .readContract({
          address: taxProcessorAddress as `0x${string}`,
          abi: TAX_PROCESSOR_ABI,
          functionName: "totalTokenAddedToLiquidity",
        })
        .catch((e: unknown) => {
          console.warn("[Contract] totalTokenAddedToLiquidity read error:", e);
          return BigInt(0);
        }),
      // totalQuoteSentToMarketing or marketQuoteBalance = funds/treasury BNB
      publicClient
        .readContract({
          address: taxProcessorAddress as `0x${string}`,
          abi: TAX_PROCESSOR_ABI,
          functionName: "totalQuoteSentToMarketing",
        })
        .catch((e: unknown) => {
          console.warn("[Contract] totalQuoteSentToMarketing not available, trying marketQuoteBalance...");
          return publicClient
            .readContract({
              address: taxProcessorAddress as `0x${string}`,
              abi: TAX_PROCESSOR_ABI,
              functionName: "marketQuoteBalance",
            })
            .catch((e2: unknown) => {
              console.warn("[Contract] marketQuoteBalance read error:", e2);
              return BigInt(0);
            });
        }),
    ]);

    const fundsBalance = formatEther(fundsBNB);
    const liquidityBalance = formatEther(totalLiquidityBNB);
    const liquidityTokensFormatted = liquidityTokensRaw > BigInt(0) ? formatEther(liquidityTokensRaw) : undefined;

    console.log("[Contract] Successfully read contract data:", {
      fundsBalance,
      liquidityBalance,
      liquidityTokens: liquidityTokensFormatted,
    });

    return {
      fundsBalance,
      liquidityBalance,
      liquidityTokens: liquidityTokensFormatted,
    };
  } catch (e) {
    console.warn("[Contract] getContractData error:", e);
    return {
      fundsBalance: "0",
      liquidityBalance: "0",
    };
  }
}
