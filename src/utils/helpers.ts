import { useEffect } from 'react';
import { useReadContract } from 'wagmi';
import routerABI from '@/abis/UniswapV2Router02.json';
import { ROUTER_ADDRESS } from '@/constants/addresses';
import { parseUnits } from 'viem';
import type { Pool } from '@/hooks/usePools';

const routerAbi = routerABI.abi;

// ==================== РАБОТА С ТОКЕНАМИ ====================

/**
 * Получает объект всех доступных токенов из пулов
 * @param pools - массив пулов
 * @returns объект { [address: string]: tokenName }
 */
export const getAvailableTokens = (pools: Pool[]): Record<string, string> => {
  return pools.reduce((prev, curr) => {
    prev[curr.token0Address] = curr.token0Name;
    prev[curr.token1Address] = curr.token1Name;
    return prev;
  }, {} as Record<string, string>);
};

/**
 * Получает токены, с которыми можно обменять выбранный токен
 * @param pools - массив пулов
 * @param fromToken - адрес исходного токена
 * @returns объект { [address: string]: tokenName }
 */
export const getCounterpartTokens = (
  pools: Pool[], 
  fromToken: string
): Record<string, string> => {
  return pools
    .filter((pool) => pool.token0Address === fromToken || pool.token1Address === fromToken)
    .reduce((prev, curr) => {
      if (curr.token0Address === fromToken) {
        prev[curr.token1Address] = curr.token1Name;
      } else if (curr.token1Address === fromToken) {
        prev[curr.token0Address] = curr.token0Name;
      }
      return prev;
    }, {} as Record<string, string>);
};

/**
 * Находит пул по паре токенов
 * @param pools - массив пулов
 * @param fromToken - адрес исходного токена
 * @param toToken - адрес целевого токена
 * @returns объект пула или undefined
 */
export const findPoolByTokens = (
  pools: Pool[], 
  fromToken?: string, 
  toToken?: string
): Pool | undefined => {
  if (!Array.isArray(pools) || !fromToken || !toToken) return undefined;

  return pools.find((pool) =>
    (pool.token0Address === fromToken && pool.token1Address === toToken) ||
    (pool.token1Address === fromToken && pool.token0Address === toToken)
  );
};

// ==================== РАБОТА СО СТАТУСАМИ ====================

export interface OperationState {
  status: string;
  errorMessage?: string;
}

export const isOperationPending = (state: OperationState): boolean => {
  return state?.status === 'pending' || state?.status === 'mining';
};

export const isOperationFailed = (state: OperationState): boolean => {
  return state?.status === 'error' || state?.status === 'exception';
};

export const isOperationSucceeded = (state: OperationState): boolean => {
  return state?.status === 'success';
};

export const getFailureMessage = (
  approveState: OperationState,
  swapState: OperationState
): string | undefined => {
  if (isOperationPending(approveState) || isOperationPending(swapState)) {
    return undefined;
  }

  if (isOperationFailed(approveState)) {
    return `Approval failed - ${approveState.errorMessage || 'Unknown error'}`;
  }

  if (isOperationFailed(swapState)) {
    return `Swap failed - ${swapState.errorMessage || 'Unknown error'}`;
  }

  return undefined;
};

export const getSuccessMessage = (
  approveState: OperationState,
  swapState: OperationState
): string | undefined => {
  if (isOperationPending(approveState) || isOperationPending(swapState)) {
    return undefined;
  }

  if (isOperationSucceeded(swapState)) {
    return 'Swap executed successfully';
  }

  if (isOperationSucceeded(approveState)) {
    return 'Approval successful';
  }

  return undefined;
};

// ==================== РАБОТА С ROUTER ====================

interface UseAmountsOutParams {
  amountIn: bigint;
  fromToken?: `0x${string}`;
  toToken?: `0x${string}`;
}

/**
 * Хук для получения ожидаемого количества токенов на выходе
 * @param params - параметры: amountIn, fromToken, toToken
 * @returns bigint - ожидаемое количество токенов
 */
export const useAmountsOut = ({ 
  amountIn, 
  fromToken, 
  toToken 
}: UseAmountsOutParams): bigint => {
  const isValidAmountIn = amountIn > 0n;
  const areParamsValid = !!(fromToken && toToken && isValidAmountIn);

  const { data, error } = useReadContract({
    address: ROUTER_ADDRESS,
    abi: routerAbi,
    functionName: 'getAmountsOut',
    args: areParamsValid ? [amountIn, [fromToken, toToken]] : undefined,
    query: {
      enabled: areParamsValid,
    },
  });

  if (error || !data || !Array.isArray(data) || data.length < 2) {
    return 0n;
  }

  return data[1] as bigint;
};

// ==================== UI ХЕЛПЕРЫ ====================

import type { RefObject } from 'react';

/**
 * Хук для обработки кликов вне элемента
 * @param ref - ссылка на элемент
 * @param handler - функция-обработчик
 */
export const useOnClickOutside = (
  ref: RefObject<HTMLElement>,
  handler: (event: MouseEvent | TouchEvent) => void
): void => {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler(event);
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
};