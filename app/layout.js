import { Inter, Noto_Sans_Thai } from "next/font/google"; // แนะนำให้ใช้ Noto Sans Thai
import "./globals.css";

const notoSansThai = Noto_Sans_Thai({ subsets: ["thai"] });

export const metadata = {
  title: "Prasobpai - ประสบภัย.คอม",
  description: "พื้นที่ระบายของคนดวงตก เปลี่ยนเรื่องซวยให้เป็นเรื่องแชร์",
};

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <body className={notoSansThai.className}>{children}</body>
    </html>
  );
}