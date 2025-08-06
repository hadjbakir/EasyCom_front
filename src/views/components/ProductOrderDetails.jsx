import { Box, Typography, Divider, Chip, Avatar, Grid } from '@mui/material'

const statusLabels = {
  pending: { label: 'Pending', color: 'warning' },
  processing: { label: 'Processing', color: 'info' },
  delivered: { label: 'Delivered', color: 'success' }
}

/**
 * Retourne l'URL absolue de la première image du produit, ou un placeholder si absent.
 */
function getProductImageUrl(product) {
  if (!product) return '/images/placeholder.jpg'
  const picture = product.pictures?.[0]?.picture

  if (!picture) return '/images/placeholder.jpg'
  if (picture.startsWith('http')) return picture
  const cleanPath = picture.replace(/^(storage\/|public\/)/, '')
  const base = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

  return `${base}/storage/${cleanPath}`
}

const ProductOrderDetails = ({ order }) => {
  if (!order) return null

  return (
    <Box>
      <Typography variant='subtitle1' sx={{ mb: 1 }}>
        Order #{order.id}
      </Typography>
      <Divider sx={{ mb: 2 }} />
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Typography variant='body2' sx={{ fontWeight: 500 }}>
            Client
          </Typography>
          <Typography variant='body2'>{order.full_name}</Typography>
          <Typography variant='body2'>{order.phone_number}</Typography>
          <Typography variant='body2'>{order.address}</Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant='body2' sx={{ fontWeight: 500 }}>
            Status
          </Typography>
          <Chip
            label={statusLabels[order.status]?.label || order.status}
            color={statusLabels[order.status]?.color || 'default'}
            size='small'
            variant='outlined'
            sx={{ mb: 1 }}
          />
          <Typography variant='body2' sx={{ fontWeight: 500 }}>
            Date
          </Typography>
          <Typography variant='body2'>{new Date(order.created_at).toLocaleString('en-GB')}</Typography>
        </Grid>
      </Grid>
      <Divider sx={{ my: 2 }} />
      <Typography variant='body2' sx={{ fontWeight: 500, mb: 1 }}>
        Products
      </Typography>
      {order.order_products?.map(op => (
        <Box key={op.id} sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <Avatar
            src={getProductImageUrl(op.product)}
            alt={op.product?.name || `Product #${op.product_id} (deleted)`}
            sx={{ width: 32, height: 32 }}
            onError={e => {
              e.target.src = '/images/placeholder.jpg'
            }}
          />
          <Box>
            <Typography variant='body2'>{op.product?.name || `Product #${op.product_id} (deleted)`}</Typography>
            <Typography variant='caption' color='text.secondary'>
              Qty: {op.quantity} × {op.unit_price} DZ
            </Typography>
          </Box>
        </Box>
      ))}
      <Divider sx={{ my: 2 }} />
      <Typography variant='body2' sx={{ fontWeight: 500 }}>
        Total
      </Typography>
      <Typography variant='body2'>
        {order.order_products?.reduce((sum, op) => sum + op.unit_price * op.quantity, 0).toFixed(2)} DZ
      </Typography>
    </Box>
  )
}

export default ProductOrderDetails
