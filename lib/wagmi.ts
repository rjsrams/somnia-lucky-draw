import { createConfig, configureChains } from 'wagmi'
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc'

const somniaTestnet = {
  id: 50312,
  name: 'Somnia Testnet',
  nativeCurrency: { name: 'Somnia Token', symbol: 'STT', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://dream-rpc.somnia.network/'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Shannon Explorer',
      url: 'https://shannon-explorer.somnia.network/',
    },
    alternative: {
      name: 'SocialScan',
      url: 'https://somnia-testnet.socialscan.io/',
    },
  },
}

export const { chains, publicClient } = configureChains(
  [somniaTestnet],
  [jsonRpcProvider({ rpc: () => ({ http: 'https://dream-rpc.somnia.network/' }) })]
)

export const wagmiConfig = createConfig({
  autoConnect: true,
  publicClient,
})

export const somniaChains = [somniaTestnet];
export const wagmiConfig = createConfig({
  autoConnect: true,
  publicClient,
})

