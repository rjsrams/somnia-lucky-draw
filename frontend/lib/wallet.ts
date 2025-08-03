import { createWalletClient, custom } from 'viem';
import { getAccount } from '@wagmi/core';
import { wagmiConfig } from './wagmi';
import { CONTRACT_ADDRESS, ABI } from './contract';
import { publicClient } from './wagmi';

export const walletClient = createWalletClient({
  account: getAccount(wagmiConfig).address,
  chain: wagmiConfig.chains[0],
  transport: custom(window.ethereum!),
});

type EthereumProvider = {
  isMetaMask?: boolean;
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
};

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

export async function connectWallet(): Promise<string> {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("MetaMask not detected");
  }

  const accounts = (await window.ethereum.request({
    method: "eth_requestAccounts",
  })) as string[];

  return accounts[0];
}

export async function getUserStatus(walletAddress: string): Promise<boolean> {
  return await publicClient.readContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: 'hasUserPlayed',
    args: [walletAddress],
  }) as boolean;
}

export async function getCooldownLeft(walletAddress: string): Promise<bigint> {
  return await publicClient.readContract({
    address: CONTRACT_ADDRESS,
    abi: ABI,
    functionName: 'getCooldownLeft',
    args: [walletAddress],
  }) as bigint;
}

