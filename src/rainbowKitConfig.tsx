"use client"

import { getDefaultConfig } from "@rainbow-me/rainbowkit"
import { sepolia, arbitrum, base, mainnet, optimism, anvil, zksync } from "wagmi/chains"

export default getDefaultConfig({
    appName: "Uniswap-V2-Fork",
    projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
    chains: [sepolia, mainnet, optimism, arbitrum, base, zksync, anvil],
    ssr: true,
})