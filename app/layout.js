// layout.jsx
import './globals.css';
import Providers from './providers';
import { Toaster } from 'react-hot-toast';
import Sidebar from '@/components/sidebar/Sidebar';

export const metadata = {
  title: 'Your App Title',
  description: 'Your App Description',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-sans bg-base-200 text-base-content">
        <Toaster position="top-center" />
        <Providers>
          <div className="flex h-screen">
            {/* Sidebar */}
            <Sidebar />

            {/* Content area */}
            {/* <div className="overflow-auto"> */}
            {children}
            {/* </div> */}
          </div>
        </Providers>
      </body>
    </html>
  );
}
