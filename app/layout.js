// layout.jsx
import './globals.css';
import Providers from './providers';
import { Toaster } from 'react-hot-toast';
import Sidebar from '@/components/sidebar/Sidebar';
import { global } from '@/lib/dic/en';

export const metadata = {
  title: global.title,
  description: global.description,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-sans flex">
        <Toaster position="top-center" />
        <Providers>
          <Sidebar />
          <main className="flex-1 ml-0 lg:ml-72 p-4 ">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
