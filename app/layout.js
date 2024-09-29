import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import { global } from "@/lib/dic/en";
import { FaBarsStaggered } from "react-icons/fa6";
import Sidebar from "@/components/sidebar/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: global.title,
  description:
    global.description,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div
            className='drawer lg:drawer-open'
          >
            <input type='checkbox' id='my-drawer-2' className='drawer-toggle' />
            <div className="drawer-content">
              <label htmlFor='my-drawer-2' className='drawer-button lg:hidden fixed top-6 right-6'>
                <FaBarsStaggered className='w-8 h-8 text-primary' />
              </label>
              <div className="bg-base-200">
                {children}
              </div>
            </div>
            <div className="drawer-side">
              <label htmlFor='my-drawer-2' aria-label='close sidebar' className='drawer-overlay'></label>
              <Sidebar />
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}