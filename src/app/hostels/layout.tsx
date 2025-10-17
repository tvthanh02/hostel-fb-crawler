import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tìm phòng trọ Hà Nội | Hostel FB Crawler',
  description: 'Tìm kiếm và thuê phòng trọ, nhà trọ giá rẻ tại Hà Nội. Cập nhật liên tục từ các group Facebook uy tín. Hơn 1000+ phòng trọ cho thuê với đầy đủ thông tin, hình ảnh, giá cả minh bạch.',
  keywords: 'phòng trọ hà nội, cho thuê phòng trọ, nhà trọ giá rẻ, tìm phòng trọ, thuê phòng hà nội, phòng trọ sinh viên',
  openGraph: {
    title: 'Tìm phòng trọ Hà Nội | Hostel FB Crawler',
    description: 'Tìm kiếm và thuê phòng trọ, nhà trọ giá rẻ tại Hà Nội. Cập nhật liên tục từ các group Facebook uy tín.',
    type: 'website',
    locale: 'vi_VN',
    siteName: 'Hostel FB Crawler',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tìm phòng trọ Hà Nội | Hostel FB Crawler',
    description: 'Tìm kiếm và thuê phòng trọ, nhà trọ giá rẻ tại Hà Nội',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function HostelsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

