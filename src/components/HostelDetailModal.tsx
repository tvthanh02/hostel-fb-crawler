'use client';

import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Box,
  Typography,
  Chip,
  Stack,
  Avatar,
  Divider,
  Button,
  Grid,
  Paper,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SquareFootIcon from '@mui/icons-material/SquareFoot';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PhoneIcon from '@mui/icons-material/Phone';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import BoltIcon from '@mui/icons-material/Bolt';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import WifiIcon from '@mui/icons-material/Wifi';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Hostel } from '@/types/hostel';
import { formatPrice, formatArea, formatRelativeTime, formatPhoneNumber } from '@/utils/formatters';
import { useState } from 'react';
import Image from 'next/image';

interface HostelDetailModalProps {
  hostel: Hostel | null;
  open: boolean;
  onClose: () => void;
}

export default function HostelDetailModal({ hostel, open, onClose }: HostelDetailModalProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  if (!hostel) return null;

  const allImages = [hostel.thumbnail, ...(hostel.images || [])];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          maxHeight: '90vh',
        },
      }}
    >
      <DialogTitle sx={{ p: 2, pr: 6 }}>
        <Typography variant="h5" component="div" fontWeight={600}>
          {hostel.title}
        </Typography>
        <IconButton
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {/* Image Gallery */}
        <Box sx={{ position: 'relative', width: '100%', height: 450, bgcolor: 'grey.200' }}>
          {allImages[selectedImage] ? (
            <img
              src={allImages[selectedImage]}
              alt={hostel.title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                backgroundColor: '#000',
              }}
              onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                e.currentTarget.src = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=450&fit=crop';
              }}
            />
          ) : (
            <Box
              sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'grey.200',
              }}
            >
              <Typography color="text.secondary">Chưa có hình ảnh</Typography>
            </Box>
          )}
          {allImages.length > 1 && (
            <Box
              sx={{
                position: 'absolute',
                bottom: 16,
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: 1,
                maxWidth: '90%',
                overflowX: 'auto',
                p: 1,
                bgcolor: 'rgba(0,0,0,0.5)',
                borderRadius: 2,
              }}
            >
              {allImages.map((img, index) => (
                <Box
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  sx={{
                    minWidth: 60,
                    width: 60,
                    height: 60,
                    borderRadius: 1,
                    border: selectedImage === index ? 3 : 2,
                    borderColor: selectedImage === index ? 'primary.main' : 'white',
                    cursor: 'pointer',
                    overflow: 'hidden',
                    bgcolor: 'white',
                    transition: 'all 0.2s',
                    '&:hover': {
                      transform: 'scale(1.1)',
                    },
                  }}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${index + 1}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </Box>
              ))}
            </Box>
          )}
        </Box>

        <Box sx={{ p: 3 }}>
          {/* Price & Area */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            <Chip
              label={hostel.price ? formatPrice(hostel.price) + '/tháng' : 'Chưa rõ giá'}
              color="primary"
              sx={{ fontSize: '1.1rem', fontWeight: 'bold', py: 2.5, px: 1 }}
            />
            <Chip
              icon={<SquareFootIcon />}
              label={hostel.area ? formatArea(hostel.area) : 'Chưa rõ'}
              variant="outlined"
              sx={{ fontSize: '1rem', py: 2.5 }}
            />
            {hostel.roomType && (
              <Chip
                label={
                  hostel.roomType === 'single' ? 'Phòng đơn' :
                    hostel.roomType === 'shared' ? 'Phòng ghép' :
                      hostel.roomType === 'apartment' ? 'Căn hộ' : 'Studio'
                }
                variant="outlined"
                sx={{ fontSize: '1rem', py: 2.5 }}
              />
            )}
          </Box>

          {/* Location */}
          <Box sx={{ display: 'flex', alignItems: 'start', gap: 1, mb: 2 }}>
            <LocationOnIcon color="primary" />
            <Box>
              <Typography variant="body1" fontWeight={500}>
                {hostel.address || 'Chưa rõ địa chỉ'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {hostel.ward && `${hostel.ward}, `}{hostel.district || 'Chưa rõ quận'}, Hà Nội
              </Typography>
            </Box>
          </Box>

          {/* Google Maps */}
          {hostel.coordinates && (
            <Paper variant="outlined" sx={{ mb: 3, overflow: 'hidden', borderRadius: 2 }}>
              <iframe
                width="100%"
                height="250"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                src={`https://www.google.com/maps/embed/v1/place?key=YOUR_GOOGLE_MAPS_API_KEY&q=${hostel.coordinates.lat},${hostel.coordinates.lng}&zoom=15`}
              />
            </Paper>
          )}

          {/* Description */}
          <Typography variant="body1" paragraph sx={{ mb: 3, whiteSpace: 'pre-line' }}>
            {hostel.description || 'Chưa có mô tả chi tiết.'}
          </Typography>

          <Divider sx={{ my: 3 }} />

          {/* Amenities */}
          {hostel.amenities && hostel.amenities.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Tiện nghi
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {hostel.amenities.map((amenity, index) => (
                  <Chip
                    key={index}
                    icon={<CheckCircleIcon />}
                    label={amenity}
                    variant="outlined"
                    color="success"
                  />
                ))}
              </Box>
            </Box>
          )}

          {/* Utilities */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom fontWeight={600}>
              Chi phí dịch vụ
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <BoltIcon color="warning" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Điện
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {hostel.utilities?.electricity || 'Chưa rõ'}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <WaterDropIcon color="info" />
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Nước
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {hostel.utilities?.water || 'Chưa rõ'}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <WifiIcon color={hostel.utilities?.internet ? 'success' : 'disabled'} />
                  <Typography variant="body1">
                    WiFi: {hostel.utilities?.internet ? 'Có' : hostel.utilities?.internet === false ? 'Không' : 'Chưa rõ'}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <DirectionsCarIcon color={hostel.utilities?.parking ? 'success' : 'disabled'} />
                  <Typography variant="body1">
                    Gửi xe: {hostel.utilities?.parking ? 'Có' : hostel.utilities?.parking === false ? 'Không' : 'Chưa rõ'}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>

          {/* Deposit */}
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AttachMoneyIcon color="primary" />
              <Typography variant="body1">
                <strong>Đặt cọc:</strong> {hostel.depositRequired ? formatPrice(hostel.depositRequired) : 'Chưa rõ'}
              </Typography>
            </Box>
          </Box>

          {/* Rules */}
          {hostel.rules && hostel.rules.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Quy định
              </Typography>
              <Stack spacing={1}>
                {hostel.rules.map((rule, index) => (
                  <Typography key={index} variant="body2" sx={{ pl: 2 }}>
                    • {rule}
                  </Typography>
                ))}
              </Stack>
            </Box>
          )}

          <Divider sx={{ my: 3 }} />

          {/* Posted By */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar
                src={hostel.postedBy?.avatar}
                alt={hostel.postedBy?.name || 'User'}
                sx={{ width: 48, height: 48 }}
              >
                {hostel.postedBy?.name?.charAt(0) || 'U'}
              </Avatar>
              <Box>
                <Typography variant="body1" fontWeight={500}>
                  {hostel.postedBy?.name || 'Chưa rõ'}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <AccessTimeIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary">
                    {hostel.postedAt ? formatRelativeTime(hostel.postedAt) : 'Chưa rõ'}
                  </Typography>
                </Box>
              </Box>
            </Box>
            {hostel.contactPhone ? (
              <Button
                variant="outlined"
                startIcon={<PhoneIcon />}
                href={`tel:${hostel.contactPhone}`}
              >
                {formatPhoneNumber(hostel.contactPhone)}
              </Button>
            ) : (
              <Button
                variant="outlined"
                disabled
                startIcon={<PhoneIcon />}
              >
                Chưa có SĐT
              </Button>
            )}
          </Box>

          {/* Action Buttons */}
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              size="large"
              startIcon={<OpenInNewIcon />}
              href={hostel.fbLink}
              target="_blank"
              rel="noopener noreferrer"
              fullWidth
            >
              Xem bài viết gốc
            </Button>
            <Button
              variant="outlined"
              size="large"
              startIcon={isSaved ? <BookmarkIcon /> : <BookmarkBorderIcon />}
              onClick={() => setIsSaved(!isSaved)}
              sx={{ minWidth: 150 }}
            >
              {isSaved ? 'Đã lưu' : 'Lưu xem sau'}
            </Button>
          </Stack>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

