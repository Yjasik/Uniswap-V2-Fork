import type { Metadata } from "next";
import "./globals.css";
import { ReactNode } from "react";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Uniswap-V2-Fork",
};

export default function RootLayout(props: { children: ReactNode}) {
  return (
    <html lang="en">
      <body> 
        <Providers>
          {props.children}
        </Providers>
      </body>
    </html>
  );
}
