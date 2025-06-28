'use client'

import { useState, useEffect } from 'react'

import Link from 'next/link'
import { useParams } from 'next/navigation'

import {
  Box,
  Typography,
  Container,
  Breadcrumbs,
  Link as MuiLink,
  Card,
  CardContent,
  Avatar,
  Chip,
  Rating,
  Button,
  Tabs,
  Tab,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Snackbar,
  Alert
} from '@mui/material'
import {
  Store,
  Factory,
  Ship,
  MapPin,
  Calendar,
  Users,
  Package,
  Heart,
  HeartOff,
  Share2,
  CheckCircle,
  Phone,
  Mail,
  Globe,
  Clock
} from 'lucide-react'

import { StoreProvider, useStore, STORE_TYPES } from '@/components/contexts/StoreContext'
import { ProductProvider, useProduct } from '@/components/contexts/ProductContext'
import { CartProvider, useCart } from '@/components/contexts/CartContext'
import { NegotiationProvider } from '@/components/contexts/NegotiationContext'
import { OrderProvider } from '@/components/contexts/OrderContext'
import { ServiceOrderProvider } from '@/components/contexts/ServiceOrderContext'
import ProductGrid from '@/views/apps/explore/products/ProductGrid'
import Reviews from './Reviews'
import apiClient from '@/libs/api'

const StoreDetailsContent = () => {
  const params = useParams()
  const storeId = params.id
  const { getStoreById } = useStore()
  const { setSelectedStoreId } = useProduct()
  const { addToCart } = useCart()

  const [store, setStore] = useState(null)
  const [activeTab, setActiveTab] = useState('products')
  const [isSaved, setIsSaved] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  const [rating, setRating] = useState(0)
  const [reviewsCount, setReviewsCount] = useState(0)


  useEffect(() => {
    if (storeId) {
      const storeData = getStoreById(storeId)

      setStore(storeData)
      setSelectedStoreId(storeId)

      // Set saved status from store data
      if (storeData) {
        setIsSaved(storeData.isSaved || false)
      }

      // Fetch store rating and reviews count
      const fetchStoreRatingAndReviews = async () => {
        try {
          const response = await apiClient.get(`/suppliers/${storeId}/reviews`)
          const reviewsData = response.data.data

          console.log('reviewsData', reviewsData)
          setRating(reviewsData.average_rating)
          setReviewsCount(reviewsData.review_count)
        } catch (err) {
          console.error('Error fetching store rating and reviews:', err)
        }
      }

      fetchStoreRatingAndReviews()
    }
  }, [storeId, getStoreById, setSelectedStoreId])

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue)
  }

  const handleToggleSaved = async () => {
    if (isSaving) return

    setIsSaving(true)
    try {
      if (isSaved) {
        // Unsave
        await apiClient.post('/saved-suppliers/unsave', {
          supplier_id: storeId
        })
        setSnackbar({
          open: true,
          message: `Removed ${store?.name} from favorites`,
          severity: 'info'
        })
      } else {
        // Save
        await apiClient.post('/saved-suppliers/save', {
          supplier_id: storeId
        })
        setSnackbar({
          open: true,
          message: `Added ${store?.name} to favorites`,
          severity: 'success'
        })
      }
      setIsSaved(!isSaved)
    } catch (error) {
      console.error('Failed to save/unsave store:', error)
      setSnackbar({
        open: true,
        message: 'Failed to save/unsave store',
        severity: 'error'
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleShare = () => {
    alert(`Sharing store: ${store?.name}`)
  }

  const handleAddToCart = product => {
    addToCart(product)
    setSnackbar({
      open: true,
      message: `${product.name} added to cart`,
      severity: 'success'
    })
  }

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false })
  }

  const getStoreTypeIcon = type => {
    switch (type) {
      case STORE_TYPES.RAW_MATERIAL:
        return <Factory size={20} />
      case STORE_TYPES.IMPORT:
        return <Ship size={20} />
      case STORE_TYPES.NORMAL:
      default:
        return <Store size={20} />
    }
  }

  const getStoreTypeLabel = type => {
    switch (type) {
      case STORE_TYPES.RAW_MATERIAL:
        return 'Raw Material Store'
      case STORE_TYPES.IMPORT:
        return 'Import Store'
      case STORE_TYPES.NORMAL:
      default:
        return 'Retail Store'
    }
  }

  let dashboardHref = '/en/dashboard'

  if (typeof window !== 'undefined') {
    const langMatch = window.location.pathname.match(/^\/(\w{2})\//)
    const lang = langMatch ? langMatch[1] : 'en'

    dashboardHref = `/${lang}/dashboard`
  }

  if (!store) {
    return (
      <Container maxWidth='xl'>
        <Typography variant='h6'>Loading store details...</Typography>
      </Container>
    )
  }

  return (
    <Container maxWidth='xl'>
      <Box sx={{ mb: 4 }}>
        <Breadcrumbs aria-label='breadcrumb'>
          <MuiLink component={Link} href={dashboardHref} underline='hover' color='inherit'>
            Dashboard
          </MuiLink>
          <MuiLink component={Link} href='/apps/explore/products-and-stores' underline='hover' color='inherit'>
            Products & Stores
          </MuiLink>
          <Typography color='text.primary'>{store.name}</Typography>
        </Breadcrumbs>
      </Box>

      <Card sx={{ mb: 4, overflow: 'hidden' }}>
        <Box sx={{ position: 'relative' }}>
          <Box
            component='img'
            src={store.coverImage || '/placeholder.svg?height=200&width=1200'}
            alt={store.name}
            sx={{ width: '100%', height: 200, objectFit: 'cover' }}
          />
          <Box
            sx={{
              position: 'absolute',
              bottom: -40,
              left: 24,
              display: 'flex',
              alignItems: 'flex-end',
              gap: 2
            }}
          >
            <Avatar
              src={store.logo || '/placeholder.svg?height=100&width=100'}
              alt={store.name}
              sx={{ width: 100, height: 100, border: '4px solid white', boxShadow: 2 }}
            />
          </Box>
        </Box>

        <CardContent sx={{ pt: 8 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2, mt: 4 }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant='h4'>{store.name}</Typography>
                {store.verified && (
                  <Chip
                    icon={<CheckCircle size={16} />}
                    label='Verified'
                    color='primary'
                    size='small'
                    variant='outlined'
                  />
                )}

              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                <Chip
                  icon={getStoreTypeIcon(store.type)}
                  label={getStoreTypeLabel(store.type)}
                  size='small'
                  variant='outlined'
                />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Rating value={rating} precision={0.1} size='small' readOnly />
                  <Typography variant='body2'>({reviewsCount} reviews)</Typography>
                </Box>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant={isSaved ? 'outlined' : 'contained'}
                startIcon={isSaved ? <HeartOff /> : <Heart />}
                onClick={handleToggleSaved}
                disabled={isSaving}
              >
                {isSaved ? 'Saved' : 'Save'}
              </Button>
              <Button variant='outlined' startIcon={<Share2 />} onClick={handleShare}>
                Share
              </Button>
            </Box>
          </Box>

          <Typography variant='body1' paragraph>
            {store.description}
          </Typography>

          <Box sx={{ display: 'flex', gap: 4, mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Package />
              <Typography variant='body1'>{store.productCount} Products</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Users />
              <Typography variant='body1'>{store.followers.toLocaleString()} Followers</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Calendar />
              <Typography variant='body1'>Since {store.since}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <MapPin />
              <Typography variant='body1'>{store.location}</Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 4 }}>
        <Tab value='products' label='Products' />
        <Tab value='about' label='About' />
        <Tab value='reviews' label='Reviews' />
      </Tabs>

      {activeTab === 'products' && <ProductGrid onAddToCart={handleAddToCart} />}

      {activeTab === 'about' && (
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant='h6' gutterBottom>
                  Store Information
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <MapPin />
                    </ListItemIcon>
                    <ListItemText primary='Location' secondary={store.location} />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Calendar />
                    </ListItemIcon>
                    <ListItemText primary='Established' secondary={store.since} />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Package />
                    </ListItemIcon>
                    <ListItemText primary='Products' secondary={store.productCount} />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Users />
                    </ListItemIcon>
                    <ListItemText primary='Followers' secondary={store.followers.toLocaleString()} />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant='h6' gutterBottom>
                  Contact Information
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <Phone />
                    </ListItemIcon>
                    <ListItemText primary='Phone' secondary='+1 (555) 123-4567' />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Mail />
                    </ListItemIcon>
                    <ListItemText
                      primary='Email'
                      secondary={`contact@${store.name.toLowerCase().replace(/\s+/g, '')}.com`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Globe />
                    </ListItemIcon>
                    <ListItemText
                      primary='Website'
                      secondary={`www.${store.name.toLowerCase().replace(/\s+/g, '')}.com`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Clock />
                    </ListItemIcon>
                    <ListItemText primary='Business Hours' secondary='Mon-Fri: 9AM-6PM, Sat: 10AM-4PM' />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {activeTab === 'reviews' && <Reviews />}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  )
}

const StoreDetailsPage = () => {
  return (
    <StoreProvider>
      <ProductProvider>
        <CartProvider>
          <NegotiationProvider>
            <OrderProvider>
              <ServiceOrderProvider>
                <StoreDetailsContent />
              </ServiceOrderProvider>
            </OrderProvider>
          </NegotiationProvider>
        </CartProvider>
      </ProductProvider>
    </StoreProvider>
  )
}

export default StoreDetailsPage
