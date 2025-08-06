import { useState, useEffect } from 'react';
import { createWalletClient, custom, WalletClient } from 'viem';
import { getAccount, readContract } from '@wagmi/core';
import { CONTRACT_ADDRESS, ABI } from './contract';

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

export function getWalletClient(account: `0x${string}`): WalletClient | null {
  if (
    typeof window === 'undefined' ||
    typeof window.ethereum === 'undefined'
  ) {
    return null;
  }

  return createWalletClient({
    account,
    chain: somniaChain,
    transport: custom(window.ethereum as any),
  });
}

export async function connectWallet(): Promise<string> {
  if (
    typeof window === 'undefined' ||
    typeof window.ethereum === 'undefined'
  ) {
    throw new Error('MetaMask not detected');
  }

  const accounts = (await (window.ethereum as any).request({
    method: 'eth_requestAccounts',
  })) as string[];

  return accounts[0];
}

export async function getUserStatus(walletAddress: string): Promise<{
  gameCoin: bigint;
  points: bigint;
}> {
  const [gameCoin, points] = (await readContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: 'getUserStatus',
    args: [walletAddress],
    chainId: 50312,
  })) as [bigint, bigint];

  return { gameCoin, points };
}

export async function getCooldownLeft(walletAddress: string): Promise<bigint> {
  return (await readContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: 'getCooldownLeft',
    args: [walletAddress],
    chainId: 50312,
  })) as bigint;
}

export function useWallet(): {
  client: WalletClient | null;
  connectWallet: () => Promise<string>;
} {
  const [client, setClient] = useState<WalletClient | null>(null);
  const account = getAccount().address as `0x${string}` | undefined;

  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      typeof window.ethereum !== 'undefined' &&
      account
    ) {
      const client = createWalletClient({
        account,
        chain: somniaChain,
        transport: custom(window.ethereum as any),
      });
      setClient(client);
    }
  }, [account]);

  return {
    client,
    connectWallet,
  };
}

