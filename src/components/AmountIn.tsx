"use client";

import React, { useState, useEffect, useRef } from "react";
import styles from "../styles";
import Image from "next/image";
import { useOnClickOutside } from "@/utils";

interface AmountInProps {
  value: string;
  onChange: (value: string) => void;
  currencyValue?: string;
  onSelect: (token: string) => void;
  currencies: Record<string, string>;
  isSwapping: boolean;
}

const AmountIn: React.FC<AmountInProps> = ({
  value,
  onChange,
  currencyValue,
  onSelect,
  currencies,
  isSwapping,
}) => {
  const [showList, setShowList] = useState<boolean>(false);
  const [activeCurrency, setActiveCurrency] = useState<string>("Select");
  const ref = useRef<HTMLUListElement>(null);

  useOnClickOutside(ref as React.RefObject<HTMLElement>, () => setShowList(false));

  useEffect(() => {
    if (currencyValue && Object.keys(currencies).includes(currencyValue)) {
      setActiveCurrency(currencies[currencyValue]);
    } else {
      setActiveCurrency("Select");
    }
  }, [currencies, currencyValue]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleSelectClick = () => {
    setShowList(!showList);
  };

  const handleTokenSelect = (token: string, tokenName: string) => {
    onSelect(token);
    setActiveCurrency(tokenName);
    setShowList(false);
  };

  return (
    <div className={styles.amountContainer}>
      <input
        placeholder="0.0"
        type="number"
        value={value}
        disabled={isSwapping}
        onChange={handleInputChange}
        className={styles.amountInput}
        min="0"
        step="any"
      />

      <div className="relative" onClick={handleSelectClick}>
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
                className={`${styles.currencyListItem} ${
                  activeCurrency === tokenName ? "bg-site-dim2" : ""
                } cursor-pointer`}
                onClick={() => handleTokenSelect(tokenAddress, tokenName)}
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

export default AmountIn;