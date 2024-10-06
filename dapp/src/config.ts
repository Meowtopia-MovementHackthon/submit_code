import { createConfig, http } from 'wagmi'
// import { mainnet, polygon, optimism, bscTestnet, bsc } from 'wagmi/chains'
import { injected, walletConnect } from 'wagmi/connectors'
import { createWeb3Modal } from '@web3modal/wagmi/react'
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config'
import { defineChain, fallback } from 'viem'
import { createAppKit } from '@reown/appkit/react'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
// import { binanceSmartChainTestnet } from '@reown/appkit/networks'

import type { CaipNetwork } from '@reown/appkit'

export const movementTestnet = {
    chainId: 30732,
    chainNamespace: 'eip155',
    currency: 'MOVE',
    explorerUrl: 'https://explorer.devnet.imola.movementlabs.xyz/',
    id: 'eip155:80084',
    name: 'Movement Testnet',
    rpcUrl: 'https://30732.rpc.thirdweb.com/',
} as CaipNetwork

export const CATNFT_CONTRACT_ADDRESS = "0xa174353DCcb50237224b354077e5C2846f4e43c6"
export const MATERIAL_CONTRACT_ADDRESS = "0xBe6899Fe97ee79b32f079a4C717329e6B8f2Ab90"
export const SOUNDBOUND_TOKEN_CONTRACT_ADDRESS = "0x6fa93001327E18e089De33fc4F819a074047acbC"

const projectId = "21a3f26d464eafa5b321df1285e2b660"
const metadata = {
    name: 'Meowtopia',
    description: 'AppKit Example',
    url: 'https://meowtopia-wallet-connect.vercel.app/', // origin must match your domain & subdomain
    icons: ['https://assets.reown.com/reown-profile-pic.png']
}

const networks = [movementTestnet]

export const wagmiAdapter = new WagmiAdapter({
    networks,
    projectId,
});

createAppKit({
    adapters: [wagmiAdapter],
    networks,
    projectId,
    defaultNetwork: movementTestnet,
    metadata,
    features: {
        analytics: true // Optional - defaults to your Cloud configuration
    }
})

declare module 'wagmi' {
    interface Register {
        config: typeof wagmiAdapter
    }
}