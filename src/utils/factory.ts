import { getContract, PublicClient } from 'viem';
import factoryABI from '@/abis/UniswapV2Factory.json';
import { getPairsInfo } from './getPairsInfo';
import { WETH_ADDRESS, DAI_ADDRESS } from '@/constants/addresses'; 

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
  try {
    const factory = getContract({
      address: factoryAddress,
      abi: factoryAbi,
      client: publicClient,
    });

    const [feeTo, feeToSetter, allPairsLength] = await Promise.all([
      factory.read.feeTo() as Promise<`0x${string}`>,
      factory.read.feeToSetter() as Promise<`0x${string}`>,
      factory.read.allPairsLength() as Promise<bigint>,
    ]);

    const factoryInfo: FactoryInfo = {
      feeTo,
      feeToSetter,
      allPairsLength: Number(allPairsLength),
      allPairs: [],
      pairsInfo: [],
    };
    
    const pairAddress = await factory.read.getPair([DAI_ADDRESS, WETH_ADDRESS]) as `0x${string}`;
    
    if (pairAddress && pairAddress !== '0x0000000000000000000000000000000000000000') {
      const pairsInfo = await getPairsInfo([pairAddress], publicClient);
      
      if (pairsInfo.length > 0) {
        factoryInfo.pairsInfo = pairsInfo;
        factoryInfo.allPairs = [pairAddress];
      }
    }

    return factoryInfo;
  } catch (error) {
    throw error;
  }
};