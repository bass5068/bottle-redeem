import "./globals.css";
import { Inter } from "next/font/google";
// import Link from "next/link";
import { SessionProvider } from "@/components/SessionProvider";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "BottleCoins",
  description: "A simple points management and redemption app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <SessionProvider>
        <body className={inter.className}>
          <Navbar />
          <main className="">{children}</main>
        </body>
      </SessionProvider>
    </html>
  );
}
