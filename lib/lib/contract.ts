import { ethers } from "ethers";
import { LUCKY_NUMBER_ADDRESS, GAMECOIN_ADDRESS } from "../constants/addresses";
import LuckyNumberJson from "../constants/LuckyNumber.json";
import GameCoinJson from "../constants/GameCoin.json";

const LuckyNumberABI = LuckyNumberJson.abi;
const GameCoinABI = GameCoinJson.abi;

export const CONTRACT_ADDRESS = LUCKY_NUMBER_ADDRESS;
export const ABI = LuckyNumberABI;

declare global {
  interface Window {
    ethereum?: ethers.providers.ExternalProvider;
  }
}

function getProvider(): ethers.providers.Web3Provider {
  if (!window.ethereum) throw new Error("No crypto wallet found");
  return new ethers.providers.Web3Provider(window.ethereum);
}

function checkAddress(address: string | undefined | null, name: string) {
  if (!address || address === ethers.constants.AddressZero) {
    throw new Error(`${name} address is invalid: ${address}`);
  }
}

export async function playLuckyNumber(guess: number): Promise<{
  success: boolean;
  luckyNumber: number;
  pointsEarned: number;
}> {
  checkAddress(GAMECOIN_ADDRESS, "GameCoin");
  checkAddress(LUCKY_NUMBER_ADDRESS, "LuckyNumber");

  const provider = getProvider();
  const signer = provider.getSigner();

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
    ethers.utils.parseEther("3")
  );
  await approveTx.wait();

  const playTx = await luckyNumberContract.play(guess);
  const receipt = await playTx.wait();

  const event = receipt.logs
    .map((log: any) => {
      try {
        return luckyNumberContract.interface.parseLog(log);
      } catch {
        return null;
      }
    })
    .find(
      (parsed: any): parsed is ethers.utils.LogDescription =>
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
  const provider = getProvider();
  const signer = provider.getSigner();

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
  const provider = getProvider();
  const signer = provider.getSigner();
  const address = await signer.getAddress();

  const gameCoinContract = new ethers.Contract(
    GAMECOIN_ADDRESS!,
    GameCoinABI,
    provider
  );
  const balance: ethers.BigNumber = await gameCoinContract.balanceOf(address);
  return ethers.utils.formatEther(balance);
}

export async function getUserPoints(): Promise<number> {
  const provider = getProvider();
  const signer = provider.getSigner();
  const address = await signer.getAddress();

  const luckyNumberContract = new ethers.Contract(
    LUCKY_NUMBER_ADDRESS!,
    LuckyNumberABI,
    provider
  );
  const [, points]: [ethers.BigNumber, ethers.BigNumber] =
    await luckyNumberContract.getStatus(address);
  return points.toNumber();
}

export async function getRefillCooldown(): Promise<number> {
  const provider = getProvider();
  const signer = provider.getSigner();
  const address = await signer.getAddress();

  const luckyNumberContract = new ethers.Contract(
    LUCKY_NUMBER_ADDRESS!,
    LuckyNumberABI,
    provider
  );
  const [lastRefill]: [ethers.BigNumber, ethers.BigNumber] =
    await luckyNumberContract.getStatus(address);

  const now = Math.floor(Date.now() / 1000);
  const cooldown = 3600;

  return Math.max(0, lastRefill.toNumber() + cooldown - now);
}

export async function getCooldownLeft(): Promise<number> {
  return getRefillCooldown();
}

export async function getUserStatus(wallet: string): Promise<{
  gameCoin: string;
  points: number;
}> {
  checkAddress(GAMECOIN_ADDRESS, "GameCoin");
  checkAddress(LUCKY_NUMBER_ADDRESS, "LuckyNumber");

  const provider = getProvider();

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

  const balance: ethers.BigNumber = await gameCoinContract.balanceOf(wallet);
  const [, points]: [ethers.BigNumber, ethers.BigNumber] =
    await luckyNumberContract.getStatus(wallet);

  return {
    gameCoin: ethers.utils.formatEther(balance),
    points: points.toNumber(),
  };
}

