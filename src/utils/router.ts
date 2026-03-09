import { getContract, PublicClient } from 'viem';
import routerABI from '@/abis/UniswapV2Router02.json';

const routerAbi = routerABI.abi;

export const getRouterInfo = async (
  routerAddress: `0x${string}`,
  publicClient: PublicClient
) => {
  const router = getContract({
    address: routerAddress,
    abi: routerAbi,
    client: publicClient,
  });

  const factory = await router.read.factory();
  return { factory: factory as `0x${string}` };
};