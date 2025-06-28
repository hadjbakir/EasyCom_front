'use client'

import { useState, useEffect } from 'react';

import { useParams } from 'next/navigation';

import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
} from '@mui/material';

import { ImageIcon, ArrowLeft, ArrowRight } from 'lucide-react';

import DialogCloseButton from '@/components/dialogs/DialogCloseButton';
import apiClient from '@/libs/api';

const STORAGE_BASE_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000').replace(/\/+$/, '');

const PortfolioImageDialog = ({ open, setOpen, selectedItem }) => {
  const [carouselIndex, setCarouselIndex] = useState(0);

  const handleClose = () => {
    setOpen(false);
    setCarouselIndex(0);
  };

  const handleNext = () => {
    setCarouselIndex((prev) => (prev + 1) % selectedItem.images.length);
  };

  const handlePrev = () => {
    setCarouselIndex((prev) => (prev - 1 + selectedItem.images.length) % selectedItem.images.length);
  };

  return (
    <Dialog
      fullWidth
      maxWidth="md"
      open={open}
      onClose={handleClose}
      scroll="body"
      closeAfterTransition={false}
      sx={{ '& .MuiDialog-paper': { overflow: 'visible' } }}
    >
      <DialogCloseButton onClick={handleClose} disableRipple>
        <i className="tabler-x" />
      </DialogCloseButton>
      <DialogTitle variant="h4" className="flex gap-2 flex-col text-center sm:pbs-16 sm:pbe-6 sm:pli-16">
        {selectedItem?.title || 'Portfolio Images'}
        <Typography component="span" className="flex flex-col text-center">
          View all images for this portfolio item.
        </Typography>
      </DialogTitle>
      <DialogContent className="pbs-0 sm:pli-16 sm:pbe-16">
        {selectedItem && (
          <>
            <Box className="relative">
              <img
                src={selectedItem.images[carouselIndex]?.url || '/placeholder.svg'}
                alt={selectedItem.title || `Image ${carouselIndex + 1}`}
                className="w-full h-auto rounded-md max-h-[50vh] object-contain bg-background"
              />
              {selectedItem.images.length > 1 && (
                <>
                  <IconButton
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white shadow-md"
                    onClick={handlePrev}
                    sx={{ color: 'black' }}
                  >
                    <ArrowLeft size={20} />
                  </IconButton>
                  <IconButton
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white shadow-md"
                    onClick={handleNext}
                    sx={{ color: 'black' }}
                  >
                    <ArrowRight size={20} />
                  </IconButton>
                  <Box className="absolute bottom-2 left-0 right-0 flex justify-center">
                    <Box className="flex gap-1 bg-black/50 rounded-full px-2 py-1">
                      {selectedItem.images.map((_, index) => (
                        <Box
                          key={index}
                          className={`w-2 h-2 rounded-full ${index === carouselIndex ? 'bg-white' : 'bg-white/50'}`}
                        />
                      ))}
                    </Box>
                  </Box>
                </>
              )}
            </Box>
            {selectedItem.description && (
              <Box className="mt-4">
                <Typography variant="body2" className="text-textSecondary mb-2">
                  Description
                </Typography>
                <Typography variant="body2">{selectedItem.description}</Typography>
              </Box>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

const PortfolioTab = ({ portfolio }) => {
  const { id } = useParams();
  const [projectItems, setProjectItems] = useState(portfolio?.projects || []);
  const [pictureItems, setPictureItems] = useState(portfolio?.pictures || []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openImageDialog, setOpenImageDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // Fetch portfolio items on mount
  useEffect(() => {
    const fetchPortfolioItems = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiClient.get(`/service-providers/${id}/portfolio`);
        const { projects, service_provider_pictures } = response.data.data;

        const newProjectItems = projects.map((project) => ({
          id: project.id.toString(),
          type: 'title',
          title: project.title || '',
          description: project.description || '',
          images: project.pictures.map((p) => ({
            id: p.id,
            url: p.picture.startsWith('/storage/')
              ? `${STORAGE_BASE_URL}${p.picture}`
              : `${STORAGE_BASE_URL}/storage/${p.picture}`,
          })),
          created_at: project.created_at,
        }));

        const newPictureItems = service_provider_pictures.length > 0 ? [{
          id: 'simple-portfolio',
          type: 'simple',
          title: '',
          description: '',
          images: service_provider_pictures.map((p) => ({
            id: p.id,
            url: p.picture.startsWith('/storage/')
              ? `${STORAGE_BASE_URL}${p.picture}`
              : `${STORAGE_BASE_URL}/storage/${p.picture}`,
          })),
          created_at: service_provider_pictures[0].created_at,
        }] : [];

        setProjectItems(newProjectItems);
        setPictureItems(newPictureItems);

        if (process.env.NODE_ENV !== 'production') {
          console.log('Projects fetched:', newProjectItems);
          console.log('Pictures fetched:', newPictureItems);
        }
      } catch (error) {
        setError(error.response?.data?.message || 'Failed to load portfolio items');
        console.error('Fetch portfolio error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchPortfolioItems();
  }, [id]);

  const handleOpenImageDialog = (item) => {
    setSelectedItem(item);
    setOpenImageDialog(true);
  };

  const renderPortfolioItem = (item) => {
    switch (item.type) {
      case 'simple':
        return (
          <Card>
            <CardContent>
              <Grid container spacing={2}>
                {item.images.map((image, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <CardActionArea onClick={() => handleOpenImageDialog(item)}>
                      <CardMedia
                        component="img"
                        height="200"
                        image={image.url}
                        alt={`Portfolio image ${index + 1}`}
                        sx={{ borderRadius: 1 }}
                        onError={() => console.error(`Failed to load image: ${image.url}`)}
                      />
                    </CardActionArea>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        );

      case 'title':
        return (
          <Card className="h-full">
            <CardActionArea onClick={() => handleOpenImageDialog(item)}>
              <CardMedia
                component="img"
                height="140"
                image={item.images[0]?.url || '/placeholder.svg'}
                alt={item.title}
                className="h-44 object-cover"
              />
              <CardContent>
                <Typography variant="subtitle1" className="font-medium">
                  {item.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.description ? item.description.substring(0, 50) + '...' : 'Project'}
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center p-6">
          <CircularProgress />
          <Typography className="ml-2">Loading portfolio items...</Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" className="mb-4">
          {error}
        </Alert>
      )}
      {/* Projects Section */}
      <Box className="mb-8">
        <Typography variant="h5" className="mb-4">Projects</Typography>
        <Grid container spacing={3}>
          {projectItems.map((item) => (
            <Grid item xs={12} md={4} key={item.id}>
              {renderPortfolioItem(item)}
            </Grid>
          ))}
          {projectItems.length === 0 && (
            <Grid item xs={12}>
              <Card>
                <CardContent className="text-center py-10">
                  <ImageIcon size={48} className="mx-auto mb-4 text-textSecondary" />
                  <Typography variant="h6">No Projects</Typography>
                  <Typography variant="body2" color="textSecondary" className="mt-1">
                    No projects available to display.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      </Box>

      {/* Photos table */}
      <Box>
        <Typography variant="h5" className="mb-4">Photos</Typography>
        <Grid container spacing={3}>
          {pictureItems.map((item) => (
            <Grid item xs={12} key={item.id}>
              {renderPortfolioItem(item)}
            </Grid>
          ))}
          {pictureItems.length === 0 && (
            <Grid item xs={12}>
              <Card>
                <CardContent className="text-center py-10">
                  <ImageIcon size={48} className="mx-auto mb-4 text-textSecondary" />
                  <Typography variant="h6">No Photos</Typography>
                  <Typography variant="body2" color="textSecondary" className="mt-1">
                    No photos available to display.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      </Box>

      {/* Image Display Dialog */}
      <PortfolioImageDialog
        open={openImageDialog}
        setOpen={setOpenImageDialog}
        selectedItem={selectedItem}
      />
    </Box>
  );
};

export default PortfolioTab;
