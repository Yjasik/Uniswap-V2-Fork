// src/utils/factory.ts
import { getContract, PublicClient } from 'viem';
import factoryABI from '@/abis/UniswapV2Factory.json';
import { getPairsInfo } from './getPairsInfo';
import { WETH_ADDRESS, DAI_ADDRESS } from '@/constants/addresses'; // 👈 ИМПОРТИРУЕМ АДРЕСА

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
  console.log("🏭 [getFactoryInfo] Starting for factory:", factoryAddress);
  
  try {
    const factory = getContract({
      address: factoryAddress,
      abi: factoryAbi,
      client: publicClient,
    });

    console.log("🏭 [getFactoryInfo] Contract created");

    // Читаем основные данные
    console.log("🏭 [getFactoryInfo] Reading factory data...");
    const [feeTo, feeToSetter, allPairsLength] = await Promise.all([
      factory.read.feeTo() as Promise<`0x${string}`>,
      factory.read.feeToSetter() as Promise<`0x${string}`>,
      factory.read.allPairsLength() as Promise<bigint>,
    ]);

    console.log("🏭 [getFactoryInfo] feeTo:", feeTo);
    console.log("🏭 [getFactoryInfo] feeToSetter:", feeToSetter);
    console.log("🏭 [getFactoryInfo] allPairsLength:", allPairsLength.toString());

    const factoryInfo: FactoryInfo = {
      feeTo,
      feeToSetter,
      allPairsLength: Number(allPairsLength),
      allPairs: [],
      pairsInfo: [],
    };

    // 👇 Ищем нашу конкретную пару DAI/WETH
    console.log("🎯 Checking for specific pair DAI/WETH...");
    console.log("   DAI address:", DAI_ADDRESS);
    console.log("   WETH address:", WETH_ADDRESS);
    
    const pairAddress = await factory.read.getPair([DAI_ADDRESS, WETH_ADDRESS]) as `0x${string}`;
    console.log("   getPair result:", pairAddress);
    
    // Проверяем, что адрес не нулевой
    if (pairAddress && pairAddress !== '0x0000000000000000000000000000000000000000') {
      console.log("✅ Found DAI/WETH pair at:", pairAddress);
      console.log("   Expected address: 0xD5d2BDb021366696871bb71D5e2a690E919B94d8");
      console.log("   Match:", pairAddress.toLowerCase() === '0xD5d2BDb021366696871bb71D5e2a690E919B94d8'.toLowerCase() ? "✅ YES" : "❌ NO");
      
      // Загружаем информацию только об этой паре
      console.log("📦 Loading pair info...");
      const pairsInfo = await getPairsInfo([pairAddress], publicClient);
      
      if (pairsInfo.length > 0) {
        console.log("✅ Pair info loaded:", {
          token0: pairsInfo[0].token0Symbol,
          token1: pairsInfo[0].token1Symbol,
          reserve0: pairsInfo[0].reserves.reserve0.toString(),
          reserve1: pairsInfo[0].reserves.reserve1.toString()
        });
        
        factoryInfo.pairsInfo = pairsInfo;
        factoryInfo.allPairs = [pairAddress];
      } else {
        console.log("❌ Failed to load pair info");
      }
    } else {
      console.log("❌ DAI/WETH pair not found in factory");
    }

    console.log("🏭 [getFactoryInfo] Returning factory info with", factoryInfo.pairsInfo.length, "pairs");
    return factoryInfo;
  } catch (error) {
    console.error("🏭 [getFactoryInfo] ERROR:", error);
    throw error;
  }
};