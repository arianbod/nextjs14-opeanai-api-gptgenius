// app/layout.jsx
import '../globals.css';
import Providers from './providers';
import { Toaster } from 'react-hot-toast';
import Sidebar from '@/components/sidebar/Sidebar';
import en from '@/lib/dic/en.json';
export async function generateStaticParams() {
  return [{ lang: 'en' }, { lang: 'fa' }, { lang: 'tr' }]
}
export const metadata = {
  title: en.global.title,
  description: en.global.description,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="font-sans flex">
        <Providers>
          <Toaster position="top-center" />
          <Sidebar />
          <main className="flex-1 mx-0 lg:ml-72 p-0 ">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}