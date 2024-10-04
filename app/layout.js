// layout.jsx
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import { global } from "@/lib/dic/en";
import { Toaster } from "react-hot-toast";
import Sidebar from "@/components/sidebar/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: global.title,
  description: global.description,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Toaster position="top-center" />
        <Providers>
          <div className="flex h-screen overflow-hidden">
            {/* Sidebar */}
            <Sidebar />

            {/* Content area */}
            <div className="flex flex-col flex-1 overflow-auto">
              {children}
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
