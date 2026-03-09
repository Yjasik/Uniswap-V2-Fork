import { getContract, PublicClient } from 'viem';
import erc20ABI from '@/abis/ERC20.json';

const erc20Abi = erc20ABI.abi;

export interface TokenInfo {
  address: `0x${string}`;
  name: string;
  symbol: string;
  decimals: number;
}

/**
 * Получает информацию о ERC20 токене
 * @param tokenAddress - адрес токена
 * @param publicClient - клиент viem
 * @returns информация о токене
 */
export const getTokenInfo = async (
  tokenAddress: `0x${string}`,
  publicClient: PublicClient
): Promise<TokenInfo> => {
  const tokenContract = getContract({
    address: tokenAddress,
    abi: erc20Abi,
    client: publicClient,
  });

  const [name, symbol, decimals] = await Promise.all([
    tokenContract.read.name() as Promise<string>,
    tokenContract.read.symbol() as Promise<string>,
    tokenContract.read.decimals() as Promise<number>,
  ]);

  return {
    address: tokenAddress,
    name,
    symbol,
    decimals,
  };
};