// hooks/usePools.ts
import { useEffect, useState } from "react";
import { 
  WETH_ADDRESS, 
  USDC_ADDRESS, 
  DAI_ADDRESS, 
  PAIR_WETH_USDC_ADDRESS, 
  PAIR_WETH_DAI_ADDRESS 
} from "@/constants/addresses";

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

export const usePools = () => {
  const [loading, setLoading] = useState(true);
  const [pools, setPools] = useState<Pool[]>([]);

  useEffect(() => {
    // Мок-данные на основе ваших развернутых контрактов
    const mockPools: Pool[] = [
      {
        address: PAIR_WETH_USDC_ADDRESS,
        token0Address: WETH_ADDRESS,
        token0Name: "Wrapped Ether",
        token0Symbol: "WETH",
        token1Address: USDC_ADDRESS,
        token1Name: "USD Coin",
        token1Symbol: "USDC",
        reserve0: 1000000000000000000n,
        reserve1: 2000000000n,
      },
      {
        address: PAIR_WETH_DAI_ADDRESS,
        token0Address: WETH_ADDRESS,
        token0Name: "Wrapped Ether",
        token0Symbol: "WETH",
        token1Address: DAI_ADDRESS,
        token1Name: "Dai Stablecoin",
        token1Symbol: "DAI",
        reserve0: 500000000000000000n,
        reserve1: 500000000000000000000n,
      }
    ];

    setPools(mockPools);
    setLoading(false);
  }, []);

  return [loading, pools] as const;
};