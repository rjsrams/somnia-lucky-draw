import Head from "next/head";
import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { playLuckyNumber, getUserStatus, getCooldownLeft } from "../lib/contract";
import { connectWallet } from "../lib/wallet";

export default function Home() {
  const [wallet, setWallet] = useState<string | null>(null);
  const [guess, setGuess] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [gameCoin, setGameCoin] = useState<number>(0);
  const [points, setPoints] = useState<number>(0);
  const [cooldown, setCooldown] = useState(0);
  const [cooldownText, setCooldownText] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchStatus = useCallback(async () => {
    if (!wallet) return;
    const { gameCoin, points } = await getUserStatus(wallet);
    const cooldownLeft = await getCooldownLeft();
    setGameCoin(gameCoin);
    setPoints(points);
    setCooldown(cooldownLeft);
  }, [wallet]);

  useEffect(() => {
    if (wallet) {
      fetchStatus();
    }
  }, [wallet, fetchStatus]);

  useEffect(() => {
    if (cooldown > 0) {
      const interval = setInterval(() => {
        setCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setCooldownText("");
            return 0;
          }
          const mins = Math.floor((prev - 1) / 60);
          const secs = (prev - 1) % 60;
          setCooldownText(`${mins}m ${secs}s`);
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [cooldown]);

  const handleConnect = async () => {
    try {
      const addr = await connectWallet();
      setWallet(addr);
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert("Unknown error occurred.");
      }
    }
  };

  const handleGuess = async () => {
    const num = parseInt(guess);
    if (isNaN(num) || num < 1 || num > 3) {
      setResult("Please enter a number between 1 and 3.");
      return;
    }

    setLoading(true);
    try {
      const res = await playLuckyNumber(num);
      setResult(res.success ? "Correct Guess 🎉 (+5 pts)" : "Wrong Guess 😢 (+1 pt)");
      setHistory((prev) => [
        `Guess: ${num} → ${res.success ? "Correct (+5)" : "Wrong (+1)"}`,
        ...prev,
      ]);
      await fetchStatus();
    } catch (e: unknown) {
      if (e instanceof Error) {
        setResult(e.message);
      } else {
        setResult("Unknown error occurred.");
      }
    } finally {
      setLoading(false);
      setGuess("");
    }
  };

  const clearHistory = () => {
    setHistory([]);
    setResult(null);
  };

  const isConnected = Boolean(wallet);

  return (
    <>
      <Head>
        <title>Lucky Number Game</title>
      </Head>
      <main
        className={`min-h-screen flex flex-col items-center justify-center p-4 text-white ${
          isConnected
            ? "bg-gradient-to-br from-blue-800 via-purple-700 to-black"
            : "bg-pink-400"
        }`}
      >
        <Image
          src="/somnia-logo.png"
          alt="Somnia Logo"
          width={96}
          height={96}
          className="mb-4 rounded-full shadow-lg"
        />
        <h1 className="text-4xl font-bold mb-4">🎯 Lucky on Somnia</h1>

        <button
          onClick={wallet ? () => setWallet(null) : handleConnect}
          className={`mb-4 text-sm font-semibold px-4 py-2 rounded transition ${
            wallet
              ? "bg-yellow-400 text-black hover:bg-yellow-300"
              : "bg-white text-gray-800 hover:bg-gray-100"
          }`}
        >
          {wallet
            ? `Disconnect (${wallet.slice(0, 6)}...${wallet.slice(-4)})`
            : "Connect Wallet"}
        </button>

        {isConnected && (
          <div className="mb-4 font-semibold bg-blue-600 bg-opacity-30 px-4 py-2 rounded shadow">
            🎮 GameCoin: {gameCoin} &nbsp; | &nbsp; ⭐ Points: {points}
          </div>
        )}

        {cooldown > 0 && (
          <div className="text-yellow-300 font-medium mb-2">
            ⏳ Cooldown: {cooldownText || `${Math.floor(cooldown / 60)}m ${cooldown % 60}s`}
          </div>
        )}

        <input
          type="number"
          min={1}
          max={3}
          value={guess}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGuess(e.target.value)}
          placeholder="Enter a number between 1 and 3"
          className="p-2 rounded w-72 mb-3 text-white placeholder-white bg-black bg-opacity-30 border-2 border-purple-400 focus:outline-none focus:ring focus:ring-purple-300"
        />

        <button
          onClick={handleGuess}
          className={`text-white px-4 py-2 rounded font-semibold ${
            loading || cooldown > 0
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-600 hover:bg-green-700"
          }`}
          disabled={loading || cooldown > 0}
        >
          {loading ? "Submitting..." : "Submit Guess"}
        </button>

        {result && <p className="mt-4 text-lg font-medium">{result}</p>}

        <div className="mt-8 w-full max-w-md bg-white p-4 rounded-lg shadow-lg border border-gray-200">
          <h2 className="text-xl font-semibold mb-2 text-black">Guess History:</h2>
          <button
            onClick={clearHistory}
            className="text-sm bg-red-600 text-white px-3 py-1 rounded mb-2 hover:bg-red-700 transition"
          >
            Clear History
          </button>
          <ul className="list-disc list-inside space-y-1">
            {history.map((entry, i) => (
              <li key={i} className="text-yellow-600 font-medium">
                {entry}
              </li>
            ))}
          </ul>
        </div>
      </main>
    </>
  );
}

