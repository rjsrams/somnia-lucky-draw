import "@/styles/globals.css";
import type { AppProps } from "next/app";

import { WagmiConfig } from "wagmi";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";

import { wagmiConfig } from "@/lib/wagmi";
import { somniaChains } from "@/lib/wagmi";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig config={wagmiConfig}>
      <RainbowKitProvider chains={somniaChains}>
        <Component {...pageProps} />
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

