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
  const pairsInfo: PairInfo[] = [];

  for (let i = 0; i < pairAddresses.length; i++) {
    const pairAddress = pairAddresses[i];
    
    try {
      const pairContract = getContract({
        address: pairAddress,
        abi: pairAbi,
        client: publicClient,
      });

      const token0 = await pairContract.read.token0() as `0x${string}`;
      const token1 = await pairContract.read.token1() as `0x${string}`;
      const reserves = await pairContract.read.getReserves() as [bigint, bigint, bigint];

      const token0Info = await getTokenInfo(token0, publicClient);
      const token1Info = await getTokenInfo(token1, publicClient);

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
    } catch (error) {
      throw error;
    }
  }

  return pairsInfo;
};