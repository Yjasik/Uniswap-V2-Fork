"use client";

import React, { useEffect, useState } from "react";
import { parseUnits, createPublicClient, http } from "viem";
import { sepolia } from "viem/chains";
import { 
  useAccount, 
  useBalance, 
  useReadContract, 
  useWriteContract 
} from "wagmi";
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
import { useAmountsOut } from "@/utils";

interface ExchangeProps {
  pools: Pool[];
}

const Exchange = () => {
  const dummyCurrencies = {
    "ETH": "Ethereum",
    "USDC": "USD Coin"
  };

  return (
    <div className="flex flex-col w-full items-center">
      <div className="mb-8">
        <AmountIn
        value="0.1"
          onChange={() => {}}
          currencyValue="ETH"
          onSelect={() => {}}
          currencies={dummyCurrencies}
          isSwapping={false}
          />
        <Balance/>
      </div>
      <div className="mb-8 w-full">
        <AmountOut
          fromToken="0x0000000000000000000000000000000000000000"
          toToken="0x0000000000000000000000000000000000000000"
          amountIn={100000000000000000n}
          pairAddress="0x0000000000000000000000000000000000000000"
          currencyValue="USDC"
          onSelect={() => {}}
          currencies={dummyCurrencies}
        />
        <Balance/>
      </div>
    </div>
  );
};

export default Exchange;