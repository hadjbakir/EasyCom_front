'use client'

import { useState, useEffect } from 'react'

import { useRouter, useParams } from 'next/navigation'

import {
  ShoppingCart,
  RemoveRedEye,
  Check,
  Facebook,
  Twitter,
  LinkedIn,
  WhatsApp,
  Bookmark,
  BookmarkBorder,
  ChatBubbleOutline,
  ShoppingBag
} from '@mui/icons-material'
import {
  Card,
  Box,
  Typography,
  Button,
  Divider,
  Chip,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress,
  Breadcrumbs,
  Link
} from '@mui/material'

import apiClient from '@/libs/api'
import ProductImage from './ProductImage'
import ProductQuantity from './ProductQuantity'
import ProductDescription from './ProductDescription'
import OrderDialog from './OrderDialog'
import { OrderProvider } from '@/components/contexts/OrderContext'
import { useCart, CartProvider } from '@/components/contexts/CartContext'
import { getLocalizedUrl } from '@/utils/i18n'

const ProductDetailsContent = ({ product: initialProduct }) => {
  const { addToCart } = useCart()
  const { id } = useParams()
  const router = useRouter()

  const [product, setProduct] = useState(initialProduct)
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' })
  const [orderDialogOpen, setOrderDialogOpen] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [selectedOptions, setSelectedOptions] = useState({})
  const [loading, setLoading] = useState(true)
  const [isSaved, setIsSaved] = useState(product?.isSaved || false)
  const [isSaving, setIsSaving] = useState(false)

  const [reviewStats, setReviewStats] = useState({
    averageRating: 0,
    reviewCount: 0
  })

  // Convertir les prix en nombres pour éviter les erreurs avec toFixed
  const productPrice = parseFloat(product?.price) || 0

  // Récupérer les données du produit et du fournisseur
  useEffect(() => {
    const fetchProductData = async () => {
      setLoading(true)

      try {
        // Si initialProduct est incomplet, récupérer les données du produit
        let productData = initialProduct

        if (!productData || !productData.id) {
          const productResponse = await apiClient.get(`/products/${id}`)

          productData = productResponse.data.data
          console.log('Product data fetched:', productResponse.data.data)
          setProduct(productData)
        }

        // Récupérer les données du fournisseur si absentes
        if (!productData.supplier) {
          const supplierResponse = await apiClient.get(`/products/${id}/supplier`)

          setProduct(prev => ({
            ...prev,
            supplier: supplierResponse.data.data
          }))
          console.log('Supplier data fetched:', supplierResponse.data.data)
        }

        // Fetch review statistics
        const reviewsResponse = await apiClient.get(`/products/${id}/reviews`)
        const { average_rating, review_count } = reviewsResponse.data.data

        setReviewStats({
          averageRating: average_rating || 0,
          reviewCount: review_count || 0
        })
      } catch (err) {
        console.error('Error fetching product or supplier:', err.response?.data || err.message)
        setSnackbar({
          open: true,
          message: 'Failed to load product details',
          severity: 'error'
        })
      } finally {
        setLoading(false)
      }
    }

    fetchProductData()
  }, [id, initialProduct])

  // Log pour déboguer les images
  console.log('ProductDetails product.images:', product?.images)
  console.log('ProductDetails product.pictures:', product?.pictures)
  console.log('ProductDetails product.supplier:', product?.supplier)

  // Utiliser pictures si images est undefined ou vide
  const productImages = product?.pictures?.length > 0 ? product.pictures : product?.images || []

  // Correction : calculer le lien dashboard dynamiquement
  const { lang: locale } = useParams()
  const dashboardHref = `/${locale}/dashboard`

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (!product) {
    return (
      <Box sx={{ textAlign: 'center', py: 6 }}>
        <Typography variant='h6'>Product not found</Typography>
        <Typography variant='body2' color='text.secondary'>
          The product you are looking for does not exist.
        </Typography>
      </Box>
    )
  }

  const handleSaveToggle = async () => {
    if (isSaving) return

    setIsSaving(true)

    try {
      if (isSaved) {
        // Unsave
        await apiClient.post('/saved-products/unsave', {
          product_id: product.id
        })
        setSnackbar({
          open: true,
          message: 'Product removed from saved items',
          severity: 'info'
        })
      } else {
        // Save
        await apiClient.post('/saved-products/save', {
          product_id: product.id
        })
        setSnackbar({
          open: true,
          message: 'Product saved successfully',
          severity: 'success'
        })
      }

      setIsSaved(!isSaved)
    } catch (error) {
      console.error('Failed to save/unsave product:', error)
      setSnackbar({
        open: true,
        message: 'Failed to save/unsave product',
        severity: 'error'
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false })
  }

  const handleOpenOrder = () => {
    // Instead of opening a dialog, redirect to checkout with product info
    const buyNowProduct = {
      id: product.id,
      name: product.name,
      price: productPrice,
      quantity: quantity,
      image: productImages?.[0]?.picture || '',
      supplier_id: product.supplier_id,
      supplier_name: product.supplier?.name || 'Unknown Supplier'
    }

    // Store the buy now product in sessionStorage
    sessionStorage.setItem('buyNowProduct', JSON.stringify(buyNowProduct))

    // Redirect to checkout page
    router.push('/checkout?buyNow=true')
  }

  const handleCloseOrder = () => {
    setOrderDialogOpen(false)
  }

  const handleAddToCart = async () => {
    try {
      console.log(`Adding product ${product.id} to cart with quantity: ${quantity}`)
      await addToCart(product, quantity)
      setSnackbar({
        open: true,
        message: 'Product added to cart successfully',
        severity: 'success'
      })
    } catch (err) {
      console.error('Error adding to cart:', err)
      setSnackbar({
        open: true,
        message: err.message || 'Failed to add to cart',
        severity: 'error'
      })
    }
  }

  const handleQuantityChange = newQuantity => {
    console.log(`Quantity changed to: ${newQuantity}`)
    setQuantity(newQuantity)
  }

  const handleOptionChange = (optionType, value) => {
    setSelectedOptions(prev => ({
      ...prev,
      [optionType]: value
    }))
  }

  return (
    <>
      <Box sx={{ mb: 4 }}>
        <Breadcrumbs aria-label='breadcrumb'>
          <Link component={Link} href={getLocalizedUrl('/dashboard', locale)} underline='hover' color='inherit'>
            Dashboard
          </Link>
          <Link href={`/${locale}/explore/products`} color='inherit' underline='hover'>
            Products
          </Link>
          <Typography color='text.primary'>{product.name}</Typography>
        </Breadcrumbs>
      </Box>
      <Card sx={{ mb: 4, borderRadius: 2 }}>
        <Box sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 4 }}>
            <Box sx={{ width: { xs: '100%', lg: '50%' } }}>
              <ProductImage images={productImages} />
            </Box>
            <Box sx={{ width: { xs: '100%', lg: '70%' }, mt: { xs: 3, lg: 0 } }}>
              <Typography variant='h6' sx={{ mb: 2 }}>
                {product.name}
              </Typography>
              <Box
                sx={{ display: 'flex', alignItems: 'center', mb: 2, pb: 2, borderBottom: 1, borderColor: 'divider' }}
              >
                {[...Array(5)].map((_, i) => (
                  <Typography
                    key={i}
                    color={i < Math.round(reviewStats.averageRating) ? 'warning.main' : 'text.disabled'}
                  >
                    ★
                  </Typography>
                ))}
                <Typography variant='body2' sx={{ ml: 1 }}>
                  ({reviewStats.reviewCount} Reviews)
                </Typography>
              </Box>
              <Box sx={{ mb: 3 }}>
                <Typography variant='h5'>{productPrice.toFixed(2)} DA</Typography>
              </Box>
              <Box sx={{ mb: 3 }}>
                <Typography variant='subtitle2' sx={{ mb: 1 }}>
                  Quantity
                </Typography>
                <ProductQuantity value={quantity} onChange={handleQuantityChange} max={product.quantity} />
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
                <Button
                  variant='contained'
                  startIcon={<ShoppingCart />}
                  onClick={handleAddToCart}
                  disabled={product.quantity === 0}
                >
                  Add To Cart
                </Button>
                <Button
                  variant='outlined'
                  startIcon={<ShoppingBag />}
                  onClick={handleOpenOrder}
                  disabled={product.quantity === 0}
                >
                  Buy Now
                </Button>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
                <Button
                  startIcon={isSaved ? <Bookmark /> : <BookmarkBorder />}
                  onClick={handleSaveToggle}
                  color={isSaved ? 'primary' : 'inherit'}
                  sx={{ justifyContent: 'flex-start' }}
                >
                  {isSaved ? 'Saved to your collection' : 'Save for later'}
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
      </Card>
      <Card sx={{ mb: 4, borderRadius: 2 }}>
        <Box sx={{ p: 4 }}>
          <Typography variant='h6' sx={{ mb: 2 }}>
            Product Description
          </Typography>
          <ProductDescription product={product} />
        </Box>
      </Card>
      <OrderDialog open={orderDialogOpen} onClose={handleCloseOrder} product={product} />
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
    </>
  )
}

const ProductDetails = ({ product }) => {
  return (
    <OrderProvider>
      <ProductDetailsContent product={product} />
    </OrderProvider>
  )
}

export default ProductDetails
