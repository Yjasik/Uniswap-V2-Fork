import { ConnectButton } from "@rainbow-me/rainbowkit";
import Image from "next/image";
import styles from "../styles";

export default function Home() {
  return (
    <div className={`${styles.container} flex flex-col`}>
      {/* Шапка прижата к верху */}
      <header className={`${styles.header} mt-0`}>
        <div className="flex items-center gap-2">
          {/* Просто используем тег img, если не нужна оптимизация */}
          <img 
            src="/LogoUniswap.png" 
            alt="Uniswap Logo" 
            className="w-20 h-20"
          />
          <h1 className={styles.headTitle}>Uniswap 2.0</h1>
        </div>
        <ConnectButton />
      </header>
      
      {/* Контент растягивается на оставшееся место */}
      <div className="flex-1 flex justify-center items-start">
        <div className={styles.exchangeContainer}>
          {/* здесь будет интерфейс обмена */}
        </div>
      </div>
    </div>
  )
}