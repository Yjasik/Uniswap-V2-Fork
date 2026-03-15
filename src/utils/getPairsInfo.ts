// src/utils/getPairsInfo.ts
import { getContract, PublicClient } from 'viem';
import pairABI from '@/abis/UniswapV2Pair.json';
import { getTokenInfo, TokenInfo } from './getTokenInfo';

const pairAbi = pairABI.abi;

export interface PairInfo {
  address: `0x${string}`;
  token0: `0x${string}`;
  token1: `0x${string}`;
  token0Symbol: string;
  token1Symbol: string;
  token0Name: string;
  token1Name: string;
  token0Decimals: number;
  token1Decimals: number;
  reserves: {
    reserve0: bigint;
    reserve1: bigint;
    blockTimestampLast: number;
  };
}

export const getPairsInfo = async (
  pairAddresses: `0x${string}`[],
  publicClient: PublicClient
): Promise<PairInfo[]> => {
  console.log("👥 [getPairsInfo] Starting for", pairAddresses.length, "pairs");
  
  const pairsInfo: PairInfo[] = [];

  for (let i = 0; i < pairAddresses.length; i++) {
    const pairAddress = pairAddresses[i];
    console.log(`👥 [getPairsInfo] Processing pair ${i}:`, pairAddress);
    
    try {
      const pairContract = getContract({
        address: pairAddress,
        abi: pairAbi,
        client: publicClient,
      });

      console.log(`👥 [getPairsInfo] Reading token0 for pair ${i}...`);
      const token0 = await pairContract.read.token0() as `0x${string}`;
      console.log(`👥 [getPairsInfo] token0:`, token0);

      console.log(`👥 [getPairsInfo] Reading token1 for pair ${i}...`);
      const token1 = await pairContract.read.token1() as `0x${string}`;
      console.log(`👥 [getPairsInfo] token1:`, token1);

      console.log(`👥 [getPairsInfo] Reading reserves for pair ${i}...`);
      const reserves = await pairContract.read.getReserves() as [bigint, bigint, bigint];
      console.log(`👥 [getPairsInfo] reserves:`, {
        reserve0: reserves[0].toString(),
        reserve1: reserves[1].toString(),
        timestamp: reserves[2].toString()
      });

      console.log(`👥 [getPairsInfo] Getting token info for token0...`);
      const token0Info = await getTokenInfo(token0, publicClient);
      console.log(`👥 [getPairsInfo] token0 info:`, token0Info);

      console.log(`👥 [getPairsInfo] Getting token info for token1...`);
      const token1Info = await getTokenInfo(token1, publicClient);
      console.log(`👥 [getPairsInfo] token1 info:`, token1Info);

      pairsInfo.push({
        address: pairAddress,
        token0,
        token1,
        token0Symbol: token0Info.symbol,
        token1Symbol: token1Info.symbol,
        token0Name: token0Info.name,
        token1Name: token1Info.name,
        token0Decimals: token0Info.decimals,
        token1Decimals: token1Info.decimals,
        reserves: {
          reserve0: reserves[0],
          reserve1: reserves[1],
          blockTimestampLast: Number(reserves[2]),
        },
      });

      console.log(`✅ [getPairsInfo] Successfully loaded pair ${i}: ${token0Info.symbol}/${token1Info.symbol}`);
    } catch (error) {
      console.error(`❌ [getPairsInfo] Error loading pair ${pairAddress}:`, error);
    }
  }

  console.log("👥 [getPairsInfo] Completed. Total pairs loaded:", pairsInfo.length);
  return pairsInfo;
};