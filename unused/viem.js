import { createPublicClient, createWalletClient, custom, http } from "viem";
import { injected } from "wagmi/connectors";
import { NETWORK_CONFIG } from "../constants/config";

export const publicClient = createPublicClient({
  chain: {
    id: parseInt(NETWORK_CONFIG.chainId, 16),
    name: NETWORK_CONFIG.chainName,
    nativeCurrency: NETWORK_CONFIG.nativeCurrency,
    rpcUrls: {
      default: {
        http: NETWORK_CONFIG.rpcUrls,
      },
    },
    blockExplorers: {
      default: {
        url: NETWORK_CONFIG.blockExplorerUrls[0],
      },
    },
  },
  transport: http(NETWORK_CONFIG.rpcUrls[0]),
});

export const walletClient = createWalletClient({
  chain: publicClient.chain,
  transport: custom(window.ethereum),
});

