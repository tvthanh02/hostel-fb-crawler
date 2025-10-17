import { Hostel } from '@/types/hostel';

// Mock data để demo UI
const initialMockHostels: Hostel[] = [
  {
    id: '1',
    title: 'Phòng trọ cao cấp gần Đại học Bách Khoa',
    description: 'Phòng đẹp, đầy đủ tiện nghi, gần trường học, siêu thị',
    thumbnail: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop',
    address: '123 Đường Giải Phóng',
    district: 'Hai Bà Trưng',
    ward: 'Bách Khoa',
    price: 3500000,
    area: 25,
    postedBy: {
      name: 'Nguyễn Văn A',
      avatar: 'https://i.pravatar.cc/150?img=1',
      fbId: 'user123',
    },
    postedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    fbLink: 'https://facebook.com/groups/example/posts/123',
    fbGroupName: 'Cho thuê phòng trọ Hà Nội',
    coordinates: {
      lat: 21.0045,
      lng: 105.8412,
    },
    amenities: ['Điều hòa', 'Nóng lạnh', 'WiFi', 'Ban công', 'Tủ lạnh'],
    rules: ['Không nuôi thú cưng', 'Giữ vệ sinh chung', 'Không hút thuốc trong phòng'],
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&h=600&fit=crop',
    ],
    contactPhone: '0912345678',
    depositRequired: 3500000,
    utilities: {
      electricity: '3,500đ/kWh',
      water: 'Miễn phí',
      internet: true,
      parking: true,
    },
    roomType: 'single',
    available: true,
  },
  {
    id: '2',
    title: 'Phòng trọ giá rẻ Cầu Giấy',
    description: 'Phòng sạch sẽ, an ninh, gần chợ, bệnh viện',
    thumbnail: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=400&h=300&fit=crop',
    address: '45 Nguyễn Phong Sắc',
    district: 'Cầu Giấy',
    ward: 'Dịch Vọng',
    price: 2500000,
    area: 20,
    postedBy: {
      name: 'Trần Thị B',
      avatar: 'https://i.pravatar.cc/150?img=5',
      fbId: 'user456',
    },
    postedAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    fbLink: 'https://facebook.com/groups/example/posts/456',
    fbGroupName: 'Cho thuê phòng trọ Hà Nội',
    coordinates: {
      lat: 21.0283,
      lng: 105.7826,
    },
    amenities: ['Điều hòa', 'Nóng lạnh', 'WiFi'],
    rules: ['Không ồn ào sau 22h', 'Không nấu ăn trong phòng'],
    images: [
      'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&h=600&fit=crop',
    ],
    contactPhone: '0987654321',
    depositRequired: 2500000,
    utilities: {
      electricity: '3,500đ/kWh',
      water: '100,000đ/người',
      internet: true,
      parking: false,
    },
    roomType: 'single',
    available: true,
  },
  {
    id: '3',
    title: 'Studio cao cấp Thanh Xuân',
    description: 'Căn hộ mini full nội thất, view đẹp, thoáng mát',
    thumbnail: 'https://images.unsplash.com/photo-1502672260066-6bc35f0c1bb1?w=400&h=300&fit=crop',
    address: '78 Nguyễn Trãi',
    district: 'Thanh Xuân',
    ward: 'Khương Trung',
    price: 5500000,
    area: 35,
    postedBy: {
      name: 'Lê Văn C',
      avatar: 'https://i.pravatar.cc/150?img=3',
      fbId: 'user789',
    },
    postedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    fbLink: 'https://facebook.com/groups/example/posts/789',
    fbGroupName: 'Cho thuê phòng trọ Hà Nội',
    coordinates: {
      lat: 20.9945,
      lng: 105.8076,
    },
    amenities: ['Điều hòa', 'Nóng lạnh', 'WiFi', 'Tủ lạnh', 'Máy giặt', 'Bếp riêng'],
    rules: ['Không nuôi thú cưng', 'Giữ vệ sinh'],
    images: [
      'https://images.unsplash.com/photo-1502672260066-6bc35f0c1bb1?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop',
    ],
    contactPhone: '0901234567',
    depositRequired: 5500000,
    utilities: {
      electricity: '3,500đ/kWh',
      water: 'Miễn phí',
      internet: true,
      parking: true,
    },
    roomType: 'studio',
    available: true,
  },
  {
    id: '4',
    title: 'Phòng trọ sinh viên Đống Đa',
    description: 'Phòng rộng rãi, giá sinh viên, gần trường ĐH Kinh Tế Quốc Dân',
    thumbnail: 'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=400&h=300&fit=crop',
    address: '156 Giải Phóng',
    district: 'Đống Đa',
    ward: 'Đồng Tâm',
    price: 2200000,
    area: 18,
    postedBy: {
      name: 'Phạm Thị D',
      avatar: 'https://i.pravatar.cc/150?img=9',
      fbId: 'user234',
    },
    postedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    fbLink: 'https://facebook.com/groups/example/posts/234',
    fbGroupName: 'Cho thuê phòng trọ Hà Nội',
    coordinates: {
      lat: 21.0134,
      lng: 105.8399,
    },
    amenities: ['Điều hòa', 'Nóng lạnh', 'WiFi'],
    rules: ['Không nấu ăn trong phòng', 'Giờ giấc hợp lý'],
    images: [
      'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=800&h=600&fit=crop',
    ],
    contactPhone: '0938765432',
    depositRequired: 2200000,
    utilities: {
      electricity: '3,500đ/kWh',
      water: '80,000đ/người',
      internet: true,
      parking: true,
    },
    roomType: 'single',
    available: true,
  },
  {
    id: '5',
    title: 'Căn hộ 2 phòng ngủ Hoàng Mai',
    description: 'Căn hộ rộng, phù hợp gia đình nhỏ hoặc ở ghép',
    thumbnail: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=400&h=300&fit=crop',
    address: '23 Yên Duyên',
    district: 'Hoàng Mai',
    ward: 'Yên Sở',
    price: 4000000,
    area: 45,
    postedBy: {
      name: 'Hoàng Văn E',
      avatar: 'https://i.pravatar.cc/150?img=7',
      fbId: 'user567',
    },
    postedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
    fbLink: 'https://facebook.com/groups/example/posts/567',
    fbGroupName: 'Cho thuê phòng trọ Hà Nội',
    coordinates: {
      lat: 20.9747,
      lng: 105.8436,
    },
    amenities: ['Điều hòa', 'Nóng lạnh', 'WiFi', 'Tủ lạnh', 'Máy giặt', 'Ban công'],
    rules: ['Giữ vệ sinh chung', 'Không ồn ào'],
    images: [
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&h=600&fit=crop',
    ],
    contactPhone: '0945678901',
    depositRequired: 4000000,
    utilities: {
      electricity: '3,500đ/kWh',
      water: '100,000đ/người',
      internet: true,
      parking: true,
    },
    roomType: 'apartment',
    available: true,
  },
];

export const hanoiDistricts = [
  'Ba Đình',
  'Hoàn Kiếm',
  'Hai Bà Trưng',
  'Đống Đa',
  'Tây Hồ',
  'Cầu Giấy',
  'Thanh Xuân',
  'Hoàng Mai',
  'Long Biên',
  'Nam Từ Liêm',
  'Bắc Từ Liêm',
  'Hà Đông',
];

// Tạo thêm mock data để demo load more
function generateMoreMockData(): Hostel[] {
  const moreHostels: Hostel[] = [];
  const districts = hanoiDistricts;
  const roomTypes: Array<'single' | 'shared' | 'apartment' | 'studio'> = ['single', 'shared', 'apartment', 'studio'];

  for (let i = 6; i <= 30; i++) {
    const district = districts[i % districts.length];
    const roomType = roomTypes[i % roomTypes.length];
    const price = Math.floor(Math.random() * (6000000 - 2000000) + 2000000);
    const area = Math.floor(Math.random() * (40 - 15) + 15);
    const hoursAgo = Math.floor(Math.random() * 168); // Random trong 7 ngày

    moreHostels.push({
      id: `${i}`,
      title: `Phòng trọ ${roomType === 'single' ? 'đơn' : roomType === 'studio' ? 'studio' : roomType === 'apartment' ? 'căn hộ' : 'ghép'} ${district}`,
      description: `Phòng ${area}m² tại ${district}, giá ${(price / 1000000).toFixed(1)} triệu, đầy đủ tiện nghi, gần chợ, trường học`,
      thumbnail: `https://images.unsplash.com/photo-${1522708323590 + i * 1000}?w=400&h=300&fit=crop`,
      address: `${i * 10} Đường ${district}`,
      district: district,
      price: price,
      area: area,
      postedBy: {
        name: `Người dùng ${i}`,
        avatar: `https://i.pravatar.cc/150?img=${i % 70}`,
        fbId: `user${i}`,
      },
      postedAt: new Date(Date.now() - hoursAgo * 60 * 60 * 1000),
      fbLink: `https://facebook.com/groups/example/posts/${i}`,
      fbGroupName: 'Cho thuê phòng trọ Hà Nội',
      coordinates: {
        lat: 20.9 + (Math.random() * 0.2),
        lng: 105.7 + (Math.random() * 0.2),
      },
      amenities: ['Điều hòa', 'Nóng lạnh', 'WiFi'],
      rules: ['Giữ vệ sinh', 'Không ồn ào'],
      contactPhone: `09${Math.floor(Math.random() * 100000000)}`,
      depositRequired: price,
      utilities: {
        electricity: '3,500đ/kWh',
        water: '100,000đ/người',
        internet: true,
        parking: Math.random() > 0.5,
      },
      roomType: roomType,
      available: true,
    });
  }

  return moreHostels;
}

// Combine original mock data with generated data
export const mockHostels: Hostel[] = [...initialMockHostels, ...generateMoreMockData()];

