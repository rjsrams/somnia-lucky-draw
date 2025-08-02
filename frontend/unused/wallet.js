import { ethers } from "ethers";

export const connectWallet = async () => {
  if (!window.ethereum) {
    alert("Please install MetaMask.");
    return null;
  }

  try {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    return accounts[0];
  } catch (err) {
    console.error("Failed to connect wallet:", err);
    return null;
  }
};

export const getProvider = () => {
  if (!window.ethereum) return null;
  return new ethers.providers.Web3Provider(window.ethereum);
};

export const getSigner = () => {
  const provider = getProvider();
  return provider ? provider.getSigner() : null;
};

