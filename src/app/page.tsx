'use client';

import {
  Container,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Stack,
  Paper
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';
import SettingsIcon from '@mui/icons-material/Settings';
import Link from 'next/link';

export default function Home() {
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 8 }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h2" component="h1" gutterBottom>
            XuyetXinh.com
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
            Tìm phòng trọ Hà Nội nhanh chóng và dễ dàng
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="center">
            <Button
              variant="contained"
              startIcon={<SearchIcon />}
              size="large"
              component={Link}
              href="/hostels"
            >
              Tìm phòng trọ ngay
            </Button>
            <Button variant="outlined" startIcon={<SettingsIcon />} size="large">
              Cài đặt
            </Button>
          </Stack>
        </Box>

        {/* Feature Cards */}
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 3, mb: 6 }}>
          <Card>
            <CardContent>
              <HomeIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" component="h2" gutterBottom>
                Dễ sử dụng
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Giao diện thân thiện, dễ dàng tìm kiếm và lọc phòng trọ theo nhu cầu.
              </Typography>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <SearchIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" component="h2" gutterBottom>
                Cập nhật liên tục
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tự động thu thập dữ liệu mới nhất từ các Facebook group cho thuê trọ.
              </Typography>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <SettingsIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" component="h2" gutterBottom>
                AI Chatbot
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Trợ lý AI giúp bạn tìm phòng trọ phù hợp nhanh chóng và chính xác.
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* Info Paper */}
        <Paper elevation={0} sx={{ p: 4, bgcolor: 'background.default' }}>
          <Typography variant="h5" gutterBottom>
            Cách thức hoạt động
          </Typography>
          <Typography variant="body1" paragraph>
            1. Sử dụng bộ lọc để tìm phòng trọ theo khu vực, giá cả, diện tích
          </Typography>
          <Typography variant="body1" paragraph>
            2. Xem chi tiết phòng trọ với đầy đủ hình ảnh và thông tin
          </Typography>
          <Typography variant="body1" paragraph>
            3. Lưu các phòng yêu thích để xem sau
          </Typography>
          <Typography variant="body1">
            4. Liên hệ trực tiếp qua số điện thoại hoặc link Facebook gốc
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
}
