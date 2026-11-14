import type { Metadata, Viewport } from "next";
import {
  Archivo,
  Inter,
  Space_Grotesk as SpaceGrotesk,
} from "next/font/google";
import "./globals.css";
import ThemeProvider from "@/context/Theme";
import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import { auth } from "@/auth";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = SpaceGrotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
  axes: ["wdth"],
});

export const metadata: Metadata = {
  title: "Gloss Edge",
  description: "Stock across cities",
};

export const viewport: Viewport = {
  themeColor: "#070708",
};

const RootLayout = async ({ children }: { children: ReactNode }) => {
  const session = await auth();

  return (
    <html lang="en" suppressHydrationWarning>
      <SessionProvider session={session}>
        <body
          className={`${inter.className} ${spaceGrotesk.variable} ${archivo.variable} antialiased`}
        >
          <ThemeProvider
            attribute="class"
            forcedTheme="dark"
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
          <Toaster richColors theme="dark" position="top-center" />
        </body>
      </SessionProvider>
    </html>
  );
};
export default RootLayout;
