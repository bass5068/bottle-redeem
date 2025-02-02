import "./globals.css";
import { Inter } from "next/font/google";
import Link from "next/link";
import { SessionProvider } from "@/components/SessionProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Point Redeem App",
  description: "A simple points management and redemption app",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className} >
        <SessionProvider>
        <header className="p-4 bg-gray-800 text-white">
          <nav className="flex justify-between">
            <h1 className="text-xl font-bold">Point Redeem App</h1>
            <ul className="flex space-x-4">
              <li>
                <Link href="/">Home</Link>
              </li>
              <li>
                <Link href="/admin">Admin Dashboard</Link>
              </li>
              <li>
                <Link href="/admin/rewards">Manage Rewards</Link>
              </li>
              <li>
                <Link href="/history">Redemption History</Link>
              </li>
            </ul>
          </nav>
        </header>
        <main className="p-4">{children}</main>
        </SessionProvider>
      </body>
    </html>
  );
}
