'use client';

import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  IconButton,
  Menu,
  MenuItem,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import Link from 'next/link';
import { useState } from 'react';

export default function Navbar() {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar position="sticky" elevation={1}>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* Logo */}
          <HomeIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} />
          <Typography
            variant="h6"
            noWrap
            component={Link}
            href="/"
            sx={{
              mr: 2,
              display: { xs: 'none', md: 'flex' },
              fontWeight: 700,
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            XuyetXinh.com
          </Typography>

          {/* Mobile Menu */}
          {isMobile && (
            <>
              <IconButton
                size="large"
                onClick={handleMenuOpen}
                color="inherit"
              >
                <MenuIcon />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
              >
                <MenuItem component={Link} href="/" onClick={handleMenuClose}>
                  Trang chủ
                </MenuItem>
                <MenuItem component={Link} href="/hostels" onClick={handleMenuClose}>
                  Tìm phòng trọ
                </MenuItem>
                <MenuItem component={Link} href="/saved" onClick={handleMenuClose}>
                  Đã lưu
                </MenuItem>
              </Menu>
            </>
          )}

          {/* Mobile Logo */}
          <Typography
            variant="h6"
            noWrap
            component={Link}
            href="/"
            sx={{
              mr: 2,
              display: { xs: 'flex', md: 'none' },
              flexGrow: 1,
              fontWeight: 700,
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            Hostel FB
          </Typography>

          {/* Desktop Menu */}
          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, gap: 1 }}>
            <Button
              component={Link}
              href="/hostels"
              startIcon={<SearchIcon />}
              sx={{ color: 'white' }}
            >
              Tìm phòng trọ
            </Button>
            <Button
              component={Link}
              href="/saved"
              startIcon={<BookmarkIcon />}
              sx={{ color: 'white' }}
            >
              Đã lưu
            </Button>
          </Box>

          {/* Right side buttons */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              sx={{
                color: 'white',
                borderColor: 'white',
                '&:hover': {
                  borderColor: 'white',
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
            >
              Đăng tin
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

