'use client'

import { useState } from 'react'

import { useRouter, useParams } from 'next/navigation'

import { ShoppingCart, Trash2, Plus, Minus, ShoppingBag, RefreshCw } from 'lucide-react'
import Avatar from '@mui/material/Avatar'
import Badge from '@mui/material/Badge'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import Tooltip from '@mui/material/Tooltip'

import { getLocalizedUrl } from '@/utils/i18n'

import CustomChip from '@core/components/mui/Chip'
import { useCart } from '@/components/contexts/CartContext'

const CartDropdownContent = () => {
  const [anchorEl, setAnchorEl] = useState(null)
  const router = useRouter()
  const { lang: locale } = useParams()

  const {
    cartItems,
    cartOpen,
    setCartOpen,
    removeFromCart,
    updateQuantity,
    getTotalItems,
    getSubtotal,
    error,
    retryCartFetch,
    isAdding
  } = useCart()

  const handleDropdownOpen = event => {
    setAnchorEl(event.currentTarget)
    setCartOpen(true)
  }

  const handleDropdownClose = () => {
    setAnchorEl(null)
    setCartOpen(false)
  }

  const handleRemoveItem = (e, productId) => {
    e.stopPropagation()
    console.log('Removing product from cart dropdown:', productId)
    removeFromCart(productId)
  }

  const handleQuantityChange = (productId, quantity, increment = true, orderId) => {
    const newQuantity = increment ? quantity + 1 : quantity - 1

    if (newQuantity >= 1) {
      updateQuantity(productId, newQuantity)
    }
  }

  const handleValidateAndCheckout = () => {
    console.log('Redirection vers /checkout depuis CartDropdown')
    router.push(getLocalizedUrl('/checkout', locale))
    handleDropdownClose()
  }

  const handleViewCart = () => {
    router.push(getLocalizedUrl('/cart', locale))
    handleDropdownClose()
  }

  const handleRetryFetch = () => {
    retryCartFetch()
  }

  const subtotal = getSubtotal()
  const totalItems = getTotalItems()

  console.log('CartDropdown rendering with cartItems:', JSON.stringify(cartItems, null, 2))

  return (
    <>
      <Tooltip title='Shopping Cart'>
        <IconButton color='inherit' aria-haspopup='true' onClick={handleDropdownOpen} aria-controls='cart-menu'>
          <Badge badgeContent={totalItems} color='error'>
            <ShoppingCart />
          </Badge>
        </IconButton>
      </Tooltip>
      <Menu
        id='cart-menu'
        anchorEl={anchorEl}
        open={Boolean(anchorEl) || cartOpen}
        onClose={handleDropdownClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={{ '& .MuiPaper-root': { width: 380 } }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 4, py: 2 }}>
          <Typography variant='h6'>Shopping Cart</Typography>
          <CustomChip
            skin='light'
            size='small'
            color='primary'
            label={`${totalItems} item${totalItems !== 1 ? 's' : ''}`}
            sx={{ height: 20, fontSize: '0.75rem', fontWeight: 500 }}
          />
        </Box>
        {error && (
          <Box sx={{ px: 4, py: 1, bgcolor: 'error.light', color: 'error.contrastText' }}>
            <Typography variant='body2'>{error}</Typography>
            <Button
              size='small'
              startIcon={<RefreshCw size={14} />}
              onClick={handleRetryFetch}
              sx={{ mt: 1, color: 'error.contrastText' }}
            >
              Réessayer
            </Button>
          </Box>
        )}
        <Divider sx={{ my: '0 !important' }} />
        <Box sx={{ maxHeight: 350, overflowY: 'auto' }}>
          {cartItems.length > 0 ? (
            cartItems.map(item => {
              const price = item.price || 0

              return (
                <MenuItem
                  key={item.id}
                  onClick={handleDropdownClose}
                  sx={{ py: 2, px: 4, '&:hover': { backgroundColor: 'action.hover' } }}
                >
                  <Box sx={{ width: '100%', display: 'flex', alignItems: 'center' }}>
                    <Box sx={{ mr: 4 }}>
                      <Avatar
                        src={
                          item.product?.pictures?.[0]?.picture
                            ? `http://localhost:8000/storage/${item.product.pictures[0].picture}`
                            : 'https://placehold.co/40x40'
                        }
                        alt={item.product?.name || 'Unknown Product'}
                        sx={{ width: 40, height: 40, objectFit: 'contain' }}
                        variant='rounded'
                      />
                    </Box>
                    <Box sx={{ flex: '1 1', display: 'flex', overflow: 'hidden', flexDirection: 'column' }}>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          width: '100%',
                          overflow: 'hidden'
                        }}
                      >
                        <Typography
                          sx={{
                            fontWeight: 500,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {item.product?.name || 'Unknown Product'}
                        </Typography>
                        <IconButton
                          size='small'
                          onClick={e => handleRemoveItem(e, item.product_id)}
                          sx={{ color: 'text.secondary' }}
                        >
                          <Trash2 size={16} />
                        </IconButton>
                      </Box>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          mt: 1
                        }}
                      >
                        <Typography variant='body2' sx={{ color: 'text.primary' }}>
                          {price.toFixed(2)} DA x {item.quantity}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <IconButton
                            size='small'
                            onClick={e => {
                              e.stopPropagation()
                              handleQuantityChange(item.product_id, item.quantity, false)
                            }}
                            disabled={item.quantity <= 1}
                          >
                            <Minus size={14} />
                          </IconButton>
                          <Typography variant='body2' sx={{ mx: 1 }}>
                            {item.quantity}
                          </Typography>
                          <IconButton
                            size='small'
                            onClick={e => {
                              e.stopPropagation()
                              handleQuantityChange(item.product_id, item.quantity, true)
                            }}
                          >
                            <Plus size='14' />
                          </IconButton>
                        </Box>
                      </Box>
                      {item.supplier_id && (
                        <Typography variant='caption' sx={{ color: 'text.secondary', mt: 0.5 }}>
                          Supplier: {item.supplier_name || item.product?.supplier?.name || item.supplier_id}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </MenuItem>
              )
            })
          ) : (
            <MenuItem
              disableRipple
              disableTouchRipple
              sx={{ py: 3, px: 4, justifyContent: 'center', cursor: 'default' }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <ShoppingBag size={40} style={{ opacity: 0.3, marginBottom: 8 }} />
                <Typography variant='body2' sx={{ color: 'text.secondary' }}>
                  Your cart is empty
                </Typography>
              </Box>
            </MenuItem>
          )}
        </Box>
        <Divider sx={{ my: '0 !important' }} />
        <Box sx={{ p: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant='body2' sx={{ color: 'text.secondary' }}>
              Subtotal:
            </Typography>
            <Typography variant='body2' sx={{ fontWeight: 600 }}>
              {subtotal.toFixed(2)} DA
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button
              fullWidth
              variant='contained'
              onClick={handleValidateAndCheckout}
              disabled={cartItems.length === 0}
              startIcon={<ShoppingBag size={18} />}
            >
              Proceed to Checkout
            </Button>
            <Button fullWidth variant='outlined' onClick={handleViewCart}>
              View Cart
            </Button>
          </Box>
        </Box>
      </Menu>
    </>
  )
}

const CartDropdown = () => {
  return <CartDropdownContent />
}

export default CartDropdown
