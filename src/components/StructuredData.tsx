// Component for adding structured data (JSON-LD) for better SEO

interface StructuredDataProps {
  data: object;
}

export default function StructuredData({ data }: StructuredDataProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// Helper function to generate hostel structured data
export function generateHostelStructuredData(hostel: any) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Accommodation',
    name: hostel.title,
    description: hostel.description,
    address: {
      '@type': 'PostalAddress',
      streetAddress: hostel.address,
      addressLocality: hostel.district,
      addressRegion: 'Hà Nội',
      addressCountry: 'VN',
    },
    geo: hostel.coordinates ? {
      '@type': 'GeoCoordinates',
      latitude: hostel.coordinates.lat,
      longitude: hostel.coordinates.lng,
    } : undefined,
    image: [hostel.thumbnail, ...(hostel.images || [])],
    priceRange: `${hostel.price} VND`,
  };
}

// Website structured data
export const websiteStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Hostel FB Crawler',
  description: 'Tìm kiếm và thuê phòng trọ, nhà trọ giá rẻ tại Hà Nội',
  url: 'https://hostel-fb-crawler.com',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://hostel-fb-crawler.com/hostels?search={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
};

// Organization structured data
export const organizationStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Hostel FB Crawler',
  description: 'Nền tảng tìm kiếm phòng trọ từ Facebook',
  url: 'https://hostel-fb-crawler.com',
};

