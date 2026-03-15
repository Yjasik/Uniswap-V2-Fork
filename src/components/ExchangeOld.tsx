"use client";

import { useAccount, useBalance, useReadContract, useWriteContract, useReadContracts } from "wagmi";

import React, { useEffect, useState } from "react";
import { parseUnits, formatUnits } from "viem";
import { 
  getAvailableTokens, 
  getCounterpartTokens, 
  findPoolByTokens, 
  isOperationPending, 
  getFailureMessage, 
  getSuccessMessage 
} from "@/utils";
import { ROUTER_ADDRESS } from "@/constants/addresses";
import AmountIn from "./AmountIn";
import AmountOut from "./AmountOut";
import Balance from "./Balance";
import styles from "@/styles";
import type { Pool } from "@/hooks/usePools";
import routerABI from "@/abis/UniswapV2Router02.json";
import erc20ABI from "@/abis/ERC20.json";

const routerAbi = routerABI.abi;
const erc20Abi = erc20ABI.abi;

interface ExchangeOldProps {
  pools: Pool[];
}

type TransactionStatus = 'idle' | 'pending' | 'success' | 'error';

const ExchangeOld: React.FC<ExchangeOldProps> = ({ pools }) => {
  console.log("pools in Exchange:", pools);
  
  const { address } = useAccount();
  const [fromValue, setFromValue] = useState<string>("");
  const [fromToken, setFromToken] = useState<string>("");
  const [toToken, setToToken] = useState<string>("");
  const [resetState, setResetState] = useState<boolean>(false);
  
  const [approveStatus, setApproveStatus] = useState<TransactionStatus>('idle');
  const [swapStatus, setSwapStatus] = useState<TransactionStatus>('idle');
  const [approveError, setApproveError] = useState<string | null>(null);
  const [swapError, setSwapError] = useState<string | null>(null);

  // Получаем decimals для обоих токенов
  const { data: tokensDecimals } = useReadContracts({
    contracts: [
      {
        address: fromToken as `0x${string}`,
        abi: erc20Abi,
        functionName: 'decimals',
      },
      {
        address: toToken as `0x${string}`,
        abi: erc20Abi,
        functionName: 'decimals',
      }
    ],
    query: {
      enabled: !!fromToken && !!toToken,
    }
  });
  
  const fromDecimals = tokensDecimals?.[0]?.result as number || 18;
  const toDecimals = tokensDecimals?.[1]?.result as number || 18;
  
  // Правильный парсинг с учетом decimals
  const fromValueBigInt = fromValue 
    ? parseUnits(fromValue, fromDecimals) 
    : 0n;
  
  // Для getAmountsOut используем реальные decimals
  const { data: amountsOut } = useReadContract({
    address: ROUTER_ADDRESS,
    abi: routerAbi,
    functionName: 'getAmountsOut',
    args: [fromValueBigInt, [fromToken, toToken]],
    query: {
      enabled: fromValueBigInt > 0n && !!fromToken && !!toToken,
    }
  });
  
  // Ожидаемое количество уже в правильных decimals для выходного токена
  const amountsArray = amountsOut as bigint[] | undefined;
  const expectedOut = amountsArray?.[amountsArray.length - 1] ?? 0n;
  const amountOutMin = expectedOut * 50n / 100n;
  
  // Для отображения в UI форматируем обратно
  const displayExpectedOut = expectedOut 
    ? Number(formatUnits(expectedOut, toDecimals)).toFixed(4)
    : '0';
  
  // ================================================================

  // Проверка загрузки пулов
  if (!pools) {
    return <div className={styles.message}>Loading pools data...</div>;
  }
  if (pools.length === 0) {
    return <div className={styles.message}>No liquidity pools available</div>;
  }

  // Эффект для установки начального токена после загрузки пулов
  useEffect(() => {
    if (pools.length > 0 && !fromToken) {
      setFromToken(pools[0].token0Address);
    }
  }, [pools, fromToken]);

  // Создаем объекты для хелперов
  const approveState = {
    status: approveStatus,
    errorMessage: approveError || undefined,
  };

  const swapState = {
    status: swapStatus,
    errorMessage: swapError || undefined,
  };

  const isPending = isOperationPending(approveState) || isOperationPending(swapState);
  const failureMessage = getFailureMessage(approveState, swapState);
  const successMessage = getSuccessMessage(approveState, swapState);

  const availableTokens = getAvailableTokens(pools);
  const counterpartTokens = getCounterpartTokens(pools, fromToken);
  const pairAddress = findPoolByTokens(pools, fromToken, toToken)?.address;

  const { data: fromTokenBalance } = useBalance({
    address: address,
    token: fromToken as `0x${string}`,
    query: { enabled: !!address && !!fromToken },
  });

  const { data: toTokenBalance } = useBalance({
    address: address,
    token: toToken as `0x${string}`,
    query: { enabled: !!address && !!toToken },
  });

  // 👇 ДОБАВЛЯЕМ refetch для allowance
  const { data: tokenAllowance, refetch: refetchAllowance } = useReadContract({
    address: fromToken as `0x${string}`,
    abi: erc20Abi,
    functionName: 'allowance',
    args: [address, ROUTER_ADDRESS],
    query: {
      enabled: !!address && !!fromToken,
    }
  });

  // 👇 Логируем при каждом изменении allowance
  useEffect(() => {
    if (tokenAllowance !== undefined) {
      console.log("💰 Token allowance updated:", tokenAllowance.toString());
    }
  }, [tokenAllowance]);

  // 👇 Обновляем allowance при изменении fromValue
  useEffect(() => {
    if (fromValueBigInt > 0n && fromToken) {
      refetchAllowance();
    }
  }, [fromValueBigInt, fromToken, refetchAllowance]);

  const approvedNeeded = fromValueBigInt > 0n && 
    tokenAllowance !== undefined && 
    fromValueBigInt > (tokenAllowance as bigint);

  // Добавляем отладку
  console.log("💰 Token allowance:", tokenAllowance?.toString());
  console.log("📊 fromValueBigInt:", fromValueBigInt.toString());
  console.log("✅ Need approve:", approvedNeeded);
  
  const formValueIsGreaterThan0 = fromValueBigInt > 0n;
  const hasEnoughBalance = fromTokenBalance && 
    fromValueBigInt <= fromTokenBalance.value;

  const { writeContract: approveWrite } = useWriteContract();
  const { writeContract: swapWrite } = useWriteContract();

  const isApproving = approveStatus === 'pending';
  const isSwapping = swapStatus === 'pending';
  const canApprove = !isApproving && !!approvedNeeded;
  const canSwap = !approvedNeeded && !isSwapping && formValueIsGreaterThan0 && !!hasEnoughBalance;

  // 👇 ОБНОВЛЯЕМ onApproveRequested с refetch
  const onApproveRequested = () => {
    setApproveStatus('pending');
    setApproveError(null);
    
    approveWrite({
      address: fromToken as `0x${string}`,
      abi: erc20Abi,
      functionName: 'approve',
      args: [ROUTER_ADDRESS, 2n ** 256n - 1n],
    }, {
      onSuccess: () => {
        setApproveStatus('success');
        // 👇 ВАЖНО: обновляем allowance после успешного approve
        refetchAllowance();
        console.log("✅ Approve successful, refetching allowance...");
      },
      onError: (error) => {
        setApproveStatus('error');
        setApproveError(error.message);
      },
    });
  };

  // ========== ИСПРАВЛЕННАЯ ФУНКЦИЯ SWAP С ОТЛАДКОЙ ==========
  const onSwapRequested = () => {
    setSwapStatus('pending');
    setSwapError(null);
    
    // Проверяем, что получили ожидаемое количество
    if (expectedOut === 0n && fromValueBigInt > 0n) {
      setSwapStatus('error');
      setSwapError('Failed to get exchange rate. Amount may be too small.');
      return;
    }

    // Проверяем allowance перед swap
    if (approvedNeeded) {
      setSwapStatus('error');
      setSwapError('Please approve first. Token allowance: ' + (tokenAllowance?.toString() || '0'));
      return;
    }

    // Логируем параметры для отладки
    console.log("🔄 Swap params:", {
      fromValue: fromValue,
      fromValueBigInt: fromValueBigInt.toString(),
      expectedOut: expectedOut.toString(),
      amountOutMin: amountOutMin.toString(),
      fromToken,
      toToken,
      path: [fromToken, toToken],
      deadline: BigInt(Math.floor(Date.now() / 1000) + 60 * 20).toString()
    });

    // Проверяем allowance
    console.log("📝 Token allowance:", tokenAllowance?.toString());
    console.log("📝 Approved needed:", approvedNeeded);

    swapWrite({
      address: ROUTER_ADDRESS,
      abi: routerAbi,
      functionName: 'swapExactTokensForTokens',
      args: [
        fromValueBigInt,
        amountOutMin,
        [fromToken, toToken],
        address,
        BigInt(Math.floor(Date.now() / 1000) + 60 * 20), // +20 минут
      ],
      gas: 1500000n,           // 1.5M газа (достаточно для swap)
      gasPrice: 1000000000n,    // 1 Gwei (дешево для теста)
    }, {
      onSuccess: (data) => {
        console.log("✅ Swap successful! Transaction hash:", data);
        setSwapStatus('success');
        setFromValue("");
        // 👇 Обновляем allowance после успешного swap
        refetchAllowance();
      },
      onError: (error) => {
        console.error("❌ Swap error details:", error);
        setSwapStatus('error');
        setSwapError(error.message);
      },
    });
  };
  // =================================================================

  const onFromValueChange = (value: string) => {
    setFromValue(value);
  };

  const onFromTokenChange = (token: string) => {
    setFromToken(token);
    setToToken("");
  };

  const onToTokenChange = (token: string) => {
    setToToken(token);
  };

  useEffect(() => {
    if (failureMessage || successMessage) {
      setTimeout(() => {
        setResetState(true);
        setFromValue("");
        setToToken("");
        setApproveStatus('idle');
        setSwapStatus('idle');
        setApproveError(null);
        setSwapError(null);
      }, 5000);
    }
  }, [failureMessage, successMessage]);

  useEffect(() => {
    if (resetState) {
      setResetState(false);
    }
  }, [resetState]);

  return (
    <div className="flex flex-col w-full items-center">
      <div className="mb-8">
        <AmountIn
          value={fromValue}
          onChange={onFromValueChange}
          currencyValue={fromToken}
          onSelect={onFromTokenChange}
          currencies={availableTokens}
          isSwapping={isSwapping && !!hasEnoughBalance}
        />
        <Balance 
          tokenBalance={fromTokenBalance?.value} 
          decimals={fromTokenBalance?.decimals}
          symbol={fromTokenBalance?.symbol}
        />
      </div>

      <div className="mb-8 w-full">
        <AmountOut
          fromToken={fromToken as `0x${string}`}
          toToken={toToken as `0x${string}`}
          amountIn={fromValueBigInt}
          pairAddress={pairAddress}
          currencyValue={toToken}
          onSelect={onToTokenChange}
          currencies={counterpartTokens}
        />
        <Balance 
          tokenBalance={toTokenBalance?.value} 
          decimals={toTokenBalance?.decimals}
          symbol={toTokenBalance?.symbol}
        />
      </div>

      {approvedNeeded && !isSwapping ? (
        <button
          disabled={!canApprove}
          onClick={onApproveRequested}
          className={`${
            canApprove
              ? "bg-site-pink text-white"
              : "bg-site-dim2 text-site-dim2"
          } ${styles.actionButton}`}
        >
          {isApproving ? "Approving..." : "Approve"}
        </button>
      ) : (
        <button
          disabled={!canSwap}
          onClick={onSwapRequested}
          className={`${
            canSwap ? "bg-site-pink text-white" : "bg-site-dim2 text-site-dim2"
          } ${styles.actionButton}`}
        >
          {isSwapping
            ? "Swapping..."
            : hasEnoughBalance
            ? "Swap"
            : "Insufficient balance"}
        </button>
      )}

      {/* 👇 Временная кнопка для отладки */}
      {process.env.NODE_ENV === 'development' && (
        <button 
          onClick={() => refetchAllowance()}
          className="text-xs text-gray-500 mt-2 underline"
        >
          🔄 Refresh allowance (debug)
        </button>
      )}

      {expectedOut === 0n && fromValueBigInt > 0n && fromToken && toToken && (
        <p className="text-yellow-500 mt-2">
          ⚠️ Amount too small - will receive 0 tokens
        </p>
      )}

      {failureMessage && !resetState ? (
        <p className={styles.message}>{failureMessage}</p>
      ) : successMessage ? (
        <p className={styles.message}>{successMessage}</p>
      ) : null}
    </div>
  );
};

export default ExchangeOld;