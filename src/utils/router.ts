import { getContract, GetContractReturnType, PublicClient } from 'viem';
import routerABI from '@uniswap/v2-periphery/build/UniswapV2Router02.json';

// Проверяем структуру ABI
const abi = 'abi' in routerABI ? routerABI.abi : routerABI;

type RouterContract = GetContractReturnType<typeof abi, PublicClient>;

interface RouterInfo {
  factory: `0x${string}`;
}

export const getRouterInfo = async (
  routerAddress: `0x${string}`,
  publicClient: PublicClient
): Promise<RouterInfo> => {
  const router = getContract({
    address: routerAddress,
    abi: abi,
    client: publicClient,
  }) as RouterContract;

  const factory = await router.read.factory();

  return {
    factory: factory as `0x${string}`,
  };
};