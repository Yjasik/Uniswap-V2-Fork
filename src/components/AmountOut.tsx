"use client";

import React, { useState, useEffect, useRef } from "react";
import { formatUnits } from "viem";
import Image from "next/image";
import { useAmountsOut, useOnClickOutside } from "@/utils";
import styles from "@/styles";

interface AmountOutProps {
  fromToken?: `0x${string}`;
  toToken?: `0x${string}`;
  amountIn: bigint;
  pairAddress?: `0x${string}`;
  currencyValue?: string;
  onSelect: (token: string) => void;
  currencies: Record<string, string>;
}

const AmountOut: React.FC<AmountOutProps> = ({ 
  fromToken, 
  toToken, 
  amountIn, 
  pairAddress, 
  currencyValue, 
  onSelect, 
  currencies 
}) => {
  const [showList, setShowList] = useState<boolean>(false);
  const [activeCurrency, setActiveCurrency] = useState<string>("Select");
  const ref = useRef<HTMLUListElement>(null);

  const amountOut = useAmountsOut({ amountIn, fromToken, toToken });

  useOnClickOutside(ref as React.RefObject<HTMLElement>, () => setShowList(false));

  useEffect(() => {
    if (currencyValue && Object.keys(currencies).includes(currencyValue)) {
      setActiveCurrency(currencies[currencyValue]);
    } else {
      setActiveCurrency("Select");
    }
  }, [currencyValue, currencies]);

  const formattedAmountOut = amountOut ? formatUnits(amountOut, 18) : "0.0";

  if (!toToken) {
    return (
      <div className={styles.amountContainer}>
        <input
          placeholder="0.0"
          type="number"
          value="0.0"
          className={styles.amountInput}
          disabled
          readOnly
        />
        <div className="relative" onClick={() => setShowList(!showList)}>
          <button className={styles.currencyButton} type="button">
            <span>Select</span>
            <Image
              src="/chevron-down.svg" 
              alt="chevron-down"
              width={16}
              height={16}
              className={`ml-2 transition-transform duration-200 ${
                showList ? "rotate-180" : "rotate-0"
              }`}
            />
          </button>
          {showList && (
            <ul ref={ref} className={styles.currencyList}>
              {Object.entries(currencies).map(([tokenAddress, tokenName]) => (
                <li
                  key={tokenAddress}
                  className={`${styles.currencyListItem} cursor-pointer ${
                    activeCurrency === tokenName ? "bg-site-dim2" : ""
                  }`}
                  onClick={() => {
                    onSelect(tokenAddress);
                    setActiveCurrency(tokenName);
                    setShowList(false);
                  }}
                >
                  {tokenName}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.amountContainer}>
      <input
        placeholder="0.0"
        type="number"
        value={formattedAmountOut}
        className={styles.amountInput}
        disabled
        readOnly
      />

      <div className="relative" onClick={() => setShowList(!showList)}>
        <button className={styles.currencyButton} type="button">
          <span>{activeCurrency}</span>
          <Image
            src="/chevron-down.svg" 
            alt="chevron-down"
            width={16}
            height={16}
            className={`ml-2 transition-transform duration-200 ${
              showList ? "rotate-180" : "rotate-0"
            }`}
          />
        </button>

        {showList && (
          <ul ref={ref} className={styles.currencyList}>
            {Object.entries(currencies).map(([tokenAddress, tokenName]) => (
              <li
                key={tokenAddress}
                className={`${styles.currencyListItem} cursor-pointer ${
                  activeCurrency === tokenName ? "bg-site-dim2" : ""
                }`}
                onClick={() => {
                  onSelect(tokenAddress);
                  setActiveCurrency(tokenName);
                  setShowList(false);
                }}
              >
                {tokenName}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AmountOut;