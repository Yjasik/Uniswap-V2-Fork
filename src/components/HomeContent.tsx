import { ConnectButton } from "@rainbow-me/rainbowkit"
import Exchange from "@/components/Exchange"
import styles from "../styles"

export default function Home() {

  return (
      <div className={styles.innerContainer}>
        <header className={styles.header}>
          <img
            src="/LogoUniswap.png" 
            alt="Uniswap Logo" 
            className="w-16 h-16" 
          />
          <ConnectButton />
        </header>
        <div className={styles.exchangeContainer}>
          <h1 className={styles.headTitle}>Uniswap 2.0</h1>
          <p className={styles.subTitle}>Exchange your tokens</p>

          <div className={styles.exchangeBoxWrapper}>
            <div className={styles.exchangeBox}>
              <div className="pink_gradient" />
              <div className={styles.exchange}>
                <Exchange />
              </div>
              <div className="blue_gradient" />
            </div>
          </div>
        </div>
      </div>
  );
}