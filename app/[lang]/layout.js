// app/layout.jsx
import '../globals.css';
import { GoogleAnalytics } from '@next/third-parties/google'
import Providers from './providers';
import { Toaster } from 'react-hot-toast';
import en from '@/lib/dic/en.json';
import { getDictionary } from '@/lib/dictionary';

const RTL_LANGUAGES = ['fa', 'ar'];

export async function generateStaticParams() {
  return [{ lang: 'en' }, { lang: 'fa' }, { lang: 'tr' }, { lang: 'ar' }, { lang: 'it' }, { lang: 'fr' }]
}

export const metadata = {
  title: en.global.title,
  description: en.global.description,
};

export default async function RootLayout({ params, children }) {
  const { lang } = params;
  const dict = await getDictionary(lang);
  const isRTL = RTL_LANGUAGES.includes(lang);

  // Fixed font selection logic
  let fontToUse;
  switch (lang) {
    case "fa":
      fontToUse = "font-persian";
      break;
    case "ar":
      fontToUse = "font-arabic";
      break;
    default:
      fontToUse = "font-sans";
      break;
  }

  return (
    <html lang={lang} dir={isRTL ? 'rtl' : 'ltr'}>
      <head>
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css"
          integrity="sha384-n8MVd4RsNIU0tAv4ct0nTaAbDJwPJzDEaqSD1odI+WdtXRGWt2kTvGFasHpSy3SV"
          crossOrigin="anonymous"
        />
      </head>
      <body
        className={`
          ${fontToUse} 
          ${isRTL ? 'rtl text-right' : 'ltr text-left'}
          flex 
          max-w-full 
          overflow-x-hidden 
          overflow-y-auto 
          min-h-full
        `}
      >
        <Providers translations={dict} lang={lang}>
          <Toaster
            position="top-center"
            containerClassName={isRTL ? 'rtl' : 'ltr'}
            toastOptions={{
              className: isRTL ? 'rtl' : 'ltr',
            }}
          />
          {children}
        </Providers>
        <GoogleAnalytics gaId="G-3T0PFBNMPY" />
      </body>
    </html>
  );
}