// app/layout.jsx
import '../globals.css';
import { GoogleAnalytics } from '@next/third-parties/google'
import Providers from './providers';
import { Toaster } from 'react-hot-toast';
import Sidebar from '@/components/sidebar/Sidebar';
import en from '@/lib/dic/en.json';
import { getDictionary } from '@/lib/dictionary';
export async function generateStaticParams() {
  return [{ lang: 'en' }, { lang: 'fa' }, { lang: 'tr' }]
}
export const metadata = {
  title: en.global.title,
  description: en.global.description,
};

export default async function RootLayout({ children, params: { lang } }) {
  const dict = await getDictionary(lang);
  return (
    <html lang="en">
      <body className="font-sans flex overflow-x-hidden">
        <Providers translations={dict}>
          <Toaster position="top-center" />
          <Sidebar />
          <main className="flex-1 mx-0 lg:ml-80 p-0 pt-8 ">
            {children}
          </main>
        </Providers>
      </body>
      <GoogleAnalytics gaId="G-3T0PFBNMPY" />
    </html>
  );
}