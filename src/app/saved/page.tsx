'use client';

import {
  Container,
  Box,
  Typography,
  Alert,
  Button,
} from '@mui/material';
import Link from 'next/link';
import SearchIcon from '@mui/icons-material/Search';

export default function SavedPage() {
  // TODO: Implement saved hostels functionality with local storage or database
  const savedHostels: any[] = [];

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: 'calc(100vh - 64px)', py: 4 }}>
      <Container maxWidth="xl">
        <Typography variant="h4" component="h1" gutterBottom fontWeight={700}>
          Phòng trọ đã lưu
        </Typography>

        {savedHostels.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Alert severity="info" sx={{ mb: 3, maxWidth: 500, mx: 'auto' }}>
              Bạn chưa lưu phòng trọ nào. Hãy tìm kiếm và lưu các phòng trọ yêu thích để xem sau.
            </Alert>
            <Button
              variant="contained"
              startIcon={<SearchIcon />}
              component={Link}
              href="/hostels"
              size="large"
            >
              Tìm phòng trọ
            </Button>
          </Box>
        ) : (
          <Box>
            {/* TODO: Display saved hostels here */}
            <Typography>Hiển thị danh sách phòng đã lưu</Typography>
          </Box>
        )}
      </Container>
    </Box>
  );
}

