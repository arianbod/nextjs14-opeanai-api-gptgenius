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
              <label htmlFor='my-drawer-2' className='drawer-button lg:hidden z-20 fixed top-6 right-6'>
                <FaBarsStaggered className='cursor-pointer w-10 h-10 p-2 text-white bg-blue-900 rounded-full t dark:bg-none z-50 shadow-lg shadow-blue-950' />
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