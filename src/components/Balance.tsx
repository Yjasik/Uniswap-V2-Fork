import React from "react";
import { formatUnits } from "viem";
import styles from "../styles";

interface BalanceProps {
  tokenBalance?: bigint;
  decimals?: number;
  symbol?: string;
}

const Balance: React.FC<BalanceProps> = ({ 
  tokenBalance, 
  decimals = 18,
  symbol = 'ETH' 
}) => {
  const displayBalance = tokenBalance 
    ? formatUnits(tokenBalance, decimals) 
    : '0';
  
  return (
    <div className={styles.balance}>
      <p className={styles.balanceText}>
        <span className={styles.balanceBold}>Balance: </span>
        {displayBalance} {symbol}
      </p>
    </div>
  );
};

export default Balance;