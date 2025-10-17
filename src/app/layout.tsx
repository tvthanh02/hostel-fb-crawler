import type { Metadata } from "next";
import ThemeRegistry from "@/components/ThemeRegistry";
import Navbar from "@/components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hostel FB Crawler - Tìm phòng trọ Hà Nội",
  description: "Tìm kiếm và thuê phòng trọ, nhà trọ giá rẻ tại Hà Nội. Cập nhật liên tục từ các group Facebook uy tín với hơn 1000+ phòng trọ.",
  keywords: "phòng trọ hà nội, cho thuê phòng trọ, nhà trọ giá rẻ, tìm phòng trọ hà nội",
  authors: [{ name: "Hostel FB Crawler" }],
  creator: "Hostel FB Crawler",
  publisher: "Hostel FB Crawler",
  openGraph: {
    type: "website",
    locale: "vi_VN",
    siteName: "Hostel FB Crawler",
    title: "Hostel FB Crawler - Tìm phòng trọ Hà Nội",
    description: "Tìm kiếm và thuê phòng trọ, nhà trọ giá rẻ tại Hà Nội",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body>
        <ThemeRegistry>
          <Navbar />
          {children}
        </ThemeRegistry>
      </body>
    </html>
  );
}
