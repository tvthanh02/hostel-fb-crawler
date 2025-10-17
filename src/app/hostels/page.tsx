'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Grid,
  Button,
  Alert,
  CircularProgress,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InfiniteScrollIcon from '@mui/icons-material/AllInclusive';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import HostelCard from '@/components/HostelCard';
import HostelDetailModal from '@/components/HostelDetailModal';
import HostelFilters from '@/components/HostelFilters';
import ChatBot from '@/components/ChatBot';
import { Hostel, HostelFilters as Filters } from '@/types/hostel';

const ITEMS_PER_PAGE = 12;

type LoadMode = 'button' | 'infinite';

interface HostelsResponse {
  success: boolean;
  data: Hostel[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  filters: Filters;
}

export default function HostelsPage() {
  const [filters, setFilters] = useState<Filters>({});
  const [selectedHostel, setSelectedHostel] = useState<Hostel | null>(null);
  const [loadMode, setLoadMode] = useState<LoadMode>('button');
  const [isLoading, setIsLoading] = useState(false);
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [pagination, setPagination] = useState<HostelsResponse['pagination']>({
    page: 1,
    limit: ITEMS_PER_PAGE,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });
  const [error, setError] = useState<string | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // Fetch hostels from API
  const fetchHostels = async (page: number, resetData = false) => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: ITEMS_PER_PAGE.toString(),
      });

      // Add filters to params
      if (filters.district) params.append('district', filters.district);
      if (filters.priceMin) params.append('priceMin', filters.priceMin.toString());
      if (filters.priceMax) params.append('priceMax', filters.priceMax.toString());
      if (filters.areaMin) params.append('areaMin', filters.areaMin.toString());
      if (filters.areaMax) params.append('areaMax', filters.areaMax.toString());
      if (filters.roomType) params.append('roomType', filters.roomType);
      if (filters.search) params.append('search', filters.search);

      const response = await fetch(`/api/hostels?${params}`);

      if (!response.ok) {
        throw new Error('Failed to fetch hostels');
      }

      const result: HostelsResponse = await response.json();

      if (result.success) {
        // Reset or append data
        if (resetData) {
          setHostels(result.data);
        } else {
          setHostels((prev) => [...prev, ...result.data]);
        }
        setPagination(result.pagination);
      } else {
        throw new Error('Failed to fetch hostels');
      }
    } catch (err) {
      console.error('Error fetching hostels:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load and when filters change
  useEffect(() => {
    fetchHostels(1, true);
  }, [filters]);

  // Handle load more
  const handleLoadMore = () => {
    if (pagination.hasNext && !isLoading) {
      fetchHostels(pagination.page + 1, false);
    }
  };

  // Infinite scroll with Intersection Observer
  useEffect(() => {
    if (loadMode !== 'infinite' || !pagination.hasNext || isLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          handleLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    const currentRef = loadMoreRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [loadMode, pagination.hasNext, isLoading, pagination.page]);

  return (
    <>
      <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 4 }}>
        <Container maxWidth="xl">
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
              <Box>
                <Typography variant="h4" component="h1" gutterBottom fontWeight={700}>
                  Tìm phòng trọ Hà Nội
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Hiển thị {hostels.length} / {pagination.total} phòng trọ
                </Typography>
              </Box>

              {/* Load Mode Toggle */}
              <ToggleButtonGroup
                value={loadMode}
                exclusive
                onChange={(e, newMode) => newMode && setLoadMode(newMode)}
                size="small"
              >
                <ToggleButton value="button">
                  <ViewModuleIcon sx={{ mr: 1 }} fontSize="small" />
                  Nút xem thêm
                </ToggleButton>
                <ToggleButton value="infinite">
                  <InfiniteScrollIcon sx={{ mr: 1 }} fontSize="small" />
                  Infinite Scroll
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
          </Box>

          {/* Filters */}
          <HostelFilters filters={filters} onFiltersChange={setFilters} />

          {/* Error */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Loading initial */}
          {isLoading && hostels.length === 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
              <CircularProgress />
            </Box>
          )}

          {/* No results */}
          {!isLoading && hostels.length === 0 && !error && (
            <Alert severity="info" sx={{ mb: 3 }}>
              Không tìm thấy phòng trọ phù hợp. Vui lòng thử điều chỉnh bộ lọc.
            </Alert>
          )}

          {/* Results */}
          {hostels.length > 0 && (
            <>
              <Grid container spacing={3} sx={{ mb: 4 }}>
                {hostels.map((hostel) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={hostel.id}>
                    <HostelCard
                      hostel={hostel}
                      onCardClick={setSelectedHostel}
                    />
                  </Grid>
                ))}
              </Grid>

              {/* Load More Section */}
              {pagination.hasNext && (
                <Box
                  ref={loadMoreRef}
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    mt: 4,
                    mb: 4,
                    minHeight: 80,
                  }}
                >
                  {isLoading ? (
                    <Box sx={{ textAlign: 'center' }}>
                      <CircularProgress size={40} />
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                        Đang tải thêm...
                      </Typography>
                    </Box>
                  ) : loadMode === 'button' ? (
                    <Button
                      variant="outlined"
                      size="large"
                      startIcon={<ExpandMoreIcon />}
                      onClick={handleLoadMore}
                      disabled={isLoading}
                      sx={{
                        px: 6,
                        py: 1.5,
                        borderWidth: 2,
                        '&:hover': {
                          borderWidth: 2,
                        },
                      }}
                    >
                      Xem thêm ({pagination.total - hostels.length} phòng)
                    </Button>
                  ) : (
                    <Box sx={{ textAlign: 'center' }}>
                      <CircularProgress size={30} thickness={2} />
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                        Cuộn xuống để xem thêm
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}

              {/* End Message */}
              {!pagination.hasNext && hostels.length > ITEMS_PER_PAGE && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    🎉 Đã hiển thị tất cả {pagination.total} phòng trọ
                  </Typography>
                  <Button
                    variant="text"
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    sx={{ mt: 2 }}
                  >
                    Về đầu trang ↑
                  </Button>
                </Box>
              )}
            </>
          )}
        </Container>
      </Box>

      {/* Detail Modal */}
      <HostelDetailModal
        hostel={selectedHostel}
        open={!!selectedHostel}
        onClose={() => setSelectedHostel(null)}
      />

      {/* ChatBot */}
      <ChatBot />
    </>
  );
}

