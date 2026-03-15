// hooks/usePools.ts
import { useEffect, useState } from "react";
import { useConfig } from "wagmi";
import { createPublicClient, http, formatUnits } from "viem";
import { ROUTER_ADDRESS } from "@/constants/addresses";
import { getFactoryInfo, getRouterInfo } from "@/utils";

// Типы для пулов
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
  // Создаем публичный клиент viem
  const publicClient = createPublicClient({
    transport: http(rpcUrl),
  });

  // Получаем информацию о Router и Factory
  const routerInfo = await getRouterInfo(ROUTER_ADDRESS, publicClient);
  const factoryInfo = await getFactoryInfo(routerInfo.factory, publicClient);
  
  return factoryInfo.pairsInfo;
}

export const usePools = () => {
  const { chains } = useConfig();
  const [loading, setLoading] = useState(true);
  const [pools, setPools] = useState<Pool[]>([]);

  useEffect(() => {
    // Получаем текущую сеть
    const currentChain = chains[0]; // или другая логика выбора сети
    
    if (!currentChain?.rpcUrls.default.http[0]) {
      console.error("No RPC URL available");
      return;
    }

    const rpcUrl = currentChain.rpcUrls.default.http[0];
    
    loadPools(rpcUrl)
      .then((loadedPools) => {
        setPools(loadedPools);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Failed to load pools:", error);
        setLoading(false);
      });
  }, [chains]); // Зависимость от chains

  return [loading, pools] as const;
};