import React, { useEffect, useState } from "react";
import AmountIn from "./AmountIn";
import AmountOut from "./AmountOut"
import Balance from "./Balance";
import  { getAvailableTokens, getCounterpartTokens, findPoolByTokens, isOperationPending, getFailureMessage, getSuccessMessage } from '../utils';


export default function Exchange() {
    const [amountIn, setAmountIn] = useState("1.5");
    const [selectedToken, setSelectedToken] = useState("0x123...");
    const userBalance = BigInt(1827)

    const testCurrencies = {
    "0x1234567890123456789012345678901234567890": "Wrapped Ether",
    "0x2345678901234567890123456789012345678901": "USD Coin",
    "0x3456789012345678901234567890123456789012": "Dai Stablecoin",
    "0x4567890123456789012345678901234567890123": "Uniswap"
  };
    return (
    <div className="flex flex-col w-full items-center">
      <div className="p-8">
        <AmountIn
          value={amountIn}
          onChange={setAmountIn}
          currencyValue={selectedToken}
          onSelect={setSelectedToken}
          currencies={testCurrencies}
          isSwapping={false}
        />
        <Balance 
          tokenBalance={userBalance}  // bigint из viem
          decimals={18}                // decimals токена (по умолчанию 18)
          symbol="WETH"                 // символ токена (опционально)
        />      
      </div>
      <div className="mb-8 w-[100%]">
        <AmountOut
          fromToken={fromToken}
          toToken={toToken}
          amountIn={fromValueBigNumber}
          pairContract={pairAddress}
          currencyValue={toToken}
          onSelect={onToTokenChange}
          currencies={counterpartTokens}
        />
        <Balance tokenBalance={toTokenBalance} />
      </div>
    </div>
  );
}
