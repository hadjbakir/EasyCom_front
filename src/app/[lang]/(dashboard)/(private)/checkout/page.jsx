'use client'

import { useState, useEffect, useRef } from 'react'

import { useRouter, useSearchParams, useParams } from 'next/navigation'
import Link from 'next/link'

import { useSession } from 'next-auth/react'
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Divider,
  TextField,
  Alert,
  CircularProgress,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText
} from '@mui/material'
import { ShoppingBag, Check, LogIn } from 'lucide-react'

import apiClient from '@/libs/api'
import { useCart } from '@/components/contexts/CartContext'
import { useOrder, OrderProvider } from '@/components/contexts/OrderContext'
import { useUser } from '@/contexts/UserContext'
import { getLocalizedUrl } from '@/utils/i18n'

const STORAGE_BASE_URL = 'http://localhost:8000/storage'

// Données temporaires pour les wilayas et communes
// Ces données seront remplacées par les données de l'API
const TEMP_WILAYAS = [
  { id: 1, name: 'Adrar' },
  { id: 2, name: 'Chlef' },
  { id: 3, name: 'Laghouat' },
  { id: 4, name: 'Oum El Bouaghi' },
  { id: 5, name: 'Batna' },
  { id: 6, name: 'Béjaïa' },
  { id: 7, name: 'Biskra' },
  { id: 8, name: 'Béchar' },
  { id: 16, name: 'Alger' },
  { id: 31, name: 'Oran' }
]

// Communes temporaires par wilaya
const TEMP_COMMUNES = {
  1: [
    { id: 101, name: 'Adrar' },
    { id: 102, name: 'Timimoun' }
  ],
  2: [
    { id: 201, name: 'Chlef' },
    { id: 202, name: 'Ténès' }
  ],
  3: [
    { id: 301, name: 'Laghouat' },
    { id: 302, name: 'Aflou' }
  ],
  16: [
    { id: 1601, name: 'Alger-Centre' },
    { id: 1602, name: 'Bab El Oued' },
    { id: 1603, name: 'Bir Mourad Raïs' }
  ],
  31: [
    { id: 3101, name: 'Oran' },
    { id: 3102, name: 'Aïn El Turk' }
  ]
}

const normalizeImageUrl = path => {
  if (!path) return '/images/avatars/1.png'
  if (path.startsWith('http')) return path

  return `${STORAGE_BASE_URL}/${path}`
}

const getInitialDataFromApi = user => {
  console.log('User data passed to getInitialDataFromApi:', JSON.stringify(user, null, 2))

  if (!user) {
    console.warn('No user data provided to getInitialDataFromApi')

    return {
      fullName: '',
      phoneNumber: '',
      address: '',
      wilayaId: 1,
      communeId: 1
    }
  }

  // Handle different property naming conventions
  const fullName = user.full_name || user.fullName || user.name || ''
  const phoneNumber = user.phone_number || user.phoneNumber || ''
  const address = user.address || ''
  const wilayaId = user.wilaya_id || user.wilayaId || 1
  const communeId = user.commune_id || user.communeId || 1

  // Convert to appropriate types
  const formattedData = {
    fullName: String(fullName),
    phoneNumber: String(phoneNumber),
    address: String(address),
    wilayaId: Number(wilayaId),
    communeId: Number(communeId)
  }

  console.log('Formatted form data:', formattedData)

  return formattedData
}

const CheckoutPageContent = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { lang: locale } = useParams()
  const { cartItems, clearCart, getSubtotal, validateCart, error: cartError, isLoading, isAuthenticated } = useCart()
  const { createOrder } = useOrder()
  const { user } = useUser()
  const { data: session, status } = useSession()

  // Check if this is a "Buy Now" checkout
  const isBuyNow = searchParams.get('buyNow') === 'true'
  const [buyNowProduct, setBuyNowProduct] = useState(null)

  // State for wilayas and communes
  const [wilayas, setWilayas] = useState([])
  const [communes, setCommunes] = useState([])
  const [loadingLocations, setLoadingLocations] = useState(false)

  // Initialize form with default values
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    address: '',
    wilayaId: 1,
    communeId: 1
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderComplete, setOrderComplete] = useState(false)
  const [orderId, setOrderId] = useState(null)
  const [formError, setFormError] = useState(null)
  const [loadingUser, setLoadingUser] = useState(true)
  const hasFetched = useRef(false)

  // Fix any potential hydration issues by ensuring consistent state on server and client
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Fetch wilayas from API on component mount
  useEffect(() => {
    const fetchWilayas = async () => {
      try {
        setLoadingLocations(true)
        const response = await apiClient.get('/wilayas')
        
        if (response.data && Array.isArray(response.data)) {
          setWilayas(response.data)
        }
      } catch (error) {
        console.error('Failed to fetch wilayas:', error)
        setErrors(prev => ({ ...prev, location: 'Failed to load wilayas.' }))
      } finally {
        setLoadingLocations(false)
      }
    }

    fetchWilayas()
  }, [])

  // Fetch communes when wilaya changes
  useEffect(() => {
    const fetchCommunes = async () => {
      if (!formData.wilayaId) return

      try {
        setLoadingLocations(true)
        const response = await apiClient.get(`/wilayas/${formData.wilayaId}/communes`)

        if (response.data && Array.isArray(response.data)) {
          setCommunes(response.data)
          // Reset commune if it's not in the new list
          if (response.data.length > 0 && !response.data.find(c => c.id === formData.communeId)) {
            setFormData(prev => ({ ...prev, communeId: response.data[0].id }))
          }
        } else {
          setCommunes([])
        }
      } catch (error) {
        console.error('Failed to fetch communes:', error)
        setErrors(prev => ({ ...prev, location: 'Failed to load communes.' }))
        setCommunes([])
      } finally {
        setLoadingLocations(false)
      }
    }

    fetchCommunes()
  }, [formData.wilayaId])

  // Calculate totals based on cart or buy now product
  const subtotal = isBuyNow && buyNowProduct ? buyNowProduct.price * buyNowProduct.quantity : getSubtotal()
  const shipping = (isBuyNow && buyNowProduct) || cartItems.length > 0 ? 10 : 0
  const total = subtotal + shipping

  useEffect(() => {
    let isMounted = true

    const fetchUserData = async () => {
      if (status === 'authenticated' && session?.user && isMounted && !hasFetched.current) {
        try {
          hasFetched.current = true
          setLoadingUser(true)

          // First try to get user data directly from session
          if (session?.user) {
            const sessionData = getInitialDataFromApi(session.user)

            console.log('Session user data:', JSON.stringify(session.user, null, 2))
            console.log('Initialized formData from session:', JSON.stringify(sessionData, null, 2))

            if (isMounted) {
              setFormData(sessionData)
            }
          }

          // Then try to get more complete data from API
          try {
            console.log('Fetching user data from API...')
            const response = await apiClient.get('/user')

            if (response.data && response.data.user) {
              const userData = response.data.user
              const apiData = getInitialDataFromApi(userData)

              if (isMounted) {
                console.log('API user data:', JSON.stringify(userData, null, 2))
                console.log('Initialized formData from API:', JSON.stringify(apiData, null, 2))
                setFormData(apiData)
              }
            } else {
              console.warn('API returned empty user data')
            }
          } catch (apiError) {
            console.error('Failed to fetch user data from API:', apiError.message)
          }

          // Fallback to user context if available
          if (user && (user.fullName || user.full_name)) {
            const contextData = getInitialDataFromApi(user)

            if (isMounted) {
              console.log('User context data:', JSON.stringify(user, null, 2))
              console.log('Initialized formData from context:', JSON.stringify(contextData, null, 2))
              setFormData(contextData)
            }
          }
        } catch (error) {
          console.error('Error in fetchUserData:', error.message)
        } finally {
          if (isMounted) {
            setLoadingUser(false)
          }
        }
      } else if (status === 'unauthenticated' && isMounted) {
        console.warn('User is unauthenticated')
        setFormError('Please log in to proceed with checkout.')
        setLoadingUser(false)
      } else if (isMounted && status !== 'loading') {
        // If we're not loading and not authenticated, stop loading
        setLoadingUser(false)
      }
    }

    fetchUserData()

    return () => {
      isMounted = false
    }
  }, [user, session, status])

  // Add a safety timeout to prevent infinite loading
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (loadingUser) {
        console.warn('Loading user data timed out, forcing loading state to complete')
        setLoadingUser(false)
      }
    }, 5000) // 5 seconds timeout

    return () => clearTimeout(timeoutId)
  }, [loadingUser])

  useEffect(() => {
    // Handle Buy Now flow
    if (isBuyNow) {
      try {
        const storedProduct = sessionStorage.getItem('buyNowProduct')

        if (storedProduct) {
          const product = JSON.parse(storedProduct)

          setBuyNowProduct(product)
          console.log('Buy Now product loaded:', product)
        } else {
          console.error('No Buy Now product found in sessionStorage')
          router.push('/cart')
        }
      } catch (error) {
        console.error('Error loading Buy Now product:', error)
        router.push('/cart')
      }
    }
  }, [isBuyNow, router])

  const handleChange = e => {
    const { name, value } = e.target

    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.fullName) newErrors.fullName = 'Full name is required'
    if (!formData.phoneNumber) newErrors.phoneNumber = 'Phone number is required'
    if (!formData.address) newErrors.address = 'Address is required'
    if (!formData.wilayaId) newErrors.wilayaId = 'Wilaya is required'
    if (!formData.communeId) newErrors.communeId = 'Commune is required'
    setErrors(newErrors)

    return Object.keys(newErrors).length === 0
  }

  const handlePlaceOrder = async e => {
    e.preventDefault()
    setFormError(null)

    if (!validateForm()) {
      console.log('Form validation failed:', errors)

      return
    }

    if (!isBuyNow && cartItems.length === 0) {
      setFormError('Your cart is empty')

      return
    }

    setIsSubmitting(true)

    try {
      // Ensure wilayaId and communeId are numbers
      const shippingInfo = {
        full_name: formData.fullName,
        phone_number: formData.phoneNumber,
        address: formData.address,
        wilaya_id: parseInt(formData.wilayaId) || 1,
        commune_id: parseInt(formData.communeId) || 1
      }

      console.log('Submitting order with shipping info:', shippingInfo)

      // Handle different checkout flows
      if (isBuyNow && buyNowProduct) {
        console.log('Processing Buy Now order for product:', buyNowProduct)

        // Use the buy-now API endpoint
        const response = await apiClient.post('/orders/buy-now', {
          product_id: buyNowProduct.id,
          quantity: buyNowProduct.quantity,
          ...shippingInfo
        })

        console.log('Buy now response:', response.data)

        // Create order in context
        const orderItems = [
          {
            productId: buyNowProduct.id,
            productTitle: buyNowProduct.name,
            productImage: buyNowProduct.image ? normalizeImageUrl(buyNowProduct.image) : '/images/avatars/1.png',
            quantity: buyNowProduct.quantity,
            unitPrice: buyNowProduct.price,
            subtotal: buyNowProduct.price * buyNowProduct.quantity
          }
        ]

        const orderData = {
          id: response.data.order_id,
          items: orderItems,
          subtotal,
          shippingCost: shipping,
          total,
          customer: {
            fullName: formData.fullName,
            phoneNumber: formData.phoneNumber
          },
          shippingAddress: {
            address: formData.address,
            wilayaId: formData.wilayaId,
            communeId: formData.communeId
          },
          paymentMethod: 'credit_card',
          shippingMethod: 'standard'
        }

        console.log('Creating order with data:', orderData)
        const newOrder = createOrder(orderData)

        setOrderId(response.data.order_id)

        // Clear the Buy Now product from sessionStorage
        sessionStorage.removeItem('buyNowProduct')
      } else {
        // Regular cart checkout flow
        console.log('Validating cart with shippingInfo:', shippingInfo)
        const validatedOrderResponse = await validateCart(shippingInfo)

        if (!validatedOrderResponse) {
          throw new Error('Cart validation failed')
        }

        // Handle multiple orders if needed
        const orderIdsArray = validatedOrderResponse.order_ids || []

        if (orderIdsArray.length === 0) {
          throw new Error('No orders were validated')
        }

        console.log('Orders validated successfully:', orderIdsArray)

        // For compatibility, we'll use the first order ID for the order context
        const primaryOrderId = orderIdsArray[0]

        setOrderId(primaryOrderId)

        const orderItems = cartItems.map(item => ({
          productId: item.product_id,
          productTitle: item.product.name,
          productImage: item.product.pictures?.[0]?.picture
            ? normalizeImageUrl(item.product.pictures[0].picture)
            : '/images/avatars/1.png',
          quantity: item.quantity,
          unitPrice: item.negotiatedPrice || item.price,
          options: item.options || {},
          subtotal: (item.negotiatedPrice || item.price) * item.quantity
        }))

        const orderData = {
          id: primaryOrderId,
          items: orderItems,
          subtotal,
          shippingCost: shipping,
          total,
          customer: {
            fullName: formData.fullName,
            phoneNumber: formData.phoneNumber
          },
          shippingAddress: {
            address: formData.address,
            wilayaId: formData.wilayaId,
            communeId: formData.communeId
          },
          paymentMethod: 'credit_card',
          shippingMethod: 'standard'
        }

        console.log('Creating order with data:', orderData)
        const newOrder = createOrder(orderData)

        setOrderId(newOrder.id)
      }

      setOrderComplete(true)
    } catch (error) {
      console.error('Error during checkout:', error)
      setFormError(error.message || 'Failed to place order')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBackNavigation = () => {
    if (isBuyNow && buyNowProduct) {
      // If we're in Buy Now mode, go back to the product detail page
      const productId = buyNowProduct.id

      router.push(`/apps/explore/products/ProductDetails/${productId}`)
    } else {
      // Otherwise, go back to cart
      router.push('/cart')
    }
  }

  // Add debug output for form data
  useEffect(() => {
    console.log('Current form data:', formData)
  }, [formData])

  const handleLogin = () => {
    router.push('/login')
  }

  // Show loading state
  if (isLoading || loadingUser) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  // Show authentication required message
  if (!isAuthenticated || status === 'unauthenticated') {
    return (
      <Box sx={{ maxWidth: 1200, mx: 'auto', px: 2 }}>
        <Typography variant='h4' sx={{ mb: 4 }}>
          Checkout
        </Typography>

        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <LogIn size={60} style={{ opacity: 0.3, marginBottom: 16 }} />
            <Typography variant='h6' gutterBottom>
              Please log in to proceed with checkout
            </Typography>
            <Typography variant='body2' color='text.secondary' sx={{ mb: 4 }}>
              You need to be logged in to complete your purchase.
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

  if (!isBuyNow && cartItems.length === 0 && !orderComplete) {
    return (
      <Card>
        <CardContent sx={{ textAlign: 'center', py: 6 }}>
          <ShoppingBag size={60} style={{ opacity: 0.3, marginBottom: 16 }} />
          <Typography variant='h6' gutterBottom>
            Your cart is empty
          </Typography>
          <Typography variant='body2' color='text.secondary' sx={{ mb: 4 }}>
            Looks like you havent added any products to your cart yet.
          </Typography>
          <Button variant='contained' onClick={() => router.push('/apps/explore/products-and-stores')}>
            Start Shopping
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (orderComplete) {
    return (
      <Card>
        <CardContent sx={{ textAlign: 'center', py: 6 }}>
          <Check size={60} color='green' style={{ marginBottom: 16 }} />
          <Typography variant='h5' gutterBottom>
            Order Placed Successfully!
          </Typography>
          <Typography variant='body1' paragraph>
            Your order #{orderId} has been placed successfully.
          </Typography>
          <Typography variant='body2' color='text.secondary' paragraph>
            You will receive an email confirmation shortly.
          </Typography>
          <Button variant='contained' onClick={() => router.push(getLocalizedUrl('/apps/explore/products-and-stores', locale))}>
            Continue Shopping
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', px: 2 }}>
      <Typography variant='h4' sx={{ mb: 4 }}>
        {isBuyNow ? 'Buy Now Checkout' : 'Checkout'}
      </Typography>

      <Card>
        <CardContent sx={{ p: 4 }}>
          {(cartError || formError) && (
            <Alert severity='error' sx={{ mb: 4 }}>
              {cartError || formError}
            </Alert>
          )}

          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Typography variant='h6' sx={{ mb: 4 }}>
                Shipping Information
              </Typography>
              <form onSubmit={handlePlaceOrder}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label='Full Name'
                      name='fullName'
                      value={formData.fullName}
                      onChange={handleChange}
                      error={!!errors.fullName}
                      helperText={errors.fullName}
                      disabled={isSubmitting}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label='Phone Number'
                      name='phoneNumber'
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      error={!!errors.phoneNumber}
                      helperText={errors.phoneNumber}
                      disabled={isSubmitting}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label='Address'
                      name='address'
                      value={formData.address}
                      onChange={handleChange}
                      error={!!errors.address}
                      helperText={errors.address}
                      disabled={isSubmitting}
                      multiline
                      rows={3}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth error={!!errors.wilayaId}>
                      <InputLabel id='wilaya-select-label'>Wilaya</InputLabel>
                      <Select
                        labelId='wilaya-select-label'
                        name='wilayaId'
                        value={formData.wilayaId}
                        onChange={handleChange}
                        label='Wilaya'
                        disabled={loadingLocations || loadingUser}
                      >
                        {wilayas.map(wilaya => (
                          <MenuItem key={wilaya.id} value={wilaya.id}>
                            {wilaya.name}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.wilayaId && <FormHelperText>{errors.wilayaId}</FormHelperText>}
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth error={!!errors.communeId}>
                      <InputLabel id='commune-select-label'>Commune</InputLabel>
                      <Select
                        labelId='commune-select-label'
                        name='communeId'
                        value={formData.communeId}
                        onChange={handleChange}
                        label='Commune'
                        disabled={loadingLocations || loadingUser || !formData.wilayaId || communes.length === 0}
                      >
                        {communes.map(commune => (
                          <MenuItem key={commune.id} value={commune.id}>
                            {commune.name}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.communeId && <FormHelperText>{errors.communeId}</FormHelperText>}
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between', mt: 6, mb: 6 }}>
                    <Button variant='outlined' onClick={handleBackNavigation} disabled={isSubmitting}>
                      {isBuyNow ? 'Back to Product' : 'Back to Cart'}
                    </Button>
                    <Button
                      variant='contained'
                      type='submit'
                      disabled={isSubmitting}
                      startIcon={isSubmitting ? <CircularProgress size={20} /> : <ShoppingBag />}
                    >
                      {isSubmitting ? 'Processing...' : 'Place Order'}
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant='h6' sx={{ mb: 4 }}>
                Order Summary
              </Typography>
              <Paper variant='outlined' sx={{ p: 2 }}>
                {isClient && (
                  <List disablePadding>
                    {isBuyNow && buyNowProduct ? (
                      <ListItem sx={{ py: 1, px: 0 }}>
                        <ListItemAvatar>
                          <Avatar
                            src={buyNowProduct.image ? normalizeImageUrl(buyNowProduct.image) : '/images/avatars/1.png'}
                            variant='rounded'
                          />
                        </ListItemAvatar>
                        <ListItemText
                          primary={buyNowProduct.name}
                          secondary={
                            <>
                              {buyNowProduct.price.toFixed(2)} DA x {buyNowProduct.quantity}
                              {buyNowProduct.supplier_name && (
                                <Typography
                                  variant='caption'
                                  component='span'
                                  display='block'
                                  sx={{ color: 'text.secondary', mt: 0.5 }}
                                >
                                  Seller: {buyNowProduct.supplier_name}
                                </Typography>
                              )}
                            </>
                          }
                        />
                        <Typography variant='body2'>
                          {(buyNowProduct.price * buyNowProduct.quantity).toFixed(2)} DA
                        </Typography>
                      </ListItem>
                    ) : (
                      cartItems.map(item => {
                        const price = item.negotiatedPrice || item.price

                        const imageUrl = item.product?.pictures?.[0]?.picture
                          ? normalizeImageUrl(item.product.pictures[0].picture)
                          : '/images/avatars/1.png'

                        return (
                          <ListItem key={item.id} sx={{ py: 1, px: 0 }}>
                            <ListItemAvatar>
                              <Avatar src={imageUrl} variant='rounded' />
                            </ListItemAvatar>
                            <ListItemText
                              primary={item.product.name}
                              secondary={
                                <>
                                  {price.toFixed(2)} DA x {item.quantity}
                                  {(item.supplier_name || item.product?.supplier?.name) && (
                                    <Typography
                                      variant='caption'
                                      component='span'
                                      display='block'
                                      sx={{ color: 'text.secondary', mt: 0.5 }}
                                    >
                                      Seller: {item.supplier_name || item.product?.supplier?.name}
                                    </Typography>
                                  )}
                                </>
                              }
                            />
                            <Typography variant='body2'>{(price * item.quantity).toFixed(2)} DA</Typography>
                          </ListItem>
                        )
                      })
                    )}
                    <Divider sx={{ my: 2 }} />
                    <ListItem sx={{ py: 1, px: 0 }}>
                      <ListItemText primary='Subtotal' />
                      <Typography variant='body2'>{subtotal.toFixed(2)} DA</Typography>
                    </ListItem>
                    <ListItem sx={{ py: 1, px: 0 }}>
                      <ListItemText primary='Shipping' />
                      <Typography variant='body2'>{shipping.toFixed(2)} DA</Typography>
                    </ListItem>
                    <ListItem sx={{ py: 1, px: 0 }}>
                      <ListItemText primary='Total' />
                      <Typography variant='subtitle1' fontWeight='bold'>
                        {total.toFixed(2)} DA
                      </Typography>
                    </ListItem>
                  </List>
                )}
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  )
}

const CheckoutPage = () => {
  return (
    <OrderProvider>
      <CheckoutPageContent />
    </OrderProvider>
  )
}

export default CheckoutPage
