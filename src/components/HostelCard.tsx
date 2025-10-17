'use client';

import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  Avatar,
  Stack,
  IconButton,
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SquareFootIcon from '@mui/icons-material/SquareFoot';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { Hostel } from '@/types/hostel';
import { formatPrice, formatArea, formatRelativeTime } from '@/utils/formatters';
import { useState } from 'react';

interface HostelCardProps {
  hostel: Hostel;
  onCardClick: (hostel: Hostel) => void;
}

export default function HostelCard({ hostel, onCardClick }: HostelCardProps) {
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSaved(!isSaved);
  };

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'all 0.3s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
      }}
      onClick={() => onCardClick(hostel)}
    >
      <Box sx={{ position: 'relative', height: 200, overflow: 'hidden', bgcolor: 'grey.100' }}>
        <CardMedia
          component="img"
          image={hostel.thumbnail || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop'}
          alt={hostel.title}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
          onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop';
          }}
        />
        <IconButton
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            bgcolor: 'rgba(255, 255, 255, 0.9)',
            '&:hover': { bgcolor: 'rgba(255, 255, 255, 1)' },
          }}
          size="small"
          onClick={handleSaveClick}
        >
          {isSaved ? (
            <FavoriteIcon color="error" />
          ) : (
            <FavoriteBorderIcon />
          )}
        </IconButton>
        <Chip
          label={hostel.price ? formatPrice(hostel.price) + '/tháng' : 'Chưa rõ giá'}
          color="primary"
          sx={{
            position: 'absolute',
            bottom: 8,
            left: 8,
            fontWeight: 'bold',
            fontSize: '0.9rem',
          }}
        />
      </Box>

      <CardContent sx={{ flexGrow: 1, p: 2 }}>
        <Typography
          variant="h6"
          component="h3"
          gutterBottom
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            mb: 1.5,
            fontWeight: 600,
            fontSize: '1.1rem',
          }}
        >
          {hostel.title}
        </Typography>

        <Stack spacing={1} sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <LocationOnIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary" noWrap>
              {hostel.address || 'Chưa rõ địa chỉ'}, {hostel.district || 'Chưa rõ quận'}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <SquareFootIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {hostel.area ? formatArea(hostel.area) : 'Chưa rõ diện tích'}
            </Typography>
            {hostel.roomType && (
              <>
                <Typography variant="body2" color="text.secondary" sx={{ mx: 0.5 }}>
                  •
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {hostel.roomType === 'single' && 'Phòng đơn'}
                  {hostel.roomType === 'shared' && 'Phòng ghép'}
                  {hostel.roomType === 'apartment' && 'Căn hộ'}
                  {hostel.roomType === 'studio' && 'Studio'}
                </Typography>
              </>
            )}
          </Box>
        </Stack>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            pt: 1.5,
            borderTop: 1,
            borderColor: 'divider',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar
              src={hostel.postedBy?.avatar}
              alt={hostel.postedBy?.name || 'User'}
              sx={{ width: 28, height: 28 }}
            >
              {hostel.postedBy?.name?.charAt(0) || 'U'}
            </Avatar>
            <Typography variant="body2" color="text.secondary" noWrap>
              {hostel.postedBy?.name || 'Chưa rõ'}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <AccessTimeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary">
              {formatRelativeTime(hostel.postedAt)}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

