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

export default async function RootLayout(props) {
  const params = await props.params;

  const {
    lang
  } = params;

  const {
    children
  } = props;

  const dict = await getDictionary(lang);
  return (
    <html lang="en">
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css"
          integrity="sha384-n8MVd4RsNIU0tAv4ct0nTaAbDJwPJzDEaqSD1odI+WdtXRGWt2kTvGFasHpSy3SV"
          crossOrigin="anonymous"
        />
      </head>
      <body className="font-sans flex max-w-full overflow-x-hidden">
        <Providers translations={dict}>
          <Toaster position="top-center" />
          <Sidebar />
          <main className="flex-1 mx-0 lg:ml-80 p-0 md:pt-0 max-w-full">
            {children}
          </main>
        </Providers>
      </body>
      <GoogleAnalytics gaId="G-3T0PFBNMPY" />
    </html>
  );
}