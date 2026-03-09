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
  symbol 
}) => {
  if (!tokenBalance) return null;

  const formattedBalance = formatUnits(tokenBalance, decimals);
  
  return (
    <div className={styles.balance}>
      <p className={styles.balanceText}>
        <span className={styles.balanceBold}>Balance: </span>
        {formattedBalance} {symbol}
      </p>
    </div>
  );
};

export default Balance;