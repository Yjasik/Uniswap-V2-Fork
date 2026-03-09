import { getContract, PublicClient } from 'viem';
import factoryABI from '@/abis/UniswapV2Factory.json';
import { getPairsInfo } from './getPairsInfo';

// Извлекаем ABI
const factoryAbi = factoryABI.abi;

export interface FactoryInfo {
  feeTo: `0x${string}`;
  feeToSetter: `0x${string}`;
  allPairsLength: number;
  allPairs: `0x${string}`[];
  pairsInfo: any[];
}

export const getFactoryInfo = async (
  factoryAddress: `0x${string}`,
  publicClient: PublicClient
): Promise<FactoryInfo> => {
  // Создаем контракт без приведения типа
  const factory = getContract({
    address: factoryAddress,
    abi: factoryAbi,
    client: publicClient,
  });

  // TypeScript сам выведет типы из ABI
  const [feeTo, feeToSetter, allPairsLength] = await Promise.all([
    factory.read.feeTo(),
    factory.read.feeToSetter(),
    factory.read.allPairsLength(),
  ]);

  const factoryInfo: FactoryInfo = {
    feeTo: feeTo as `0x${string}`,
    feeToSetter: feeToSetter as `0x${string}`,
    allPairsLength: Number(allPairsLength),
    allPairs: [],
    pairsInfo: [],
  };

  const allPairs: `0x${string}`[] = [];
  for (let i = 0; i < factoryInfo.allPairsLength; i++) {
    const pairAddress = await factory.read.allPairs([BigInt(i)]);
    allPairs.push(pairAddress as `0x${string}`);
  }
  factoryInfo.allPairs = allPairs;

  factoryInfo.pairsInfo = await getPairsInfo(allPairs, publicClient);

  return factoryInfo;
};