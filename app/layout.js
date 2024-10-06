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
      <body className="font-sans">
        <Toaster position="top-center" />
        <Providers>
          <div className="flex h-screen">
            {/* Sidebar */}
            <Sidebar />

            {/* Content area */}
            <div className="mx-auto">
              {children}
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
