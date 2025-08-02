import { createWalletClient, customProvider } from "viem";
import { mainnet } from "viem/chains";

export async function connectWallet() {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("MetaMask not detected");
  }

  const [account] = await window.ethereum.request({ method: "eth_requestAccounts" });
  return account;
}

