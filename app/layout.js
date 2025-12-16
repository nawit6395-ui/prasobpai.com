import { Inter, Noto_Sans_Thai } from "next/font/google"; // แนะนำให้ใช้ Noto Sans Thai
import "./globals.css";
import CookieConsent from "@/components/CookieConsent";

const notoSansThai = Noto_Sans_Thai({ subsets: ["thai"] });

export const metadata = {
  metadataBase: new URL('https://prasobpai.com'),
  title: "Prasobpai - ประสบภัย.คอม",
  description: "พื้นที่ระบายของคนดวงตก เปลี่ยนเรื่องซวยให้เป็นเรื่องแชร์",
  icons: {
    icon: [
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180' },
    ],
  },
  manifest: '/site.webmanifest',
  openGraph: {
    title: 'Prasobpai - ประสบภัย.คอม',
    description: 'พื้นที่ระบายของคนดวงตก เปลี่ยนเรื่องซวยให้เป็นเรื่องแชร์',
    url: 'https://prasobpai.com',
    siteName: 'Prasobpai',
    images: [
      {
        url: '/web-app-manifest-512x512.png',
        width: 512,
        height: 512,
        alt: 'Prasobpai Logo',
      },
    ],
    locale: 'th_TH',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Prasobpai - ประสบภัย.คอม',
    description: 'พื้นที่ระบายของคนดวงตก เปลี่ยนเรื่องซวยให้เป็นเรื่องแชร์',
    images: ['/web-app-manifest-512x512.png'],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <body className={notoSansThai.className}>
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}