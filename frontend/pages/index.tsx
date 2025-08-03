'use client';

import { useEffect, useCallback, useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { readContract, writeContract } from 'viem/actions';
import { publicClient, walletClient } from '@/lib/contract';
import { wagmiConfig } from '@/lib/wagmi';
import { parseAbi } from 'viem';
import { CONTRACT_ADDRESS, ABI } from '@/lib/contract';
import { getGameStatus, getUserStatus, getCooldownLeft } from '@/lib/wallet';

export default function Home() {
  const [wallet, setWallet] = useState('');
  const [status, setStatus] = useState('');
  const [gameCoin, setGameCoin] = useState(0);
  const [points, setPoints] = useState(0);
  const [cooldown, setCooldown] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchWallet = useCallback(async () => {
    const accounts = await walletClient.getAddresses();
    setWallet(accounts[0]);
  }, []);

  const fetchStatus = useCallback(async () => {
    if (!wallet) return;
    const { gameCoin, points } = await getUserStatus(wallet);
    const cooldownLeft = await getCooldownLeft();
    setGameCoin(Number(gameCoin));
    setPoints(Number(points));
    setCooldown(cooldownLeft);
  }, [wallet]);

  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  useEffect(() => {
    if (wallet) fetchStatus();
  }, [wallet, fetchStatus]);

  const play = async () => {
    try {
      setLoading(true);
      setStatus('Playing...');
      await writeContract(wagmiConfig, {
        abi: ABI,
        address: CONTRACT_ADDRESS,
        functionName: 'playGame',
        account: wallet,
      });
      setStatus('Success! 🎉');
    } catch (error) {
      console.error(error);
      setStatus('Failed to play');
    } finally {
      await fetchStatus();
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      <ConnectButton />
      <div className="mt-8 text-center">
        <h1 className="text-2xl font-bold mb-2">🎲 Somnia Lucky Draw</h1>
        {wallet && (
          <>
            <p className="mb-2">Wallet: {wallet}</p>
            <p className="mb-2">Game Coin: {gameCoin}</p>
            <p className="mb-2">Points: {points}</p>
            <p className="mb-4">
              {cooldown > 0
                ? `⏳ Cooldown: ${cooldown} seconds left`
                : '✅ Ready to play'}
            </p>
            <button
              onClick={play}
              disabled={cooldown > 0 || loading}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded disabled:bg-gray-400"
            >
              {loading ? 'Playing...' : 'Play Now'}
            </button>
            <p className="mt-4">{status}</p>
          </>
        )}
      </div>
    </main>
  );
}

