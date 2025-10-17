// Types cho dữ liệu phòng trọ từ Facebook
export interface Hostel {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  address: string;
  district: string;
  ward?: string;
  price: number;
  area: number; // m²
  postedBy: {
    name: string;
    avatar?: string;
    fbId: string;
  };
  postedAt: Date;
  fbLink: string;
  fbGroupName: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  amenities?: string[];
  rules?: string[];
  images?: string[];
  contactPhone?: string;
  depositRequired?: number;
  utilities?: {
    electricity?: string;
    water?: string;
    internet?: boolean;
    parking?: boolean;
  };
  roomType?: 'single' | 'shared' | 'apartment' | 'studio';
  available?: boolean;
}

export interface HostelFilters {
  district?: string;
  priceMin?: number;
  priceMax?: number;
  areaMin?: number;
  areaMax?: number;
  roomType?: string;
  search?: string;
}

export interface SavedHostel {
  userId: string;
  hostelId: string;
  savedAt: Date;
}

