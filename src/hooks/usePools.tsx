import { useEffect, useState } from "react";
import { useConfig } from "wagmi";
import { createPublicClient, http } from "viem";
import { ROUTER_ADDRESS } from "@/constants/addresses";
import { 
  getFactoryInfo, 
  getRouterInfo,
  type PairInfo      
} from "@/utils";

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
  try {
    const publicClient = createPublicClient({
      transport: http(rpcUrl),
    });

    const routerInfo = await getRouterInfo(ROUTER_ADDRESS, publicClient);
    const factoryInfo = await getFactoryInfo(routerInfo.factory, publicClient);

    const pools = factoryInfo.pairsInfo.map((pairInfo: PairInfo) => ({
      address: pairInfo.address,
      token0Address: pairInfo.token0,
      token0Name: pairInfo.token0Name || 'Unknown',
      token0Symbol: pairInfo.token0Symbol || '???',
      token1Address: pairInfo.token1,
      token1Name: pairInfo.token1Name || 'Unknown',
      token1Symbol: pairInfo.token1Symbol || '???',
      reserve0: pairInfo.reserves?.reserve0 || 0n,
      reserve1: pairInfo.reserves?.reserve1 || 0n,
    }));

    return pools;
  } catch (error) {
    throw error;
  }
};

export const usePools = () => {
  const { chains } = useConfig();
  const [loading, setLoading] = useState(true);
  const [pools, setPools] = useState<Pool[]>([]);

  useEffect(() => {
    const currentChain = chains[0];
    
    if (!currentChain?.rpcUrls.default.http[0]) {
      return;
    }

    const rpcUrl = currentChain.rpcUrls.default.http[0];
    setLoading(true);
    
    loadPools(rpcUrl)
      .then((loadedPools) => {
        setPools(loadedPools);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [chains]);

  return [loading, pools] as const;
};