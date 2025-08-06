'use client'

import { useEffect, useState } from 'react'

import { useRouter, useParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import Link from 'next/link'

import {
  Box,
  Typography,
  Container,
  Breadcrumbs,
  Link as MuiLink,
  Button,
  CircularProgress,
  Alert,
  Snackbar,
  TextField,
  InputAdornment,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider
} from '@mui/material'
import { ArrowLeft, Search, X, Filter } from 'lucide-react'

import AnimatedPagination from '@/components/ui/pagination/AnimatedPagination'

import { ProductProvider } from '@/components/contexts/ProductContext'
import { SavedProvider } from '@/components/contexts/SavedContext'
import { NegotiationProvider } from '@/components/contexts/NegotiationContext'
import { CartProvider, useCart } from '@/components/contexts/CartContext'
import { OrderProvider } from '@/components/contexts/OrderContext'
import { ServiceOrderProvider } from '@/components/contexts/ServiceOrderContext'
import { useImageSearchResults } from '@/components/contexts/ImageSearchResultsContext'

const ProductCard = dynamic(() => import('@/views/apps/explore/products/ProductCard'), {
  loading: () => <CircularProgress />,
  ssr: false
})

const ImageSearchResultsContent = () => {
  const router = useRouter()
  const { lang: locale } = useParams()
  const { results } = useImageSearchResults()
  const { addToCart, isAuthenticated } = useCart()
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })

  const {
    searchTerm,
    setSearchTerm,
    sortBy,
    setSortBy,
    priceRange,
    setPriceRange,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    totalPages,
    filteredProducts,
    paginatedProducts,
    isRestoring
  } = useImageSearchResults()

  const [showFilters, setShowFilters] = useState(false)
  const [localPriceRange, setLocalPriceRange] = useState(priceRange)
  const [initialLoading, setInitialLoading] = useState(true)

  useEffect(() => {
    // On considère qu'on a fini de charger dès que results a changé (même si vide)
    setInitialLoading(false)
  }, [results])

  useEffect(() => {
    // On ne redirige que si on a fini de charger ET qu'il n'y a pas de résultats
    if (!initialLoading && (!results || results.length === 0)) {
      router.replace(`/${locale}/apps/explore/products-and-stores`)
    }
  }, [results, initialLoading, router, locale])

  const handleBack = () => {
    router.back()
  }

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

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false })
  }

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

  const toggleFilters = () => {
    setShowFilters(!showFilters)
  }

  const handlePageChange = (event, newPage) => {
    setCurrentPage(newPage)
    window.scrollTo({ top: document.getElementById('products-grid-top').offsetTop - 100, behavior: 'smooth' })
  }

  const handleItemsPerPageChange = event => {
    setItemsPerPage(Number(event.target.value))
    setCurrentPage(1)
  }

  if (isRestoring) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (initialLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (!results || results.length === 0) {
    return <Alert severity='info'>No similar products found.</Alert>
  }

  return (
    <Container maxWidth='xl'>
      <Box sx={{ mb: 4 }}>
        <Breadcrumbs aria-label='breadcrumb'>
          <MuiLink component={Link} href={`/${locale}/dashboard`} underline='hover' color='inherit'>
            Dashboard
          </MuiLink>
          <MuiLink component={Link} href={`/${locale}/apps/explore`} underline='hover' color='inherit'>
            Explore
          </MuiLink>
          <MuiLink
            component={Link}
            href={`/${locale}/apps/explore/products-and-stores`}
            underline='hover'
            color='inherit'
          >
            Products & Stores
          </MuiLink>
          <Typography color='text.primary'>Image Search Results</Typography>
        </Breadcrumbs>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, gap: 2 }}>
        {/* <Button variant='outlined' startIcon={<ArrowLeft />} onClick={handleBack}>
          Back
        </Button> */}
        <Typography variant='h4' gutterBottom>
          Similar Products
        </Typography>
      </Box>
      <Box
        id='products-grid-top'
        sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}
      >
        <Typography variant='h5'>Products ({filteredProducts.length})</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            placeholder='Search products...'
            value={searchTerm}
            onChange={handleSearchChange}
            size='small'
            sx={{ width: 250 }}
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
          <Button
            variant={showFilters ? 'contained' : 'outlined'}
            startIcon={<Filter size={16} />}
            onClick={toggleFilters}
            aria-label='Toggle filters'
          >
            Filters
          </Button>
          <FormControl size='small' sx={{ minWidth: 150 }}>
            <InputLabel>Sort By</InputLabel>
            <Select value={sortBy} onChange={handleSortChange} label='Sort By'>
              <MenuItem value='popularity'>Popularity</MenuItem>
              <MenuItem value='price-low-high'>Price: Low to High</MenuItem>
              <MenuItem value='price-high-low'>Price: High to Low</MenuItem>
              <MenuItem value='rating'>Highest Rating</MenuItem>
              <MenuItem value='newest'>Newest</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>
      {showFilters && (
        <Box sx={{ mb: 4, p: 2, bgcolor: 'background.paper', borderRadius: 1, boxShadow: 1 }}>
          <Typography variant='subtitle1' gutterBottom>
            Price Range
          </Typography>
          <Box sx={{ px: 2 }}>
            <Slider
              value={localPriceRange}
              onChange={handlePriceChange}
              onChangeCommitted={handlePriceChangeCommitted}
              valueLabelDisplay='auto'
              min={0}
              max={200000}
              step={1000}
              marks={[
                { value: 0, label: '0 DA' },
                { value: 50000, label: '50K DA' },
                { value: 100000, label: '100K DA' },
                { value: 200000, label: '200K+ DA' }
              ]}
              valueLabelFormat={value => `${value} DA`}
            />
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <Typography variant='body2'>{localPriceRange[0]} DA</Typography>
            <Typography variant='body2'>{localPriceRange[1]} DA</Typography>
          </Box>
        </Box>
      )}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' },
          gap: 3
        }}
      >
        {paginatedProducts.map((product, idx) => (
          <ProductCard
            key={product.id ? `${product.id}-${idx}` : idx}
            product={product}
            onAddToCart={handleAddToCart}
          />
        ))}
      </Box>
      {filteredProducts.length > 0 && (
        <AnimatedPagination
          currentPage={currentPage}
          totalPages={totalPages || 1}
          itemsPerPage={itemsPerPage}
          totalItems={filteredProducts.length}
          onPageChange={handlePageChange}
          onItemsPerPageChange={handleItemsPerPageChange}
          loading={initialLoading}
          color='primary'
          size='medium'
          showItemsPerPage={true}
          showSummary={true}
          maxVisiblePages={5}
        />
      )}
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

export default function Page() {
  return <ImageSearchResultsContent />
}
