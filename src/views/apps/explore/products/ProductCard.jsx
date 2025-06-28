'use client'

import { useState, useEffect } from 'react'

import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'

import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  Button,
  Rating,
  IconButton,
  Avatar,
  Tooltip
} from '@mui/material'
import {
  Store,
  Factory,
  Ship,
  ShoppingCart,
  Heart,
  HeartOff,
  Share2,
  ExternalLink,
  MessageSquare,
  Image as ImageIcon
} from 'lucide-react'
import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong'

import { useCart } from '@/components/contexts/CartContext'
import { useNegotiation } from '@/components/contexts/NegotiationContext'
import { STORE_TYPES } from '@/components/contexts/StoreContext'
import OrderDialog from '@/views/apps/explore/products/ProductDetails/OrderDialog'
import { useImageSearchResults } from '@/components/contexts/ImageSearchResultsContext'
import { searchProductsByImageId, getSupplierById } from '@/libs/api/productOrders'
import { getLocalizedUrl } from '@/utils/i18n'
import apiClient from '@/libs/api'

const STORAGE_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

const buildImageUrl = picture => {
  if (!picture) return null
  if (picture.startsWith('http')) return picture
  const cleanPath = picture.replace(/^(storage\/|public\/)/, '')

  return `${STORAGE_BASE_URL}/storage/${cleanPath}`
}

const ProductCard = ({ product, onAddToCart }) => {
  const router = useRouter()
  const { lang: locale } = useParams()
  const { addToCart, isAdding } = useCart()
  const { startNegotiation } = useNegotiation()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isSaved, setIsSaved] = useState(product.isSaved || false)
  const [isSaving, setIsSaving] = useState(false)
  const { setResults } = useImageSearchResults()

  // Use the rating and reviewCount that are already calculated in ProductContext
  const averageRating = product.rating || 0
  const reviewCount = product.reviewCount || 0

  const originalPrice =
    typeof product.originalPrice === 'number'
      ? product.originalPrice
      : parseFloat(product.originalPrice) || product.price || 0

  const discount =
    originalPrice && product.price < originalPrice
      ? Math.round(((originalPrice - product.price) / originalPrice) * 100)
      : 0

  const getStoreTypeIcon = type => {
    switch (type) {
      case STORE_TYPES.RAW_MATERIAL:
        return <Factory size={16} />
      case STORE_TYPES.IMPORT:
        return <Ship size={16} />
      case STORE_TYPES.NORMAL:
      default:
        return <Store size={16} />
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

  const handleViewProduct = () => {
    router.push(getLocalizedUrl(`/apps/explore/products/ProductDetails/${product.id}`, locale))
  }

  const handleViewStore = e => {
    e.stopPropagation()
    router.push(getLocalizedUrl(`/apps/explore/stores/${product.storeId}`, locale))
  }

  const handleAddToCart = e => {
    e.stopPropagation()

    if (onAddToCart) {
      onAddToCart(product)
    } else {
      addToCart(product)
    }
  }

  const handleToggleSaved = async e => {
    e.stopPropagation()
    if (isSaving) return

    setIsSaving(true)

    try {
      if (isSaved) {
        // Unsave
        await apiClient.post(
          '/saved-products/unsave',
          {
            product_id: product.id
          },
          {
            timeout: 5000 // 5 seconds timeout for save/unsave operations
          }
        )
      } else {
        // Save
        await apiClient.post(
          '/saved-products/save',
          {
            product_id: product.id
          },
          {
            timeout: 5000 // 5 seconds timeout for save/unsave operations
          }
        )
      }

      setIsSaved(!isSaved)
    } catch (error) {
      console.error('Failed to save/unsave product:', error)

      // Don't change the saved state if the operation failed
      // This prevents UI inconsistency
    } finally {
      setIsSaving(false)
    }
  }

  const handleShare = e => {
    e.stopPropagation()
    alert(`Sharing product: ${product.name}`)
  }

  const handleNegotiate = e => {
    e.stopPropagation()
    setDialogOpen(true)
  }

  const handleDialogClose = () => {
    setDialogOpen(false)
  }

  const handleNegotiateSubmit = proposedPrice => {
    startNegotiation(product.id, product.price, proposedPrice)
    setDialogOpen(false)
  }

  const handleSimilarImageSearch = async e => {
    e.stopPropagation()

    try {
      const imageId = product.pictures?.[0]?.id

      if (!imageId) {
        alert('Aucune image principale trouvée pour ce produit.')

        return
      }

      const data = await searchProductsByImageId(imageId)

      if (data && data.data && Array.isArray(data.data) && data.data.length > 0) {
        // Regrouper par produit
        const productMap = {}

        data.data.forEach(item => {
          const prodId = item.product.id

          if (!productMap[prodId]) {
            productMap[prodId] = {
              ...item.product,
              id: item.product.id.toString(),
              name: item.product.name || 'Unknown Product',
              price: item.product.price ? parseFloat(item.product.price) : 0,
              originalPrice: item.product.originalPrice
                ? parseFloat(item.product.originalPrice)
                : item.product.price
                  ? parseFloat(item.product.price)
                  : 0,
              pictures: [],
              supplier_id: item.product.supplier_id,
              description: item.product.description || '',
              category: item.product.category || 'Unknown',
              featured: item.product.featured || false,
              quantity: item.product.quantity || 0,
              minimum_quantity: item.product.minimum_quantity || 1,
              rating: item.product.rating || 4.5,
              reviewCount: item.product.reviewCount || 0
            }
          }

          // Ajoute chaque image au tableau pictures
          const picPath = item.picture
          let url = buildImageUrl(picPath)

          productMap[prodId].pictures.push({ id: item.id, picture: url })
        })

        // Pour chaque produit, définit 'image' comme la première image du tableau pictures
        const products = Object.values(productMap).map(prod => ({
          ...prod,
          image: prod.pictures.length > 0 ? prod.pictures[0].picture : 'https://placehold.co/300x300'
        }))

        // Récupérer les infos de chaque store en parallèle
        const productsWithStore = await Promise.all(
          products.map(async prod => {
            let storeName = ''
            let storeLogo = ''
            let storeId = prod.supplier_id ? prod.supplier_id.toString() : null
            let storeType = 'unknown'

            try {
              const supplier = await getSupplierById(prod.supplier_id)

              storeName = supplier.business_name || 'Unknown Store'
              storeLogo = supplier.picture ? buildImageUrl(supplier.picture) : 'https://placehold.co/100x100'
              storeType =
                supplier.type === 'merchant'
                  ? STORE_TYPES.NORMAL
                  : supplier.type === 'workshop'
                    ? STORE_TYPES.RAW_MATERIAL
                    : supplier.type === 'importer'
                      ? STORE_TYPES.IMPORT
                      : 'unknown'
            } catch (err) {
              storeName = `Store #${prod.supplier_id}`
              storeLogo = 'https://placehold.co/100x100'
              storeType = 'unknown'
            }

            return {
              ...prod,
              storeName,
              storeLogo,
              storeId,
              storeType,
              inStock: (prod.quantity || 0) > 0,
              reviewCount: 12,
              rating: 4.5,
              minimumQuantity: prod.minimum_quantity || 1,
              featured: prod.featured || false,
              category: prod.category || 'Unknown',
              description: prod.description || ''
            }
          })
        )

        setResults(productsWithStore)
        window.sessionStorage.setItem('imageSearchResults', JSON.stringify(productsWithStore))
        router.push(getLocalizedUrl(`/apps/explore/products-and-stores/image-search-results`, locale))
      } else {
        alert('Aucun produit similaire trouvé.')
      }
    } catch (err) {
      alert(err?.message || "Erreur lors de la recherche d'images similaires.")
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
          component={Link}
          href={getLocalizedUrl(`/apps/explore/products/ProductDetails/${product.id}`, locale)}
          image={product.image || 'https://placehold.co/300x300'}
          alt={product.name}
          sx={{ height: 300 }}
          onError={e => {
            console.error(`Failed to load image for product ${product.id}:`, product.image)
            e.target.src = 'https://placehold.co/300x300'
          }}
        />
        <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 0.5 }}>
          <Tooltip title='Trouver des produits similaires par image'>
            <IconButton
              size='small'
              sx={{ bgcolor: 'background.paper', '&:hover': { bgcolor: 'primary.light' } }}
              onClick={handleSimilarImageSearch}
            >
              <CenterFocusStrongIcon fontSize='small' />
            </IconButton>
          </Tooltip>
          <Tooltip title={isSaved ? 'Remove from favorites' : 'Save to favorites'}>
            <IconButton
              size='small'
              onClick={handleToggleSaved}
              disabled={isSaving}
              className={`${isSaved ? 'bg-white text-primary' : 'bg-white/80 hover:bg-white'}`}
              sx={{ color: isSaved ? 'primary.main' : 'text.primary' }}
            >
              {isSaved ? <Heart size={18} /> : <HeartOff size={18} />}
            </IconButton>
          </Tooltip>
        </Box>
        {discount > 0 && (
          <Chip label={`-${discount}%`} color='error' size='small' sx={{ position: 'absolute', top: 8, left: 8 }} />
        )}
      </Box>
      <CardContent sx={{ pt: 2, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography variant='h6' component='div' sx={{ mb: 1, fontWeight: 600 }}>
          {product.name}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Rating value={averageRating} precision={0.1} size='small' readOnly />
          <Typography variant='body2'>({reviewCount} reviews)</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Typography variant='h6' color='primary' sx={{ fontWeight: 600 }}>
            {(typeof product.price === 'number' ? product.price : 0).toFixed(2)} DA
          </Typography>
          {discount > 0 && (
            <Typography variant='body2' color='text.secondary' sx={{ textDecoration: 'line-through', ml: 1 }}>
              {(typeof originalPrice === 'number' ? originalPrice : 0).toFixed(2)} DA
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
            imgProps={{
              onError: e => {
                console.error(`Failed to load store logo for product ${product.id}:`, product.storeLogo)
                e.target.src = 'https://placehold.co/24x24'
              }
            }}
          />
          <Typography variant='body2' sx={{ flex: 1, fontWeight: 500 }}>
            {product.storeName}
          </Typography>
          <Tooltip title='View Store'>
            <IconButton size='small' onClick={handleViewStore}>
              <ExternalLink size={16} />
            </IconButton>
          </Tooltip>
          <Chip
            icon={getStoreTypeIcon(product.storeType)}
            label={getStoreTypeLabel(product.storeType)}
            size='small'
            variant='outlined'
          />
        </Box>
        <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'space-between' }}>
          <Button variant='outlined' size='small' onClick={handleViewProduct}>
            View Details
          </Button>
          <Button
            variant='contained'
            size='small'
            startIcon={<ShoppingCart size={16} />}
            onClick={handleAddToCart}
            disabled={!product.inStock || isAdding}
          >
            Add to Cart
          </Button>
        </Box>
      </CardContent>
      <OrderDialog open={dialogOpen} onClose={handleDialogClose} product={product} onSubmit={handleNegotiateSubmit} />
    </Card>
  )
}

export default ProductCard
