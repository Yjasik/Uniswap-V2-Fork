import { getContract, PublicClient } from 'viem';
import pairABI from '@/abis/UniswapV2Pair.json';
import { getTokenInfo, TokenInfo } from './getTokenInfo'; 

// Извлекаем ABI из JSON
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

/**
 * Получает информацию о нескольких парах ликвидности
 * @param pairAddresses - массив адресов пар
 * @param publicClient - клиент viem
 * @returns массив с информацией о парах
 */
export const getPairsInfo = async (
  pairAddresses: `0x${string}`[],
  publicClient: PublicClient
): Promise<PairInfo[]> => {
  const pairsInfo: PairInfo[] = [];

  for (const pairAddress of pairAddresses) {
    try {
      // Создаем контракт пары
      const pairContract = getContract({
        address: pairAddress,
        abi: pairAbi,
        client: publicClient,
      });

      // Получаем информацию о токенах и резервах параллельно
      const [token0, token1, reserves] = await Promise.all([
        pairContract.read.token0() as Promise<`0x${string}`>,
        pairContract.read.token1() as Promise<`0x${string}`>,
        pairContract.read.getReserves() as Promise<[bigint, bigint, bigint]>,
      ]);

      // Получаем информацию о токенах
      const [token0Info, token1Info] = await Promise.all([
        getTokenInfo(token0, publicClient),
        getTokenInfo(token1, publicClient),
      ]);

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

      console.log(`✅ Loaded pair: ${token0Info.symbol}/${token1Info.symbol}`);
    } catch (error) {
      console.error(`❌ Error loading pair ${pairAddress}:`, error);
    }
  }

  return pairsInfo;
};