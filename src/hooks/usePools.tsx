// hooks/usePools.ts
import { useEffect, useState } from "react";
import { useConfig } from "wagmi";
import { createPublicClient, http, formatUnits } from "viem";
import { ROUTER_ADDRESS } from "@/constants/addresses";
import { 
  getFactoryInfo, 
  getRouterInfo,
  type FactoryInfo,
  type PairInfo      // 👈 Импортируем PairInfo
} from "@/utils";

// Типы для пулов (приводим к нужному формату)
export type Pool = {
  address: `0x${string}`;
  token0Address: `0x${string}`;
  token0Name: string;
  token0Symbol: string;
  token1Address: `0x${string}`;
  token1Name: string;
  token1Symbol: string;
  reserve0: bigint;
  reserve1: bigint;
};

export const loadPools = async (rpcUrl: string): Promise<Pool[]> => {
  console.log("📡 loadPools started with RPC:", rpcUrl);
  
  try {
    // Создаем публичный клиент viem
    const publicClient = createPublicClient({
      transport: http(rpcUrl),
    });
    console.log("✅ Public client created");

    // Получаем информацию о Router
    console.log("🔍 Getting router info...");
    const routerInfo = await getRouterInfo(ROUTER_ADDRESS, publicClient);
    console.log("✅ Router info:", routerInfo);

    // Получаем информацию о Factory
    console.log("🔍 Getting factory info from:", routerInfo.factory);
    const factoryInfo = await getFactoryInfo(routerInfo.factory, publicClient);
    console.log("✅ Factory info:", {
      feeTo: factoryInfo.feeTo,
      feeToSetter: factoryInfo.feeToSetter,
      allPairsLength: factoryInfo.allPairsLength,
      allPairsCount: factoryInfo.allPairs?.length,
      pairsInfoCount: factoryInfo.pairsInfo?.length
    });

    // Проверяем наличие нашей пары
    if (factoryInfo.pairsInfo) {
      const ourPair = factoryInfo.pairsInfo.find((p: PairInfo) => 
        p.address.toLowerCase() === '0xD5d2BDb021366696871bb71D5e2a690E919B94d8'.toLowerCase()
      );
      
      if (ourPair) {
        console.log("🎯 Our DAI/MTK pair FOUND:", {
          address: ourPair.address,
          token0: ourPair.token0Symbol,
          token1: ourPair.token1Symbol,
          reserve0: ourPair.reserves ? formatUnits(ourPair.reserves.reserve0, ourPair.token0Decimals) : '0',
          reserve1: ourPair.reserves ? formatUnits(ourPair.reserves.reserve1, ourPair.token1Decimals) : '0'
        });
      } else {
        console.warn("⚠️ Our DAI/MTK pair NOT FOUND in factoryInfo.pairsInfo");
        console.log("Available pairs:", factoryInfo.pairsInfo.map((p: PairInfo) => ({
          address: p.address,
          token0: p.token0Symbol,
          token1: p.token1Symbol
        })));
      }
    }

    // Преобразуем pairsInfo в формат Pool[]
    const pools = factoryInfo.pairsInfo.map((pairInfo: PairInfo) => ({
      address: pairInfo.address,
      token0Address: pairInfo.token0,           // 👈 Было token0Address, стало token0
      token0Name: pairInfo.token0Name || 'Unknown',
      token0Symbol: pairInfo.token0Symbol || '???',
      token1Address: pairInfo.token1,           // 👈 Было token1Address, стало token1
      token1Name: pairInfo.token1Name || 'Unknown',
      token1Symbol: pairInfo.token1Symbol || '???',
      reserve0: pairInfo.reserves?.reserve0 || 0n,  // 👈 Было reserve0, теперь reserves.reserve0
      reserve1: pairInfo.reserves?.reserve1 || 0n,  // 👈 Было reserve1, теперь reserves.reserve1
    }));

    console.log(`✅ Converted ${pools.length} pools to Pool format`);
    return pools;
  } catch (error) {
    console.error("❌ Error in loadPools:", error);
    throw error;
  }
};

export const usePools = () => {
  const { chains } = useConfig();
  const [loading, setLoading] = useState(true);
  const [pools, setPools] = useState<Pool[]>([]);

  useEffect(() => {
    console.log("🔄 usePools useEffect triggered");
    
    const currentChain = chains[0];
    console.log("Current chain:", currentChain);
    
    if (!currentChain?.rpcUrls.default.http[0]) {
      console.error("❌ No RPC URL available");
      return;
    }

    const rpcUrl = currentChain.rpcUrls.default.http[0];
    console.log("📡 Using RPC URL from wagmi config:", rpcUrl);
    
    setLoading(true);
    
    loadPools(rpcUrl)
      .then((loadedPools) => {
        console.log("✅ All pools loaded successfully:", loadedPools.length);
        console.log("Pool addresses:", loadedPools.map(p => p.address));
        setPools(loadedPools);
        setLoading(false);
      })
      .catch((error) => {
        console.error("❌ Failed to load pools:", error);
        setLoading(false);
      });
  }, [chains]);

  console.log("🏊 usePools returning:", { loading, poolsCount: pools.length });
  
  return [loading, pools] as const;
};