'use client'

import { useState, useEffect, Suspense, useMemo } from 'react'

import { useParams, useRouter } from 'next/navigation'

import {
  Box,
  Typography,
  Container,
  Snackbar,
  Alert,
  CircularProgress,
  Paper,
  Chip,
  Grid,
  Card,
  CardContent,
  CardMedia,
  useTheme,
  Stack,
  Button,
  Divider,
  Rating,
  Tooltip,
  IconButton,
  Avatar,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Slider
} from '@mui/material'

import { ShoppingCart, Heart, HeartOff, Search, X, Filter } from 'lucide-react'

import { motion, AnimatePresence } from 'framer-motion'

import { useSession } from 'next-auth/react'

import { getLocalizedUrl } from '@/utils/i18n'
import apiClient from '@/libs/api'

import { ProductProvider } from '@/components/contexts/ProductContext'
import { CartProvider, useCart } from '@/components/contexts/CartContext'
import { SavedProvider } from '@/components/contexts/SavedContext'
import { OrderProvider } from '@/components/contexts/OrderContext'
import AnimatedPagination from '@/components/ui/pagination/AnimatedPagination'

const STORAGE_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

const buildImageUrl = picture => {
  if (!picture) return null
  if (picture.startsWith('http')) return picture
  const cleanPath = picture.replace(/^(storage\/|public\/)/, '')

  return `${STORAGE_BASE_URL}/storage/${cleanPath}`
}

const ProductCard = ({ product, onAddToCart, locale }) => {
  const router = useRouter()
  const [isSaved, setIsSaved] = useState(product.isSaved || false)
  const [isSaving, setIsSaving] = useState(false)

  const discount =
    product.originalPrice && product.price < product.originalPrice
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0

  const handleViewProduct = () => {
    router.push(getLocalizedUrl(`/apps/explore/products/product-details/${product.id}`, locale))
  }

  const handleAddToCartClick = e => {
    e.stopPropagation()
    onAddToCart(product)
  }

  const handleToggleSaved = async e => {
    e.stopPropagation()
    if (isSaving) return
    setIsSaving(true)

    try {
      const endpoint = isSaved ? '/saved-products/unsave' : '/saved-products/save'

      await apiClient.post(endpoint, { product_id: product.id })
      setIsSaved(!isSaved)
    } catch (error) {
      console.error('Failed to save/unsave product:', error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4
        }
      }}
      onClick={handleViewProduct}
    >
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component='img'
          image={product.image || 'https://placehold.co/300x300'}
          alt={product.name}
          sx={{ height: 300 }}
          onError={e => {
            e.target.src = 'https://placehold.co/300x300'
          }}
        />
        <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 0.5 }}>
          <Tooltip title={isSaved ? 'Remove from favorites' : 'Save to favorites'}>
            <IconButton
              size='small'
              onClick={handleToggleSaved}
              disabled={isSaving}
              sx={{
                bgcolor: 'background.paper',
                '&:hover': { bgcolor: 'primary.light' },
                color: isSaved ? 'primary.main' : 'text.primary'
              }}
            >
              {isSaved ? <Heart size={18} /> : <HeartOff size={18} />}
            </IconButton>
          </Tooltip>
        </Box>
        {discount > 0 && (
          <Chip label={`-${discount}%`} color='error' size='small' sx={{ position: 'absolute', top: 8, left: 8 }} />
        )}
        <Chip
          label='Clearance'
          color='error'
          size='small'
          sx={{
            position: 'absolute',
            bottom: 8,
            left: 8,
            zIndex: 1,
            fontWeight: 'bold'
          }}
        />
      </Box>
      <CardContent sx={{ pt: 2, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography variant='h6' component='div' sx={{ mb: 1, fontWeight: 600, minHeight: '3em' }}>
          {product.name}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
          <Rating value={product.rating} precision={0.1} size='small' readOnly />
          <Typography variant='body2'>({product.reviewCount} reviews)</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant='h6' color='primary' sx={{ fontWeight: 600 }}>
            {product.price.toFixed(2)} DA
          </Typography>
          {discount > 0 && (
            <Typography variant='body2' color='text.secondary' sx={{ textDecoration: 'line-through', ml: 1 }}>
              {product.originalPrice.toFixed(2)} DA
            </Typography>
          )}
        </Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            mb: 2,
            p: 1,
            borderRadius: 1,
            bgcolor: 'background.default'
          }}
        >
          <Avatar
            src={product.storeLogo || 'https://placehold.co/24x24'}
            alt={product.storeName}
            sx={{ width: 24, height: 24 }}
          />
          <Typography variant='body2' sx={{ flex: 1, fontWeight: 500 }}>
            {product.storeName}
          </Typography>
        </Box>
        <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'space-between' }}>
          <Button variant='outlined' size='small' onClick={handleViewProduct}>
            View Details
          </Button>
          <Button
            variant='contained'
            size='small'
            startIcon={<ShoppingCart size={16} />}
            onClick={handleAddToCartClick}
            disabled={!product.inStock}
          >
            Add to Cart
          </Button>
        </Box>
      </CardContent>
    </Card>
  )
}

const ClearanceProductGrid = ({ onAddToCart }) => {
  const [allProducts, setAllProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { lang: locale } = useParams()
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const { data: session, status } = useSession()

  // State for filtering and pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(12)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [priceRange, setPriceRange] = useState([0, 500000])
  const [localPriceRange, setLocalPriceRange] = useState([0, 500000])
  const [showFilters, setShowFilters] = useState(false)
  const [isChangingPage, setIsChangingPage] = useState(false)

  // Fetch all products once
  useEffect(() => {
    const fetchAllClearanceProducts = async () => {
      setLoading(true)
      setError(null)

      try {
        const [productsResponse, suppliersResponse] = await Promise.all([
          apiClient.get('/products/clearance/all?per_page=all'),
          apiClient.get('/suppliers')
        ])

        const productsData = Array.isArray(productsResponse.data)
          ? productsResponse.data
          : productsResponse.data?.data || []

        const suppliersData = Array.isArray(suppliersResponse.data.data) ? suppliersResponse.data.data : []

        // Create a map for quick supplier lookup
        const suppliersMap = suppliersData.reduce((acc, supplier) => {
          acc[supplier.id] = supplier

          return acc
        }, {})

        // Find current user's supplier ID
        let userSupplierId = null

        if (status === 'authenticated' && session && session.user) {
          const currentUserSupplier = suppliersData.find(
            supplier => supplier.user_id?.toString() === session.user.id?.toString()
          )

          if (currentUserSupplier) {
            userSupplierId = currentUserSupplier.id.toString()
          }
        }

        // Filter out user's own products and adapt the product data
        const adaptedProducts = productsData
          .filter(p => !userSupplierId || p.supplier_id?.toString() !== userSupplierId)
          .map(p => {
            const supplier = suppliersMap[p.supplier_id] || { name: 'Unknown Store', logo: null, id: p.supplier_id }
            const price = Number.parseFloat(p.price)
            const originalPrice = Number.parseFloat(p.original_price || price * 1.5)

            return {
              id: p.id,
              name: p.name || 'Unknown Product',
              price,
              originalPrice,
              description: p.description || '',
              image: buildImageUrl(p.pictures?.[0]?.picture),
              rating: p.rating || 0,
              reviewCount: p.review_count || 0,
              storeId: p.supplier_id,
              storeName: supplier.business_name || 'Unknown Store',
              storeLogo: buildImageUrl(supplier.picture),
              category: p.category_name || 'Uncategorized',
              featured: p.featured || false,
              inStock: (p.quantity || 0) > 0,
              pictures: (p.pictures || []).map(pic => ({ id: pic.id, picture: buildImageUrl(pic.picture) })),
              isSaved: p.is_saved || false,
              minimumQuantity: p.minimum_quantity || 1
            }
          })

        setAllProducts(adaptedProducts)
      } catch (err) {
        console.error('Failed to fetch clearance products:', err)
        setError('Could not load clearance products. Please try again later.')
      } finally {
        setLoading(false)
      }
    }

    if (status !== 'loading') {
      fetchAllClearanceProducts()
    }
  }, [status, session])

  // Client-side filtering and sorting
  const filteredProducts = useMemo(() => {
    let products = [...allProducts]

    // Search filter
    if (searchTerm) {
      products = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
    }

    // Price range filter
    products = products.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1])

    // Sorting
    switch (sortBy) {
      case 'price-low-high':
        products.sort((a, b) => a.price - b.price)
        break
      case 'price-high-low':
        products.sort((a, b) => b.price - a.price)
        break
      case 'rating':
        products.sort((a, b) => b.rating - a.rating)
        break
      case 'newest':
      default:
        products.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        break
    }

    return products
  }, [allProducts, searchTerm, sortBy, priceRange])

  // Client-side pagination
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage

    return filteredProducts.slice(startIndex, startIndex + itemsPerPage)
  }, [filteredProducts, currentPage, itemsPerPage])

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)

  // Handlers
  const handleSearchChange = e => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }

  const handleClearSearch = () => {
    setSearchTerm('')
    setCurrentPage(1)
  }

  const handleSortChange = e => {
    setSortBy(e.target.value)
  }

  const handlePriceChange = (event, newValue) => {
    setLocalPriceRange(newValue)
  }

  const handlePriceChangeCommitted = (event, newValue) => {
    setPriceRange(newValue)
    setCurrentPage(1)
  }

  const handlePageChange = (event, newPage) => {
    if (newPage === currentPage || newPage < 1) return
    setIsChangingPage(true)
    setTimeout(() => {
      setCurrentPage(newPage)
      const gridTop = document.getElementById('clearance-grid-top')

      if (gridTop) {
        gridTop.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }

      setTimeout(() => setIsChangingPage(false), 100)
    }, 300)
  }

  const handleItemsPerPageChange = event => {
    setItemsPerPage(Number(event.target.value))
    setCurrentPage(1)
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
    exit: { opacity: 0, transition: { duration: 0.2 } }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } }
  }

  return (
    <Box>
      <Box
        id='clearance-grid-top'
        sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}
      >
        <TextField
          placeholder='Search clearance items...'
          value={searchTerm}
          onChange={handleSearchChange}
          size='small'
          sx={{ flexGrow: 1, minWidth: '250px' }}
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <Search size={20} />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position='end'>
                <IconButton size='small' onClick={handleClearSearch}>
                  <X size={16} />
                </IconButton>
              </InputAdornment>
            )
          }}
        />
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Button
            variant={showFilters ? 'contained' : 'outlined'}
            startIcon={<Filter size={16} />}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filters
          </Button>
          <FormControl size='small' sx={{ minWidth: 180 }}>
            <InputLabel>Sort By</InputLabel>
            <Select value={sortBy} onChange={handleSortChange} label='Sort By'>
              <MenuItem value='newest'>Newest</MenuItem>
              <MenuItem value='price-low-high'>Price: Low to High</MenuItem>
              <MenuItem value='price-high-low'>Price: High to Low</MenuItem>
              <MenuItem value='rating'>Highest Rating</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <Box sx={{ mb: 4, p: 3, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 1 }}>
              <Typography variant='h6' gutterBottom>
                Price Range
              </Typography>
              <Box sx={{ px: 2 }}>
                <Slider
                  value={localPriceRange}
                  onChange={handlePriceChange}
                  onChangeCommitted={handlePriceChangeCommitted}
                  valueLabelDisplay='auto'
                  min={0}
                  max={500000}
                  step={1000}
                  marks={[
                    { value: 0, label: '0 DA' },
                    { value: 100000, label: '100K DA' },
                    { value: 250000, label: '250K DA' },
                    { value: 500000, label: '500K+ DA' }
                  ]}
                  valueLabelFormat={value => `${value.toLocaleString()} DA`}
                />
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Typography variant='body2'>{localPriceRange[0].toLocaleString()} DA</Typography>
                <Typography variant='body2'>{localPriceRange[1].toLocaleString()} DA</Typography>
              </Box>
            </Box>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress size={80} sx={{ color: isDark ? '#ff8c00' : '#ff6b6b' }} />
        </Box>
      ) : error ? (
        <Alert severity='error'>{error}</Alert>
      ) : filteredProducts.length > 0 ? (
        <>
          <AnimatePresence mode='wait'>
            {!isChangingPage && (
              <motion.div
                key={`page-${currentPage}`}
                variants={containerVariants}
                initial='hidden'
                animate='visible'
                exit='exit'
              >
                <Grid container spacing={3}>
                  {paginatedProducts.map(product => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                      <motion.div variants={itemVariants} style={{ height: '100%' }}>
                        <ProductCard product={product} onAddToCart={onAddToCart} locale={locale} />
                      </motion.div>
                    </Grid>
                  ))}
                </Grid>
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatedPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handleItemsPerPageChange}
            itemsPerPage={itemsPerPage}
            totalItems={filteredProducts.length}
          />
        </>
      ) : (
        <Typography
          variant='h6'
          textAlign='center'
          sx={{
            color: isDark ? 'rgba(255,255,255,0.7)' : 'text.secondary',
            py: 5,
            fontSize: '1.2rem',
            lineHeight: 1.6
          }}
        >
          No clearance products match your criteria. Try adjusting your filters!
        </Typography>
      )}
    </Box>
  )
}

const ClearanceProductsContent = () => {
  const { lang: locale } = useParams()
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  const [timeLeft, setTimeLeft] = useState({ hours: 23, minutes: 45, seconds: 12 })
  const { addToCart, isAuthenticated } = useCart()
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  // Countdown timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 }
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 }
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 }
        }

        return prev
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const handleAddToCart = product => {
    if (!isAuthenticated) {
      setSnackbar({
        open: true,
        message: 'Please log in to add items to your cart',
        severity: 'warning'
      })

      return
    }

    addToCart(product)
    setSnackbar({
      open: true,
      message: `${product.name} added to cart`,
      severity: 'success'
    })
  }

  const handleCloseSnackbar = () => setSnackbar({ ...snackbar, open: false })

  // Dynamic colors based on theme
  const gradientBg = isDark
    ? 'linear-gradient(135deg, rgba(139, 69, 19, 0.4) 0%, rgba(255, 140, 0, 0.3) 30%, rgba(255, 69, 0, 0.4) 70%, rgba(139, 69, 19, 0.3) 100%)'
    : 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 30%, #ff9ff3 70%, #667eea 100%)'

  const cardBg = isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.2)'
  const textColor = isDark ? 'rgba(255, 255, 255, 0.95)' : 'white'
  const secondaryTextColor = isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.9)'

  return (
    <Box
      sx={{
        background: gradientBg,
        minHeight: '100vh',
        pb: 4,
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      {/* Enhanced Animated Background */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: 'none',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: '10%',
            left: '5%',
            width: '150px',
            height: '150px',
            background: isDark
              ? 'radial-gradient(circle, rgba(255, 140, 0, 0.15) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, transparent 70%)',
            borderRadius: '50%',
            animation: 'float 10s ease-in-out infinite'
          },
          '&::after': {
            content: '""',
            position: 'absolute',
            top: '50%',
            right: '10%',
            width: '100px',
            height: '100px',
            background: isDark
              ? 'radial-gradient(circle, rgba(255, 69, 0, 0.12) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(255, 255, 255, 0.12) 0%, transparent 70%)',
            borderRadius: '50%',
            animation: 'float 15s ease-in-out infinite reverse'
          },
          '@keyframes float': {
            '0%, 100%': { transform: 'translateY(0px) rotate(0deg) scale(1)' },
            '33%': { transform: 'translateY(-20px) rotate(120deg) scale(1.1)' },
            '66%': { transform: 'translateY(-40px) rotate(240deg) scale(0.9)' }
          }
        }}
      />

      {/* Container with proper padding */}
      <Container maxWidth='xl' sx={{ px: { xs: 2, sm: 3, md: 6 } }}>
        {/* Enhanced Hero Section */}
        <Box sx={{ pt: 6, pb: 8, position: 'relative', zIndex: 1 }}>
          <Grid container spacing={6} alignItems='center'>
            <Grid item xs={12} lg={7}>
              <Stack spacing={4}>
                {/* Top badges */}
                <Stack direction='row' spacing={2} flexWrap='wrap'>
                  <Chip
                    label='🔥 FLASH SALE ACTIVE'
                    sx={{
                      background: isDark ? 'rgba(255, 140, 0, 0.25)' : 'rgba(255, 255, 255, 0.25)',
                      color: textColor,
                      fontWeight: 'bold',
                      backdropFilter: 'blur(15px)',
                      border: `2px solid ${isDark ? 'rgba(255, 140, 0, 0.4)' : 'rgba(255, 255, 255, 0.4)'}`,
                      fontSize: '1rem',
                      px: 3,
                      py: 1.5,
                      height: 'auto',
                      animation: 'pulse 2s infinite'
                    }}
                  />
                  <Chip
                    label='⚡ LIMITED STOCK'
                    sx={{
                      background: isDark ? 'rgba(255, 69, 0, 0.25)' : 'rgba(255, 69, 0, 0.25)',
                      color: 'white',
                      fontWeight: 'bold',
                      backdropFilter: 'blur(15px)',
                      border: '2px solid rgba(255, 69, 0, 0.4)',
                      fontSize: '1rem',
                      px: 3,
                      py: 1.5,
                      height: 'auto'
                    }}
                  />
                </Stack>

                {/* Main title */}
                <Box>
                  <Typography
                    variant='h1'
                    sx={{
                      color: textColor,
                      fontWeight: 900,
                      mb: 1,
                      textShadow: '4px 4px 8px rgba(0,0,0,0.5)',
                      fontSize: { xs: '4rem', md: '5.5rem', lg: '7rem' },
                      lineHeight: 0.85,
                      letterSpacing: '-0.03em'
                    }}
                  >
                    CLEARANCE
                  </Typography>

                  <Typography
                    variant='h2'
                    sx={{
                      background: isDark
                        ? 'linear-gradient(45deg, #ffeb3b, #ff9800, #ff5722)'
                        : 'linear-gradient(45deg, #ffeb3b, #ff9800, #ff5722)',
                      backgroundClip: 'text',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      fontWeight: 800,
                      mb: 3,
                      fontSize: { xs: '2.8rem', md: '4rem' },
                      textShadow: '3px 3px 6px rgba(0,0,0,0.3)',
                      animation: 'shimmer 3s ease-in-out infinite',
                      '@keyframes shimmer': {
                        '0%, 100%': { filter: 'hue-rotate(0deg)' },
                        '50%': { filter: 'hue-rotate(45deg)' }
                      }
                    }}
                  >
                    MEGA SALE
                  </Typography>
                </Box>

                {/* Description */}
                <Typography
                  variant='h5'
                  sx={{
                    color: secondaryTextColor,
                    fontWeight: 400,
                    maxWidth: '650px',
                    fontSize: { xs: '1.4rem', md: '1.7rem' },
                    lineHeight: 1.4
                  }}
                >
                  Discover exceptional discounts{' '}
                  <Box
                    component='span'
                    sx={{
                      color: '#ffeb3b',
                      fontWeight: 'bold',
                      textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                    }}
                  >
                    up to 80% OFF
                  </Box>{' '}
                  on a premium selection of recognized brand products
                </Typography>

                {/* Call to action */}
                <Box>
                  <Button
                    variant='contained'
                    size='large'
                    sx={{
                      background: 'linear-gradient(45deg, #ff4757, #ff3742)',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '1.2rem',
                      px: 5,
                      py: 2,
                      borderRadius: '30px',
                      boxShadow: '0 8px 20px rgba(255, 71, 87, 0.4)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #ff3742, #ff1744)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 12px 25px rgba(255, 71, 87, 0.5)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    🛍️ SHOP NOW
                  </Button>
                </Box>
              </Stack>
            </Grid>

            <Grid item xs={12} lg={5}>
              {/* Enhanced Clearance Card */}
              <Card
                elevation={0}
                sx={{
                  background: `linear-gradient(145deg, ${cardBg}, rgba(255, 255, 255, 0.1))`,
                  backdropFilter: 'blur(30px)',
                  border: `3px solid ${isDark ? 'rgba(255, 140, 0, 0.4)' : 'rgba(255, 255, 255, 0.4)'}`,
                  borderRadius: 8,
                  overflow: 'hidden',
                  position: 'relative',
                  boxShadow: isDark
                    ? '0 25px 50px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)'
                    : '0 25px 50px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.3)',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '6px',
                    background: 'linear-gradient(90deg, #ff4757, #ff9ff3, #667eea, #ff8c00)',
                    backgroundSize: '200% 100%',
                    animation: 'gradientShift 3s ease-in-out infinite',
                    '@keyframes gradientShift': {
                      '0%, 100%': { backgroundPosition: '0% 50%' },
                      '50%': { backgroundPosition: '100% 50%' }
                    }
                  }
                }}
              >
                <CardContent sx={{ p: 5, textAlign: 'center', position: 'relative' }}>
                  {/* Decorative elements */}
                  <Box
                    sx={{
                      position: 'absolute',
                      top: 20,
                      right: 20,
                      width: 60,
                      height: 60,
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Typography variant='h4'>🔥</Typography>
                  </Box>

                  <Typography
                    variant='h2'
                    sx={{ fontSize: '5rem', mb: 2, filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' }}
                  >
                    ⏰
                  </Typography>

                  <Typography
                    variant='h4'
                    sx={{
                      color: textColor,
                      mb: 4,
                      fontWeight: 800,
                      textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                    }}
                  >
                    Flash Sale Ends In:
                  </Typography>

                  {/* Enhanced countdown with better styling */}
                  <Stack direction='row' spacing={2} justifyContent='center' sx={{ mb: 4 }}>
                    {[
                      { value: timeLeft.hours.toString().padStart(2, '0'), label: 'HOURS' },
                      { value: timeLeft.minutes.toString().padStart(2, '0'), label: 'MINS' },
                      { value: timeLeft.seconds.toString().padStart(2, '0'), label: 'SECS' }
                    ].map((time, index) => (
                      <Box key={index} sx={{ textAlign: 'center' }}>
                        <Box
                          sx={{
                            background: isDark
                              ? 'linear-gradient(145deg, #ff4500, #ff6347)'
                              : 'linear-gradient(145deg, #ff4757, #ff3742)',
                            borderRadius: 3,
                            p: 2.5,
                            minWidth: '80px',
                            minHeight: '80px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 8px 20px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            position: 'relative',
                            overflow: 'hidden',
                            '&::before': {
                              content: '""',
                              position: 'absolute',
                              top: 0,
                              left: '-100%',
                              width: '100%',
                              height: '100%',
                              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                              animation: 'shine 2s infinite',
                              '@keyframes shine': {
                                '0%': { left: '-100%' },
                                '100%': { left: '100%' }
                              }
                            }
                          }}
                        >
                          <Typography
                            variant='h3'
                            sx={{
                              color: 'white',
                              fontWeight: 'bold',
                              fontFamily: 'monospace',
                              fontSize: '2.2rem',
                              textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
                            }}
                          >
                            {time.value}
                          </Typography>
                        </Box>
                        <Typography
                          variant='caption'
                          sx={{
                            color: secondaryTextColor,
                            fontWeight: 'bold',
                            display: 'block',
                            mt: 1,
                            fontSize: '0.8rem',
                            letterSpacing: '1px'
                          }}
                        >
                          {time.label}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>

                  <Divider
                    sx={{
                      my: 3,
                      borderColor: 'rgba(255,255,255,0.2)',
                      '&::before, &::after': {
                        borderColor: 'rgba(255,255,255,0.2)'
                      }
                    }}
                  />

                  <Typography
                    variant='body1'
                    sx={{
                      color: secondaryTextColor,
                      fontStyle: 'italic',
                      fontSize: '1.1rem',
                      textShadow: '1px 1px 2px rgba(0,0,0,0.3)'
                    }}
                  >
                    ⚡ Hurry up! Best deals go first
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* Products Section with proper padding */}
        <Paper
          elevation={0}
          sx={{
            background: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(255, 255, 255, 0.97)',
            backdropFilter: 'blur(25px)',
            borderRadius: '32px',
            p: { xs: 3, md: 5 },
            minHeight: '60vh',
            border: `2px solid ${isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.3)'}`,
            position: 'relative',
            zIndex: 1,
            boxShadow: isDark ? '0 20px 60px rgba(0,0,0,0.3)' : '0 20px 60px rgba(0,0,0,0.1)'
          }}
        >
          {/* Section Header */}
          <Box sx={{ mb: 5, textAlign: 'center' }}>
            <Typography
              variant='h2'
              sx={{
                fontWeight: 800,
                background: isDark
                  ? 'linear-gradient(45deg, #ff8c00, #ff4500)'
                  : 'linear-gradient(45deg, #ff6b6b, #ee5a24)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 3,
                fontSize: { xs: '2.5rem', md: '3rem' }
              }}
            >
              🏷️ Premium Clearance Collection
            </Typography>
            <Typography
              variant='h6'
              sx={{
                color: isDark ? 'rgba(255, 255, 255, 0.8)' : 'text.secondary',
                maxWidth: '700px',
                mx: 'auto',
                fontSize: '1.2rem',
                lineHeight: 1.6
              }}
            >
              Discover our exclusive selection of prestigious brand products at exceptional prices. Limited quantities,
              don&apos;t miss this unique opportunity!
            </Typography>
          </Box>

          {/* Using your original ProductGrid component */}
          <Box sx={{ px: { xs: 1, sm: 2 } }}>
            <Suspense
              fallback={
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '50vh'
                  }}
                >
                  <CircularProgress
                    size={80}
                    sx={{
                      color: isDark ? '#ff8c00' : '#ff6b6b'
                    }}
                  />
                </Box>
              }
            >
              <ClearanceProductGrid onAddToCart={handleAddToCart} />
            </Suspense>
          </Box>
        </Paper>
      </Container>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{
            width: '100%',
            borderRadius: '12px',
            '&.MuiAlert-standardSuccess': {
              background: isDark ? 'rgba(102, 126, 234, 0.95)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              backdropFilter: 'blur(15px)'
            },
            '&.MuiAlert-standardWarning': {
              background: isDark ? 'rgba(255, 140, 0, 0.95)' : 'linear-gradient(135deg, #ff8c00 0%, #ff4500 100%)',
              color: 'white',
              backdropFilter: 'blur(15px)'
            }
          }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

const ClearanceProductsPage = () => (
  <ProductProvider>
    <SavedProvider>
      <OrderProvider>
        <CartProvider>
          <ClearanceProductsContent />
        </CartProvider>
      </OrderProvider>
    </SavedProvider>
  </ProductProvider>
)

export default ClearanceProductsPage
