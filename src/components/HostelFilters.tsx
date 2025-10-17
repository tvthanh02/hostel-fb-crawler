'use client';

import {
  Box,
  TextField,
  MenuItem,
  Slider,
  Typography,
  Button,
  Paper,
  Grid,
  InputAdornment,
  Collapse,
  IconButton,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import { HostelFilters as Filters } from '@/types/hostel';
import { useState } from 'react';
import { hanoiDistricts } from '@/lib/mockData';

interface HostelFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
}

export default function HostelFilters({ filters, onFiltersChange }: HostelFiltersProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [priceRange, setPriceRange] = useState<number[]>([
    filters.priceMin || 0,
    filters.priceMax || 10000000,
  ]);

  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value });
  };

  const handleDistrictChange = (value: string) => {
    onFiltersChange({ ...filters, district: value || undefined });
  };

  const handleRoomTypeChange = (value: string) => {
    onFiltersChange({ ...filters, roomType: value || undefined });
  };

  const handlePriceChange = (event: Event, newValue: number | number[]) => {
    setPriceRange(newValue as number[]);
  };

  const handlePriceCommit = () => {
    onFiltersChange({
      ...filters,
      priceMin: priceRange[0],
      priceMax: priceRange[1],
    });
  };

  const handleClearFilters = () => {
    setPriceRange([0, 10000000]);
    onFiltersChange({});
  };

  const hasActiveFilters = filters.district || filters.roomType || filters.priceMin || filters.priceMax || filters.search;

  return (
    <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
      <Grid container spacing={2} alignItems="center">
        {/* Search */}
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            placeholder="Tìm kiếm phòng trọ..."
            value={filters.search || ''}
            onChange={(e) => handleSearchChange(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Grid>

        {/* District */}
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            select
            fullWidth
            label="Quận/Huyện"
            value={filters.district || ''}
            onChange={(e) => handleDistrictChange(e.target.value)}
          >
            <MenuItem value="">Tất cả</MenuItem>
            {hanoiDistricts.map((district) => (
              <MenuItem key={district} value={district}>
                {district}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Room Type */}
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            select
            fullWidth
            label="Loại phòng"
            value={filters.roomType || ''}
            onChange={(e) => handleRoomTypeChange(e.target.value)}
          >
            <MenuItem value="">Tất cả</MenuItem>
            <MenuItem value="single">Phòng đơn</MenuItem>
            <MenuItem value="shared">Phòng ghép</MenuItem>
            <MenuItem value="apartment">Căn hộ</MenuItem>
            <MenuItem value="studio">Studio</MenuItem>
          </TextField>
        </Grid>

        {/* Advanced Filters Toggle */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              startIcon={<FilterListIcon />}
              onClick={() => setShowAdvanced(!showAdvanced)}
              size="small"
            >
              {showAdvanced ? 'Ẩn bộ lọc nâng cao' : 'Hiện bộ lọc nâng cao'}
            </Button>
            {hasActiveFilters && (
              <Button
                startIcon={<ClearIcon />}
                onClick={handleClearFilters}
                size="small"
                color="error"
              >
                Xóa bộ lọc
              </Button>
            )}
          </Box>
        </Grid>

        {/* Advanced Filters */}
        <Grid item xs={12}>
          <Collapse in={showAdvanced}>
            <Box sx={{ pt: 2 }}>
              <Typography variant="body2" gutterBottom fontWeight={500}>
                Khoảng giá (triệu đồng/tháng)
              </Typography>
              <Box sx={{ px: 2 }}>
                <Slider
                  value={priceRange}
                  onChange={handlePriceChange}
                  onChangeCommitted={handlePriceCommit}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => `${(value / 1000000).toFixed(1)}tr`}
                  min={0}
                  max={10000000}
                  step={500000}
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="caption" color="text.secondary">
                    {(priceRange[0] / 1000000).toFixed(1)}tr
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {(priceRange[1] / 1000000).toFixed(1)}tr
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Collapse>
        </Grid>
      </Grid>
    </Paper>
  );
}

