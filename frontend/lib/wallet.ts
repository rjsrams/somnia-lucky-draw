import { createWalletClient, custom, WalletClient } from 'viem';
import { readContract } from '@wagmi/core';
import { getAccount } from '@wagmi/core';
import { wagmiConfig } from './wagmi';
import { CONTRACT_ADDRESS, ABI } from './contract';

interface EthereumProvider {
  isMetaMask?: boolean;
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on?: (...args: unknown[]) => void;
  removeListener?: (...args: unknown[]) => void;
}

const ethereum = typeof window !== 'undefined' ? (window.ethereum as EthereumProvider | undefined) : undefined;

const account = getAccount().address;

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

export const walletClient: WalletClient = createWalletClient({
  account,
  chain: somniaChain,
  transport: custom(ethereum!),
});

export async function connectWallet(): Promise<string> {
  if (!ethereum) {
    throw new Error('MetaMask not detected');
  }

  const accounts = await ethereum.request({
    method: 'eth_requestAccounts',
  }) as string[];

  return accounts[0];
}

export async function getUserStatus(walletAddress: string): Promise<{ gameCoin: bigint; points: bigint }> {
  const [gameCoin, points] = await readContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: 'getUserStatus',
    args: [walletAddress],
    chainId: 50312,
  }) as [bigint, bigint];

  return { gameCoin, points };
}

export async function getCooldownLeft(walletAddress: string): Promise<bigint> {
  return await readContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: 'getCooldownLeft',
    args: [walletAddress],
    chainId: 50312,
  }) as bigint;
}

