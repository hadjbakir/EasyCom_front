'use client'

import { useState } from 'react'

import { Card, CardMedia, Box, Typography, Avatar, Button, Chip, Rating, Divider, Grid, Link } from '@mui/material'
import { MapPin, Clock, Phone, Globe, Mail, MessageSquare, Store, Ship, Factory } from 'lucide-react'

const StoreDetails = ({ product }) => {
  const [isFollowing, setIsFollowing] = useState(false)

  // Extraire les données du fournisseur depuis product.supplier
  const supplier = product?.supplier || {}

  // Base URL pour les images du stockage Laravel
  const STORAGE_BASE_URL = 'http://localhost:8000/storage'

  // Définir les types de magasin pour les badges
  const STORE_TYPES = {
    WORKSHOP: 'workshop',
    IMPORTER: 'importer',
    MERCHANT: 'merchant'
  }

  // Fonction pour obtenir l'icône du type de magasin
  const getStoreTypeIcon = type => {
    switch (type) {
      case STORE_TYPES.WORKSHOP:
        return <Factory size={16} />
      case STORE_TYPES.IMPORTER:
        return <Ship size={16} />
      case STORE_TYPES.MERCHANT:
      default:
        return <Store size={16} />
    }
  }

  // Fonction pour obtenir le libellé du type de magasin
  const getStoreTypeLabel = type => {
    switch (type) {
      case STORE_TYPES.WORKSHOP:
        return 'Workshop'
      case STORE_TYPES.IMPORTER:
        return 'Importer'
      case STORE_TYPES.MERCHANT:
      default:
        return 'Merchant'
    }
  }

  // Normaliser l'URL du logo
  const normalizeImageUrl = path => {
    if (!path) return '/images/avatars/1.png'

    // Si le chemin commence déjà par /storage ou une URL absolue, l'utiliser tel quel
    if (path.startsWith('/storage') || path.startsWith('http')) {
      return path
    }

    // Sinon, préfixer avec la base URL du stockage
    return `${STORAGE_BASE_URL}/${path}`
  }

  // Données du magasin avec fallbacks
  const storeData = {
    id: supplier.id || 'unknown',
    name: supplier.business_name || 'Unknown Store',
    logo: normalizeImageUrl(supplier.picture),
    coverImage: supplier.coverImage || '/images/pages/profile-banner.png',
    rating: supplier.rating || 4.8, // Placeholder
    reviewCount: supplier.reviewCount || 1243, // Placeholder
    verified: supplier.verified || true, // Placeholder
    since: supplier.created_at ? new Date(supplier.created_at).getFullYear().toString() : '2018',
    location: supplier.address || 'Unknown Location',
    type: supplier.type || STORE_TYPES.MERCHANT,
    responseTime: 'within 24 hours', // Placeholder
    description: supplier.description || 'No description available for this store.',
    contactInfo: {
      address: supplier.address || 'Unknown Address',
      phone: supplier.phone || '+1 (555) 123-4567', // Placeholder
      email: supplier.email || 'support@unknown.com', // Placeholder
      website: supplier.website || 'www.unknown.com', // Placeholder
      hours: 'Mon-Fri: 9AM-6PM, Sat: 10AM-4PM' // Placeholder
    },
    stats: {
      products: supplier.stats?.products || 1245, // Placeholder
      followers: supplier.stats?.followers || 45600, // Placeholder
      responseRate: supplier.stats?.responseRate || 98 // Placeholder
    },
    badges: supplier.badges || ['Verified Seller', 'Fast Shipper', 'Top Rated'] // Placeholder
  }

  // Log pour déboguer les URLs des images
  console.log(`Store ${storeData.id} logo URL:`, storeData.logo)
  console.log(`Store ${storeData.id} cover image URL:`, storeData.coverImage)

  return (
    <Card sx={{ mb: 3, p: 0, overflow: 'hidden' }}>
      {/* Image de couverture */}
      <CardMedia
        component='img'
        height='200'
        image={storeData.coverImage}
        alt={storeData.name}
        onError={e => {
          console.error(`Failed to load cover image for store ${storeData.id}:`, storeData.coverImage)
          e.target.src = '/images/pages/profile-banner.png'
        }}
      />

      {/* Section des informations du magasin */}
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, mb: 4 }}>
          {/* Logo et informations de base */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Avatar
              src={storeData.logo}
              alt={storeData.name}
              sx={{
                width: 100,
                height: 100,
                border: '4px solid white',
                boxShadow: 1,
                mt: { xs: -8, md: -8 }
              }}
              onError={e => {
                console.error(`Failed to load logo for store ${storeData.id}:`, storeData.logo)
                e.target.src = '/images/avatars/1.png'
              }}
            />
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                <Typography variant='h5' sx={{ fontWeight: 600 }}>
                  {storeData.name}
                </Typography>
                {storeData.verified && (
                  <Chip label='Verified' color='primary' size='small' icon={<i className='tabler-check' />} />
                )}
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Chip
                  icon={getStoreTypeIcon(storeData.type)}
                  label={getStoreTypeLabel(storeData.type)}
                  size='small'
                  variant='outlined'
                />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Rating value={storeData.rating} precision={0.1} size='small' readOnly />
                <Typography variant='body2' color='text.secondary'>
                  ({storeData.reviewCount} reviews)
                </Typography>
              </Box>
              <Typography variant='body2' color='text.secondary'>
                Member since {storeData.since}
              </Typography>
            </Box>
          </Box>

          {/* Statistiques et boutons d'action */}
          <Box
            sx={{
              ml: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              alignItems: { xs: 'flex-start', md: 'flex-end' }
            }}
          >
            <Box sx={{ display: 'flex', gap: 3 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant='h6'>{storeData.stats.products}</Typography>
                <Typography variant='body2' color='text.secondary'>
                  Products
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant='h6'>{storeData.stats.followers}</Typography>
                <Typography variant='body2' color='text.secondary'>
                  Followers
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant='h6'>{storeData.stats.responseRate}%</Typography>
                <Typography variant='body2' color='text.secondary'>
                  Response
                </Typography>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button variant={isFollowing ? 'outlined' : 'contained'} onClick={() => setIsFollowing(!isFollowing)}>
                {isFollowing ? 'Following' : 'Follow Store'}
              </Button>
              <Button variant='outlined' startIcon={<MessageSquare size={18} />}>
                Contact
              </Button>
            </Box>
          </Box>
        </Box>

        {/* Description du magasin */}
        <Typography variant='body1' paragraph>
          {storeData.description}
        </Typography>

        <Divider sx={{ my: 3 }} />

        {/* Badges du magasin */}
        <Box sx={{ mb: 3 }}>
          <Typography variant='subtitle1' sx={{ mb: 1, fontWeight: 600 }}>
            Store Badges
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {storeData.badges.map((badge, index) => (
              <Chip key={index} label={badge} color={index === 0 ? 'primary' : 'default'} variant='outlined' />
            ))}
          </Box>
        </Box>

        {/* Informations de contact */}
        <Typography variant='subtitle1' sx={{ mb: 2, fontWeight: 600 }}>
          Contact Information
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <MapPin size={20} />
              <Typography variant='body2'>{storeData.contactInfo.address}</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Phone size={20} />
              <Typography variant='body2'>{storeData.contactInfo.phone}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Mail size={20} />
              <Link href={`mailto:${storeData.contactInfo.email}`} underline='hover'>
                {storeData.contactInfo.email}
              </Link>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Globe size={20} />
              <Link href={`https://${storeData.contactInfo.website}`} target='_blank' underline='hover'>
                {storeData.contactInfo.website}
              </Link>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Clock size={20} />
              <Typography variant='body2'>{storeData.contactInfo.hours}</Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Card>
  )
}

export default StoreDetails
