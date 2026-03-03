"use client"

import { getDefaultConfig } from "@rainbow-me/rainbowkit"
import { arbitrum, base, mainnet, optimism, anvil, zksync, sepolia } from "wagmi/chains"

export default getDefaultConfig({
    appName: "Uniswap-V2-Fork",
    projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
    chains: [mainnet, optimism, arbitrum, base, zksync, sepolia, anvil],
    ssr: true,
})