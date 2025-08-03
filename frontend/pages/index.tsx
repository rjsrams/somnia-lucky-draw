'use client';

import { useEffect, useCallback, useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { writeContract } from '@wagmi/core';
import { wagmiConfig } from '@/lib/wagmi';
import { CONTRACT_ADDRESS, ABI } from '@/lib/contract';
import { getUserStatus, getCooldownLeft } from '@/lib/wallet';
import { useAccount } from 'wagmi';

export default function Home() {
  const { address } = useAccount();
  const [status, setStatus] = useState('');
  const [gameCoin, setGameCoin] = useState(0);
  const [points, setPoints] = useState(0);
  const [cooldown, setCooldown] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchStatus = useCallback(async () => {
    if (!address) return;
    try {
      const { gameCoin, points } = await getUserStatus(address);
      const cooldownLeft = await getCooldownLeft(address);
      setGameCoin(Number(gameCoin));
      setPoints(Number(points));
      setCooldown(Number(cooldownLeft));
    } catch (err) {
      console.error('Failed to fetch status:', err);
    }
  }, [address]);

  useEffect(() => {
    if (address) fetchStatus();
  }, [address, fetchStatus]);

  const play = async () => {
    try {
      setLoading(true);
      setStatus('Playing...');
      await writeContract(wagmiConfig, {
        abi: ABI,
        address: CONTRACT_ADDRESS,
        functionName: 'playGame',
        account: address,
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
        {address && (
          <>
            <p className="mb-2">Wallet: {address}</p>
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

