'use client'

import { useState, useEffect } from 'react'

import { useRouter ,useParams} from 'next/navigation'

import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  Button,
  Rating,
  Avatar,
  IconButton,
  Tooltip
} from '@mui/material'
import { Store, Factory, Ship, CheckCircle, Users, Package, Heart, HeartOff, Share2 } from 'lucide-react'

import { STORE_TYPES } from '@/components/contexts/StoreContext'
import apiClient from '@/libs/api'
import { getLocalizedUrl } from '@/utils/i18n'


const StoreCard = ({ store, onViewProducts }) => {
  const { lang: locale } = useParams()
  const router = useRouter()
  const [isSaved, setIsSaved] = useState(store.isSaved || false)
  const [isSaving, setIsSaving] = useState(false)

  // Calculate average rating and review count from the reviews array in the store object
  const averageRating =
    store.reviews && store.reviews.length > 0
      ? store.reviews.reduce((acc, review) => acc + (review.rating || 0), 0) / store.reviews.length
      : 0

  const reviewCount = store.reviewCount || 0

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

  const handleViewStore = () => {
    router.push(getLocalizedUrl(`/apps/explore/stores/${store.id}`, locale))
  }

  const handleViewStoreProducts = e => {
    e.stopPropagation()

    if (process.env.NODE_ENV === 'development') {
      console.log('StoreCard: Calling onViewProducts with storeId:', store.id)
    }

    if (onViewProducts) {
      onViewProducts(String(store.id))
    }
  }

  const handleToggleSaved = async e => {
    e.stopPropagation()
    if (isSaving) return

    setIsSaving(true)

    try {
      if (isSaved) {
        // Unsave
        await apiClient.post('/saved-suppliers/unsave', {
          supplier_id: store.id
        })
      } else {
        // Save
        await apiClient.post('/saved-suppliers/save', {
          supplier_id: store.id
        })
      }

      setIsSaved(!isSaved)
    } catch (error) {
      console.error('Failed to save/unsave store:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleShare = e => {
    e.stopPropagation()
    alert(`Sharing store: ${store.name}`)
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
      onClick={handleViewStore}
    >
      <Box sx={{ position: 'relative' }}>
        <CardMedia image='/images/pages/profile-banner.png' className='bs-[150px]' alt={store.name} />
        <Avatar
          src={store.logo || '/images/pages/logos/slack.png'}
          alt={store.name}
          sx={{
            position: 'absolute',
            bottom: -30,
            left: 16,
            width: 60,
            height: 60,
            border: '3px solid white',
            boxShadow: 2
          }}
        />
        {store.featured && (
          <Chip label='Featured' color='primary' size='small' sx={{ position: 'absolute', top: 8, left: 8 }} />
        )}
        <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 1 }}>
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
      </Box>
      <CardContent sx={{ pt: 4, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ mt: 6, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant='h6' component='div' sx={{ fontWeight: 600 }}>
              {store.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
              <Chip
                icon={getStoreTypeIcon(store.type)}
                label={getStoreTypeLabel(store.type)}
                size='small'
                variant='outlined'
              />
              {store.verified && (
                <Tooltip title='Verified Store'>
                  <CheckCircle size={16} color='primary' />
                </Tooltip>
              )}
            </Box>
          </Box>
        </Box>

        <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
          {store.description}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Rating value={averageRating} precision={0.1} size='small' readOnly />
          <Typography variant='body2' color='text.secondary'>
            ({reviewCount})
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Package size={16} />
            <Typography variant='body2'>{store.productCount} Products</Typography>
          </Box>
        </Box>

        <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'space-between' }}>
          <Button variant='outlined' size='small' onClick={handleViewStore} fullWidth>
            View Store
          </Button>
        </Box>
      </CardContent>
    </Card>
  )
}

export default StoreCard
