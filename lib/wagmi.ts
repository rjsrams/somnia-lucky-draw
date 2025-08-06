import { createConfig, configureChains } from 'wagmi';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';
import { Chain } from 'wagmi/chains';
import { getDefaultWallets } from '@rainbow-me/rainbowkit';
import { publicProvider } from 'wagmi/providers/public';

const somniaChain = {
  id: 50312,
  name: 'Somnia Testnet',
  network: 'somnia-testnet',
  nativeCurrency: {
    name: 'Somnia Token',
    symbol: 'STT',
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ['https://dream-rpc.somnia.network'],
    },
    public: {
      http: ['https://dream-rpc.somnia.network'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Shannon Explorer',
      url: 'https://shannon-explorer.somnia.network',
    },
  },
  testnet: true,
};

export const { chains, publicClient } = configureChains(
  [somniaChain],
  [publicProvider()]
);

const { connectors } = getDefaultWallets({
  appName: 'Somnia Lucky Draw',
  projectId: 'd43dd09a15d1ffd798cbf30137b74a70',
  chains,
});

export const wagmiConfig = createConfig({
  autoConnect: true,
  connectors,
  publicClient,
});

