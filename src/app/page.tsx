"use client"
import HomeContent from "@/components/HomeContent"
import styles from "@/styles"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { useAccount } from "wagmi"
import { usePools } from "@/hooks/usePools" 

export default function Home() {
    const { isConnected } = useAccount()
    const [loading, pools] = usePools()

    if (loading) {
      return (
        <div className={styles.container}>
          <div className={styles.innerContainer}>
            <div className={styles.message}>Loading dApp...</div>
          </div>
        </div>
      );
    }

    return (
      <div className={styles.container}>
        {!isConnected ? (
          <div className={styles.innerContainer}>  
            <header className={styles.header}>
              <div className="flex items-center gap-2">
                <img 
                  src="/LogoUniswap.png" 
                  alt="Uniswap Logo" 
                  className="w-16 h-16"
                />
              </div>
              <ConnectButton/>
            </header>
                
            <div className={styles.exchangeContainer}>
              <h1 className={styles.headTitle}>Uniswap 2.0</h1>
              <div className={styles.exchangeBoxWrapper}>
                <p className={styles.subTitle}>
                  Please connect a wallet to start swapping . . .
                </p>
              </div>
              <img 
                  src="/logoEther.png" 
                  alt="Ether Logo" 
                  className="w-64 h-64"
                />
            </div>
          </div>
        ) : (
            <HomeContent pools={pools}/>
        )}
      </div>
    )
}