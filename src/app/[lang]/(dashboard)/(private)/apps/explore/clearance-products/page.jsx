'use client'

import { useState, Suspense } from 'react'

import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useParams } from 'next/navigation'

import {
  Box,
  Typography,
  Container,
  Breadcrumbs,
  Link as MuiLink,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material'

import { getLocalizedUrl } from '@/utils/i18n'
import { ProductProvider } from '@/components/contexts/ProductContext'
import { CartProvider, useCart } from '@/components/contexts/CartContext'
import { SavedProvider } from '@/components/contexts/SavedContext'
import { OrderProvider } from '@/components/contexts/OrderContext'

const ClearanceProductGrid = dynamic(() => import('@/views/apps/explore/products/ClearanceProductGrid'), {
  loading: () => (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
      <CircularProgress />
    </Box>
  ),
  ssr: false
})

const ClearanceProductsContent = () => {
  const { lang: locale } = useParams()
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  const { addToCart, isAuthenticated } = useCart()

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

  return (
    <Container maxWidth='xl'>
      <Box sx={{ mb: 4 }}>
        <Breadcrumbs aria-label='breadcrumb'>
          <MuiLink component={Link} href={getLocalizedUrl('/dashboard', locale)} underline='hover' color='inherit'>
            Dashboard
          </MuiLink>
          <Typography color='text.primary'>Clearance Products</Typography>
        </Breadcrumbs>
      </Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant='h4' gutterBottom>
          Clearance Products
        </Typography>
        <Typography variant='body1' color='text.secondary'>
          Discover exclusive deals on clearance items from various stores.
        </Typography>
      </Box>
      <Suspense
        fallback={
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
            <CircularProgress />
          </Box>
        }
      >
        <ClearanceProductGrid onAddToCart={handleAddToCart} />
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
