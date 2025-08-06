'use client'

import { useState, Suspense } from 'react'

import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useParams } from 'next/navigation'

import {
  Box,
  Typography,
  Tabs,
  Tab,
  Container,
  Breadcrumbs,
  Link as MuiLink,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material'
import { Store, Package, AlertTriangle } from 'lucide-react'

import { getLocalizedUrl } from '@/utils/i18n'

import { StoreProvider, useStore } from '@/components/contexts/StoreContext'
import { ProductProvider, useProduct } from '@/components/contexts/ProductContext'
import { CartProvider, useCart } from '@/components/contexts/CartContext'
import { SavedProvider } from '@/components/contexts/SavedContext'
import { NegotiationProvider } from '@/components/contexts/NegotiationContext'
import { OrderProvider } from '@/components/contexts/OrderContext'
import { ServiceOrderProvider } from '@/components/contexts/ServiceOrderContext'
import StoreTypeFilter from '@/views/apps/explore/products/StoreTypeFilter'

// Chargement dynamique des composants lourds
const ProductGrid = dynamic(() => import('@/views/apps/explore/products/ProductGrid'), {
  loading: () => (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
      <CircularProgress />
    </Box>
  ),
  ssr: false
})

const StoreGrid = dynamic(() => import('@/views/apps/explore/stores/StoreGrid'), {
  loading: () => (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
      <CircularProgress />
    </Box>
  ),
  ssr: false
})

// Composant pour le contenu des onglets
const TabContent = ({ activeTab, onAddToCart, onViewStoreProducts }) => {
  const { error: productError, loading: productsLoading } = useProduct()
  const { error: storeError, loading: storesLoading } = useStore()

  // Show error if present
  if ((activeTab === 'products' && productError) || (activeTab === 'stores' && storeError)) {
    const error = activeTab === 'products' ? productError : storeError

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
        <AlertTriangle size={60} color='#f44336' style={{ marginBottom: 16 }} />
        <Typography variant='h6' color='error' gutterBottom>
          {error}
        </Typography>
        <Typography variant='body2' color='text.secondary'>
          Please try refreshing the page or come back later.
        </Typography>
      </Box>
    )
  }

  // Show loading state
  if ((activeTab === 'products' && productsLoading) || (activeTab === 'stores' && storesLoading)) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (activeTab === 'products') {
    return <ProductGrid onAddToCart={onAddToCart} />
  }

  if (activeTab === 'stores') {
    return <StoreGrid onViewStoreProducts={onViewStoreProducts} />
  }

  return null
}

const ProductsAndStoresContent = () => {
  const { lang: locale } = useParams()
  const [activeTab, setActiveTab] = useState('products')
  const [selectedStoreId, setSelectedStoreId] = useState(null)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  const { addToCart, isAuthenticated } = useCart()

  const dashboardHref = `/${locale}/dashboard`

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue)
    setSelectedStoreId(null)
  }

  const handleViewStoreProducts = storeId => {
    setSelectedStoreId(String(storeId))
    setActiveTab('products')
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

  return (
    <Container maxWidth='xl'>
      <Box sx={{ mb: 4 }}>
        <Breadcrumbs aria-label='breadcrumb'>
          <MuiLink component={Link} href={getLocalizedUrl('/dashboard', locale)} underline='hover' color='inherit'>
            Dashboard
          </MuiLink>
          <MuiLink
            component={Link}
            href={getLocalizedUrl('/apps/explore/products-and-stores', locale)}
            underline='hover'
            color='inherit'
          >
            Products & Stores
          </MuiLink>
          <Typography color='text.primary'>Products & Stores</Typography>
        </Breadcrumbs>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Typography variant='h4' gutterBottom>
          Explore Products & Stores
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          Discover products from various store types or browse stores directly
        </Typography>
      </Box>

      <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 4 }}>
        <Tab value='products' label='Products' icon={<Package size={20} />} iconPosition='start' />
        <Tab value='stores' label='Stores' icon={<Store size={20} />} iconPosition='start' />
      </Tabs>

      <Suspense
        fallback={
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
            <CircularProgress />
          </Box>
        }
      >
        <TabContent activeTab={activeTab} onAddToCart={handleAddToCart} onViewStoreProducts={handleViewStoreProducts} />
      </Suspense>

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

const ProductsAndStoresPage = () => {
  return (
    <StoreProvider>
      <ProductProvider>
        <SavedProvider>
          <NegotiationProvider>
            <OrderProvider>
              <ServiceOrderProvider>
                <ProductsAndStoresContent />
              </ServiceOrderProvider>
            </OrderProvider>
          </NegotiationProvider>
        </SavedProvider>
      </ProductProvider>
    </StoreProvider>
  )
}

export default ProductsAndStoresPage
