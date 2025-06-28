'use client'

import { useState } from 'react'

import { useRouter } from 'next/navigation'
import Link from 'next/link'

import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Divider,
  IconButton,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Alert,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material'
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Trash, AlertTriangle, LogIn } from 'lucide-react'

import { useCart } from '@/components/contexts/CartContext'

const CartPageContent = () => {
  const router = useRouter()

  const { cartItems, removeFromCart, updateQuantity, getSubtotal, clearCart, error, isLoading, isAuthenticated } =
    useCart()

  const [couponCode, setCouponCode] = useState('')
  const [clearingCart, setClearingCart] = useState(false)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)

  const STORAGE_BASE_URL = 'http://localhost:8000/storage'

  const normalizeImageUrl = path => {
    if (!path) return '/images/avatars/1.png'
    if (path.startsWith('/storage') || path.startsWith('http')) return path

    return `${STORAGE_BASE_URL}/${path}`
  }

  // Group items by supplier
  const itemsBySupplier = cartItems.reduce((acc, item) => {
    const supplierId = item.supplier_id || 'unknown'

    if (!acc[supplierId]) {
      acc[supplierId] = {
        items: [],
        name: item.supplier_name || item.product?.supplier?.name || `Supplier #${supplierId}`
      }
    }

    acc[supplierId].items.push(item)

    return acc
  }, {})

  const subtotal = getSubtotal()
  const shipping = cartItems.length > 0 ? 10 : 0
  const total = subtotal + shipping

  const handleQuantityChange = (productId, quantity, increment = true) => {
    const newQuantity = increment ? quantity + 1 : quantity - 1

    updateQuantity(productId, newQuantity)
  }

  const handleRemoveItem = productId => {
    // Log detailed information about the product being removed
    const itemToRemove = cartItems.find(item => item.product_id === productId)

    console.log('Removing item:', {
      productId,
      itemDetails: itemToRemove
        ? {
            id: itemToRemove.id,
            order_id: itemToRemove.order_id,
            product_id: itemToRemove.product_id,
            supplier_id: itemToRemove.supplier_id
          }
        : 'Item not found in cart'
    })

    removeFromCart(productId)
  }

  const handleApplyCoupon = () => {
    alert(`Coupon ${couponCode} applied!`)
  }

  const handleProceedToCheckout = () => {
    console.log('Redirection vers /checkout sans validation préalable')
    router.push('/checkout')
  }

  const handleContinueShopping = () => {
    router.push('/apps/explore/products-and-stores')
  }

  const handleOpenClearCartDialog = () => {
    setConfirmDialogOpen(true)
  }

  const handleCloseClearCartDialog = () => {
    setConfirmDialogOpen(false)
  }

  const handleConfirmClearCart = async () => {
    setClearingCart(true)
    setConfirmDialogOpen(false)

    try {
      await clearCart()
    } catch (error) {
      console.error('Error clearing cart:', error)
    } finally {
      setClearingCart(false)
    }
  }

  const handleLogin = () => {
    router.push('/login')
  }

  console.log('Cart items:', JSON.stringify(cartItems, null, 2))
  console.log('Items by supplier:', JSON.stringify(itemsBySupplier, null, 2))

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  if (!isAuthenticated) {
    return (
      <Box sx={{ maxWidth: 1200, mx: 'auto', px: 2 }}>
        <Typography variant='h4' sx={{ mb: 4 }}>
          Shopping Cart
        </Typography>

        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <LogIn size={60} style={{ opacity: 0.3, marginBottom: 16 }} />
            <Typography variant='h6' gutterBottom>
              Please log in to view your cart
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 4 }}>
              You need to be logged in to add items to your cart and make purchases.
            </Typography>
            <Button variant='contained' onClick={handleLogin} sx={{ mr: 2 }}>
              Log In
            </Button>
            <Button variant='outlined' component={Link} href='/apps/explore/products-and-stores'>
              Browse Products
            </Button>
          </CardContent>
        </Card>
      </Box>
    )
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', px: 2 }}>
      <Typography variant='h4' sx={{ mb: 4 }}>
        Shopping Cart
      </Typography>

      {error && (
        <Alert severity='error' sx={{ mb: 4 }}>
          {error}
        </Alert>
      )}

      {cartItems.length > 0 ? (
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            {Object.entries(itemsBySupplier).map(([supplierId, supplierData]) => (
              <Card key={supplierId} sx={{ mb: 4 }}>
                <CardContent>
                  <Typography variant='h6' sx={{ mb: 2 }}>
                    {supplierData.name}
                  </Typography>
                  <TableContainer component={Paper} elevation={0}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Product</TableCell>
                          <TableCell align='center'>Price</TableCell>
                          <TableCell align='center'>Quantity</TableCell>
                          <TableCell align='right'>Subtotal</TableCell>
                          <TableCell align='right'>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {supplierData.items.map(item => {
                          const price = item.negotiatedPrice || item.price
                          const itemSubtotal = price * item.quantity

                          const imageUrl = item.product?.pictures?.[0]?.picture
                            ? normalizeImageUrl(item.product.pictures[0].picture)
                            : '/images/avatars/1.png'

                          console.log(`Product ${item.product_id} image URL:`, imageUrl)

                          return (
                            <TableRow key={item.id}>
                              <TableCell>
                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                  <Avatar
                                    src={imageUrl}
                                    alt={item.product?.name}
                                    variant='rounded'
                                    sx={{ width: 60, height: 60, mr: 2 }}
                                    onError={e => {
                                      console.error(`Failed to load image for product ${item.product_id}:`, imageUrl)
                                      e.target.src = '/images/avatars/1.png'
                                    }}
                                  />
                                  <Box>
                                    <Typography variant='subtitle2'>
                                      {item.product?.name || 'Unknown Product'}
                                    </Typography>
                                  </Box>
                                </Box>
                              </TableCell>
                              <TableCell align='center'>
                                <Typography variant='body2'>{price.toFixed(2)} DA</Typography>
                                {item.negotiatedPrice && (
                                  <Typography
                                    variant='caption'
                                    sx={{ textDecoration: 'line-through', color: 'text.secondary' }}
                                  >
                                    {item.price.toFixed(2)} DA
                                  </Typography>
                                )}
                              </TableCell>
                              <TableCell align='center'>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <IconButton
                                    size='small'
                                    onClick={() => handleQuantityChange(item.product_id, item.quantity, false)}
                                    disabled={item.quantity <= 1}
                                  >
                                    <Minus size={16} />
                                  </IconButton>
                                  <Typography sx={{ mx: 1 }}>{item.quantity}</Typography>
                                  <IconButton
                                    size='small'
                                    onClick={() => handleQuantityChange(item.product_id, item.quantity, true)}
                                  >
                                    <Plus size={16} />
                                  </IconButton>
                                </Box>
                              </TableCell>
                              <TableCell align='right'>{itemSubtotal.toFixed(2)} DA</TableCell>
                              <TableCell align='right'>
                                <IconButton
                                  color='error'
                                  size='small'
                                  onClick={() => handleRemoveItem(item.product_id)}
                                >
                                  <Trash2 size={18} />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            ))}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button variant='outlined' onClick={handleContinueShopping} startIcon={<ArrowRight />}>
                Continue Shopping
              </Button>
              <Button
                variant='outlined'
                color='error'
                startIcon={<Trash />}
                onClick={handleOpenClearCartDialog}
                disabled={clearingCart}
              >
                {clearingCart ? 'Clearing...' : 'Clear Cart'}
              </Button>
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant='h6' sx={{ mb: 3 }}>
                  Order Summary
                </Typography>

                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant='body2'>Subtotal</Typography>
                    <Typography variant='body2'>{subtotal.toFixed(2)} DA</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant='body2'>Shipping</Typography>
                    <Typography variant='body2'>{shipping.toFixed(2)} DA</Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                  <Typography variant='subtitle1' fontWeight='bold'>
                    Total
                  </Typography>
                  <Typography variant='subtitle1' fontWeight='bold'>
                    {total.toFixed(2)} DA
                  </Typography>
                </Box>

                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <TextField
                      size='small'
                      placeholder='Coupon Code'
                      value={couponCode}
                      onChange={e => setCouponCode(e.target.value)}
                      fullWidth
                    />
                    <Button variant='outlined' onClick={handleApplyCoupon} disabled={!couponCode}>
                      Apply
                    </Button>
                  </Box>
                </Box>

                <Button
                  variant='contained'
                  fullWidth
                  size='large'
                  onClick={handleProceedToCheckout}
                  startIcon={<ShoppingBag />}
                >
                  Proceed to Checkout
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      ) : (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <ShoppingBag size={60} style={{ opacity: 0.3, marginBottom: 16 }} />
            <Typography variant='h6' gutterBottom>
              Your cart is empty
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 4 }}>
              Looks like you havent added any products to your cart yet.
            </Typography>
            <Button variant='contained' onClick={handleContinueShopping}>
              Start Shopping
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Confirmation Dialog for Clear Cart */}
      <Dialog
        open={confirmDialogOpen}
        onClose={handleCloseClearCartDialog}
        aria-labelledby='clear-cart-dialog-title'
        aria-describedby='clear-cart-dialog-description'
      >
        <DialogTitle id='clear-cart-dialog-title' sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AlertTriangle color='orange' size={24} />
          Confirm Clear Cart
        </DialogTitle>
        <DialogContent>
          <DialogContentText id='clear-cart-dialog-description'>
            Are you sure you want to clear your entire cart? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseClearCartDialog} variant='outlined'>
            Cancel
          </Button>
          <Button onClick={handleConfirmClearCart} color='error' variant='contained' autoFocus>
            Clear Cart
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

const CartPage = () => {
  return <CartPageContent />
}

export default CartPage
