import { useEffect, useState } from "react";
import Image from "next/image";
import { useWallet } from "../lib/wallet";
import { checkLuckyNumber, playLuckyNumber } from "../lib/contract";

type PlayResult = {
  success: boolean;
};

export default function Home() {
  const { wallet, connectWallet } = useWallet();
  const [number, setNumber] = useState("");
  const [isWinner, setIsWinner] = useState<boolean | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNumber(event.target.value);
  };

  const fetchStatus = async () => {
    if (wallet) {
      const status = await checkLuckyNumber(wallet);
      setStatus(status);
    }
  };

  useEffect(() => {
    if (wallet) {
      fetchStatus();
    }
  }, [wallet, fetchStatus]);

  const handleGuess = async () => {
    if (!wallet) {
      alert("Please connect your wallet first.");
      return;
    }

    const num = parseInt(number);
    if (isNaN(num) || num < 1 || num > 10) {
      alert("Please enter a number between 1 and 10.");
      return;
    }

    setIsPlaying(true);
    try {
      const res: PlayResult = await playLuckyNumber(num);
      if (res.success) {
        setIsWinner(true);
        setStatus("Played");
      } else {
        setIsWinner(false);
        setStatus("Played");
      }
    } catch (error) {
      console.error("Error playing lucky number:", error);
      alert("Transaction failed. Please try again.");
    } finally {
      setIsPlaying(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <Image
        src="/somnia-logo.png"
        alt="Somnia Logo"
        width={96}
        height={96}
        className="mb-4 rounded-full shadow-lg"
      />
      <h1 className="text-4xl font-bold text-gray-800 mb-2">Somnia Lucky Draw</h1>
      <p className="text-gray-600 mb-6">Guess a number between 1 and 10</p>

      <input
        type="number"
        value={number}
        onChange={handleInputChange}
        className="border rounded px-3 py-2 mb-4 w-48 text-center"
        placeholder="Enter number"
        min="1"
        max="10"
      />
      <button
        onClick={handleGuess}
        disabled={isPlaying}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 mb-4"
      >
        {isPlaying ? "Checking..." : "Play"}
      </button>

      {!wallet && (
        <button
          onClick={connectWallet}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 mb-4"
        >
          Connect Wallet
        </button>
      )}

      {status && <p className="text-gray-700">Status: {status}</p>}
      {isWinner === true && <p className="text-green-600 font-semibold">🎉 You won!</p>}
      {isWinner === false && <p className="text-red-600 font-semibold">❌ Try again!</p>}
    </div>
  );
}

