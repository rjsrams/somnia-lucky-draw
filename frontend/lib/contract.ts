import { ethers, Log } from "ethers";
import { LUCKY_NUMBER_ADDRESS, GAMECOIN_ADDRESS } from "../constants/addresses";
import LuckyNumberJson from "../constants/LuckyNumber.json";
import GameCoinJson from "../constants/GameCoin.json";

export const CONTRACT_ADDRESS = LUCKY_NUMBER_ADDRESS;
export const ABI = LuckyNumberJson.abi;

const LuckyNumberABI = LuckyNumberJson.abi;
const GameCoinABI = GameCoinJson.abi;

interface EthereumWindow extends Window {
  ethereum?: ethers.Eip1193Provider;
}
declare let window: EthereumWindow;

function checkAddress(address: string | undefined | null, name: string) {
  if (!address || address === ethers.ZeroAddress) {
    throw new Error(`${name} address is invalid: ${address}`);
  }
}

export async function playLuckyNumber(guess: number): Promise<{
  success: boolean;
  luckyNumber: number;
  pointsEarned: number;
}> {
  if (!window.ethereum) throw new Error("No crypto wallet found");

  checkAddress(GAMECOIN_ADDRESS, "GameCoin");
  checkAddress(LUCKY_NUMBER_ADDRESS, "LuckyNumber");

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  const gameCoinContract = new ethers.Contract(
    GAMECOIN_ADDRESS!,
    GameCoinABI,
    signer
  );
  const luckyNumberContract = new ethers.Contract(
    LUCKY_NUMBER_ADDRESS!,
    LuckyNumberABI,
    signer
  );

  const approveTx = await gameCoinContract.approve(
    LUCKY_NUMBER_ADDRESS,
    ethers.parseEther("3")
  );
  await approveTx.wait();

  const playTx = await luckyNumberContract.play(guess);
  const receipt = await playTx.wait();

  const event = (receipt.logs as Log[])
    .map((log) => {
      try {
        return luckyNumberContract.interface.parseLog(log);
      } catch {
        return null;
      }
    })
    .find(
      (parsed): parsed is ReturnType<typeof luckyNumberContract.interface.parseLog> =>
        parsed !== null && parsed.name === "Played"
    );

  if (!event) throw new Error("No Played event found");

  return {
    success: event.args.won,
    luckyNumber: Number(event.args.luckyNumber),
    pointsEarned: Number(event.args.pointsEarned),
  };
}

export async function refillGameCoin(): Promise<string> {
  if (!window.ethereum) throw new Error("No crypto wallet found");

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();

  const luckyNumberContract = new ethers.Contract(
    LUCKY_NUMBER_ADDRESS!,
    LuckyNumberABI,
    signer
  );
  const tx = await luckyNumberContract.refill();
  await tx.wait();

  return "Refill successful";
}

export async function getGameCoinBalance(): Promise<string> {
  if (!window.ethereum) throw new Error("No crypto wallet found");

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const address = await signer.getAddress();

  const gameCoinContract = new ethers.Contract(
    GAMECOIN_ADDRESS!,
    GameCoinABI,
    provider
  );
  const balance: bigint = await gameCoinContract.balanceOf(address);
  return ethers.formatEther(balance);
}

export async function getUserPoints(): Promise<number> {
  if (!window.ethereum) throw new Error("No crypto wallet found");

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const address = await signer.getAddress();

  const luckyNumberContract = new ethers.Contract(
    LUCKY_NUMBER_ADDRESS!,
    LuckyNumberABI,
    provider
  );
  const [, points]: [bigint, bigint] = await luckyNumberContract.getStatus(address);
  return Number(points);
}

export async function getRefillCooldown(): Promise<number> {
  if (!window.ethereum) throw new Error("No crypto wallet found");

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const address = await signer.getAddress();

  const luckyNumberContract = new ethers.Contract(
    LUCKY_NUMBER_ADDRESS!,
    LuckyNumberABI,
    provider
  );
  const [lastRefill]: [bigint, bigint] = await luckyNumberContract.getStatus(address);

  const now = Math.floor(Date.now() / 1000);
  const cooldown = 3600;

  return Math.max(0, Number(lastRefill) + cooldown - now);
}

export async function getCooldownLeft(): Promise<number> {
  return getRefillCooldown();
}

export async function getUserStatus(wallet: string): Promise<{
  gameCoin: string;
  points: number;
}> {
  if (!window.ethereum) throw new Error("No crypto wallet found");

  checkAddress(GAMECOIN_ADDRESS, "GameCoin");
  checkAddress(LUCKY_NUMBER_ADDRESS, "LuckyNumber");

  const provider = new ethers.BrowserProvider(window.ethereum);
  const gameCoinContract = new ethers.Contract(
    GAMECOIN_ADDRESS!,
    GameCoinABI,
    provider
  );
  const luckyNumberContract = new ethers.Contract(
    LUCKY_NUMBER_ADDRESS!,
    LuckyNumberABI,
    provider
  );

  const balance: bigint = await gameCoinContract.balanceOf(wallet);
  const [, points]: [bigint, bigint] = await luckyNumberContract.getStatus(wallet);

  return {
    gameCoin: ethers.formatEther(balance),
    points: Number(points),
  };
}

