'use client'

import { useState, useEffect } from 'react'

import { useRouter, useParams } from 'next/navigation'

// MUI Imports
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardMedia from '@mui/material/CardMedia'
import Chip from '@mui/material/Chip'
import Button from '@mui/material/Button'
import Rating from '@mui/material/Rating'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import Avatar from '@mui/material/Avatar'
import CircularProgress from '@mui/material/CircularProgress'
import Badge from '@mui/material/Badge'
import Tooltip from '@mui/material/Tooltip'

// Icon Imports
import {
  Search,
  X,
  MapPin,
  Users,
  Bookmark,
  Store,
  Factory,
  Ship,
  Package,
  Heart,
  HeartOff,
  CheckCircle
} from 'lucide-react'

import { getLocalizedUrl } from '@/utils/i18n'

// Custom Component Imports
import CustomIconButton from '@core/components/mui/IconButton'

import apiClient from '@/libs/api'

// Base URL for static files
const STORAGE_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

const SavedPageContent = () => {
  // States
  const [activeTab, setActiveTab] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  const [savedItems, setSavedItems] = useState({
    skills: [],
    spaces: [],
    stores: [],
    products: []
  })

  const [loading, setLoading] = useState(true)

  // Hooks
  const router = useRouter()
  const { lang: locale = 'en' } = useParams()

  // Fetch saved items
  useEffect(() => {
    const fetchSavedItems = async () => {
      setLoading(true)

      try {
        // Fetch saved service providers (skills)
        const skillsResponse = await apiClient.get('/saved-service-providers')

        const skillsData = skillsResponse.data.data.map(skill => ({
          ...skill,
          type: 'skill',
          available: true,
          rating:
            skill.reviews?.length > 0
              ? skill.reviews.reduce((acc, review) => acc + review.rating, 0) / skill.reviews.length
              : 0
        }))

        setSavedItems(prev => ({ ...prev, skills: skillsData }))

        // Fetch saved workspaces (spaces)
        const spacesResponse = await apiClient.get('/saved-workspaces')

        console.log('Spaces Response:', spacesResponse.data)

        const spacesData = spacesResponse.data.data.map(space => ({
          ...space,
          type: 'space',
          rating:
            space.reviews?.length > 0
              ? space.reviews.reduce((acc, review) => acc + review.rating, 0) / space.reviews.length
              : 0,
          review_count: space.reviews?.length || 0,
          is_active: space.is_active || false
        }))

        setSavedItems(prev => ({ ...prev, spaces: spacesData }))

        // Fetch saved suppliers (stores)
        const storesResponse = await apiClient.get('/saved-suppliers')

        console.log('Stores Response:', storesResponse.data)

        const storesData = storesResponse.data.data.map(store => {
          const pictureUrl = store.picture
            ? store.picture.startsWith('http')
              ? store.picture
              : `${STORAGE_BASE_URL}/storage/${store.picture.replace(/^\/+/, '')}`
            : '/images/logos/default.png'

          return {
            ...store,
            type: 'store',
            name: store.business_name,
            picture: pictureUrl,
            rating:
              store.reviews?.length > 0
                ? store.reviews.reduce((acc, review) => acc + review.rating, 0) / store.reviews.length
                : 0,
            review_count: store.reviews?.length || 0,
            product_count: store.products?.length || 0,
            followers: store.followers || 0,
            verified: store.verified || false
          }
        })

        setSavedItems(prev => ({ ...prev, stores: storesData }))

        // Fetch saved products
        const productsResponse = await apiClient.get('/saved-products')

        console.log('Products Response:', productsResponse.data)

        const productsData = productsResponse.data.data.map(product => {
          const pictureUrl =
            product.pictures && product.pictures.length > 0
              ? product.pictures[0].picture.startsWith('http')
                ? product.pictures[0].picture
                : `${STORAGE_BASE_URL}/storage/${product.pictures[0].picture.replace(/^\/+/, '')}`
              : '/images/products/default.png'

          return {
            ...product,
            type: 'product',
            picture: pictureUrl,
            rating:
              product.reviews?.length > 0
                ? product.reviews.reduce((acc, review) => acc + review.rating, 0) / product.reviews.length
                : 0,
            review_count: product.reviews?.length || 0,
            discount_percentage: product.discount_percentage || 0,
            discounted_price: product.discounted_price || product.price,
            stock: product.stock || 0
          }
        })

        setSavedItems(prev => ({ ...prev, products: productsData }))
      } catch (error) {
        console.error('Error fetching saved items:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchSavedItems()
  }, [])

  // Filter items based on tab and search term
  const getFilteredItems = () => {
    let items = []

    if (activeTab === 'all') {
      items = [...savedItems.skills, ...savedItems.spaces, ...savedItems.stores, ...savedItems.products]
    } else {
      items = savedItems[activeTab + 's']
    }

    return items.filter(
      item =>
        item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }

  const filteredItems = getFilteredItems()

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue)
  }

  // Handle item click
  const handleItemClick = item => {
    let url = ''

    switch (item.type) {
      case 'skill':
        url = `/apps/explore/skills/${item.id}`
        break
      case 'space':
        url = `/apps/explore/spaces/${item.id}`
        break
      case 'store':
        url = `/apps/explore/stores/${item.id}`
        break
      case 'product':
        url = `/apps/explore/products/${item.id}`
        break
      default:
        return
    }

    router.push(getLocalizedUrl(url, locale))
  }

  // Handle unsave
  const handleUnsave = async (e, item) => {
    e.stopPropagation()

    try {
      let endpoint = ''
      let payload = {}

      switch (item.type) {
        case 'skill':
          endpoint = '/saved-service-providers/unsave'
          payload = { service_provider_id: item.id }
          break
        case 'space':
          endpoint = '/saved-workspaces/unsave'
          payload = { workspace_id: item.id }
          break
        case 'store':
          endpoint = '/saved-suppliers/unsave'
          payload = { supplier_id: item.id }
          break
        case 'product':
          endpoint = '/saved-products/unsave'
          payload = { product_id: item.id }
          break
        default:
          return
      }

      await apiClient.post(endpoint, payload)

      // Update local state
      setSavedItems(prev => ({
        ...prev,
        [item.type + 's']: prev[item.type + 's'].filter(i => i.id !== item.id)
      }))
    } catch (error) {
      console.error('Error unsaving item:', error)
    }
  }

  // Render skill card
  const renderSkillCard = item => (
    <Card className='h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1'>
      <CardContent className='flex flex-col items-center p-6'>
        <Box className='w-full flex justify-end'>
          <CustomIconButton onClick={e => handleUnsave(e, item)} className='text-gray-500 hover:text-blue-500'>
            <Bookmark className='h-5 w-5' />
          </CustomIconButton>
        </Box>
        <Badge
          overlap='circular'
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          badgeContent={
            <Tooltip title={item.available ? 'Available now' : 'Limited availability'}>
              <Box
                className='w-3.5 h-3.5 rounded-full border-2 border-white'
                sx={{ backgroundColor: item.available ? 'success.main' : 'warning.main' }}
              />
            </Tooltip>
          }
        >
          <Avatar
            src={
              item.user?.picture
                ? `${STORAGE_BASE_URL}${item.user.picture.startsWith('/storage/') ? '' : '/storage/'}${item.user.picture}`
                : '/placeholder.svg?height=200&width=300'
            }
            className='w-24 h-24 border-4 border-solid border-background shadow-md'
          />
        </Badge>
        <Box className='flex flex-col items-center text-center mt-4 mb-2'>
          <Typography variant='h5' className='font-semibold'>
            {item.user?.full_name}
          </Typography>
          <Typography variant='body2' color='textSecondary' className='mt-1'>
            {item.skill_domain?.name}
          </Typography>
          <Box className='flex items-center gap-1 mt-2'>
            <Rating value={item.rating || 0} precision={0.1} size='small' readOnly />
            <Typography variant='body2' color='textSecondary'>
              ({item.reviews?.length || 0} reviews)
            </Typography>
          </Box>
        </Box>
        <Typography variant='body2' color='textSecondary' className='text-center mt-2 line-clamp-2'>
          {item.description}
        </Typography>
        <Box className='flex flex-wrap gap-2 mt-4 justify-center'>
          {item.skills?.map((skill, index) => (
            <Chip
              key={index}
              label={skill.name}
              color='info'
              size='small'
              variant='outlined'
              className='transition-all hover:scale-105'
            />
          ))}
        </Box>
        <Box className='flex gap-2 mt-4'>
          <Button variant='outlined' color='primary' onClick={() => handleItemClick(item)}>
            View Profile
          </Button>
        </Box>
      </CardContent>
    </Card>
  )

  // Render space card
  const renderSpaceCard = item => (
    <Card className='h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1'>
      <Box className='relative'>
        <Box className='w-full flex justify-end absolute top-2 right-2 z-10'>
          <CustomIconButton
            onClick={e => handleUnsave(e, item)}
            className='text-gray-500 hover:text-blue-500 bg-white/80 hover:bg-white'
          >
            <Bookmark className='h-5 w-5' />
          </CustomIconButton>
        </Box>
        <CardMedia
          component='img'
          height='200'
          image={
            item.picture
              ? `${STORAGE_BASE_URL}${item.picture.startsWith('/storage/') ? '' : '/storage/'}${item.picture}`
              : '/placeholder.svg?height=200&width=300'
          }
          alt={item.name}
          className='h-48 object-cover'
        />
        <Box
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            display: 'flex',
            gap: 1
          }}
        >
          {item.is_active && <Chip label='Active' color='success' size='small' variant='outlined' />}
        </Box>
      </Box>

      <CardContent>
        <Box className='mb-4'>
          <Typography variant='h5' className='font-semibold mb-1'>
            {item.name}
          </Typography>
          <Box className='flex items-center gap-1 mb-2'>
            <MapPin size={16} />
            <Typography variant='body2' color='textSecondary'>
              {item.location}
            </Typography>
          </Box>

          <Box className='flex items-center gap-4 mb-4'>
            <Box className='flex items-center gap-1'>
              <Users size={16} />
              <Typography variant='body2'>Capacity: {item.capacity} people</Typography>
            </Box>
            <Box className='flex items-center gap-1'>
              <Rating value={item.rating || 0} precision={0.1} size='small' readOnly />
              <Typography variant='body2' color='textSecondary'>
                ({item.review_count || 0} reviews)
              </Typography>
            </Box>
          </Box>

          <Typography variant='body2' color='textSecondary' className='line-clamp-2 mb-4'>
            {item.description}
          </Typography>

          <Box className='flex items-center justify-between'>
            <Typography variant='h6' color='primary'>
              {item.price_per_day} DZ/day
            </Typography>
            <Box className='flex gap-2'>
              <Button variant='outlined' color='primary' onClick={() => handleItemClick(item)}>
                View Details
              </Button>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  )

  // Render store card
  const renderStoreCard = item => (
    <Card className='h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1'>
      <Box className='relative'>
        <Box className='w-full flex justify-end absolute top-2 right-2 z-10'>
          <CustomIconButton
            onClick={e => handleUnsave(e, item)}
            className='text-gray-500 hover:text-blue-500 bg-white/80 hover:bg-white'
          >
            <Bookmark className='h-5 w-5' />
          </CustomIconButton>
        </Box>
        <CardMedia image='/images/pages/profile-banner.png' className='bs-[150px]' alt={item.business_name} />
        <Avatar
          src={item.picture || '/images/pages/logos/slack.png'}
          alt={item.business_name}
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
      </Box>

      <CardContent sx={{ pt: 8 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant='h5'>{item.business_name}</Typography>
              {item.verified && (
                <Chip
                  icon={<CheckCircle size={16} />}
                  label='Verified'
                  color='primary'
                  size='small'
                  variant='outlined'
                />
              )}
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
              <Chip
                icon={getStoreTypeIcon(item.type)}
                label={getStoreTypeLabel(item.type)}
                size='small'
                variant='outlined'
              />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Rating value={item.rating || 0} precision={0.1} size='small' readOnly />
                <Typography variant='body2'>({item.review_count || 0} reviews)</Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        <Typography variant='body2' color='textSecondary' className='line-clamp-2 mb-4'>
          {item.description}
        </Typography>

        <Box sx={{ display: 'flex', gap: 4, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Package size={16} />
            <Typography variant='body2'>{item.product_count || 0} Products</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Users size={16} />
            <Typography variant='body2'>{item.followers?.toLocaleString() || 0} Followers</Typography>
          </Box>
        </Box>

        <Box className='flex gap-2 mt-4'>
          <Button variant='outlined' color='primary' onClick={() => handleItemClick(item)}>
            View Store
          </Button>
        </Box>
      </CardContent>
    </Card>
  )

  // Helper functions for store type
  const getStoreTypeIcon = type => {
    switch (type) {
      case 'raw_material':
        return <Factory size={20} />
      case 'import':
        return <Ship size={20} />
      case 'normal':
      default:
        return <Store size={20} />
    }
  }

  const getStoreTypeLabel = type => {
    switch (type) {
      case 'raw_material':
        return 'Raw Material Store'
      case 'import':
        return 'Import Store'
      case 'normal':
      default:
        return 'Retail Store'
    }
  }

  // Render product card
  const renderProductCard = item => (
    <Card className='h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1'>
      <Box className='relative'>
        <Box className='w-full flex justify-end absolute top-2 right-2 z-10'>
          <CustomIconButton
            onClick={e => handleUnsave(e, item)}
            className='text-gray-500 hover:text-blue-500 bg-white/80 hover:bg-white'
          >
            <Bookmark className='h-5 w-5' />
          </CustomIconButton>
        </Box>
        <CardMedia component='img' height='200' image={item.picture} alt={item.name} />
        {item.discount_percentage > 0 && (
          <Chip
            label={`${item.discount_percentage}% OFF`}
            color='error'
            size='small'
            className='absolute top-4 left-4'
          />
        )}
      </Box>

      <CardContent>
        <Box className='mb-4'>
          <Typography variant='h6' className='font-semibold mb-1'>
            {item.name}
          </Typography>

          <Box className='flex items-center gap-2 mb-2'>
            <Avatar
              src={
                item.store?.logo
                  ? `${STORAGE_BASE_URL}${item.store.logo.startsWith('/storage/') ? '' : '/storage/'}${item.store.logo}`
                  : '/placeholder.svg?height=32&width=32'
              }
              alt={item.store?.name}
              sx={{ width: 24, height: 24 }}
            />
            <Typography variant='body2' color='textSecondary'>
              {item.store?.name}
            </Typography>
          </Box>

          <Box className='flex items-center gap-4 mb-4'>
            <Box className='flex items-center gap-1'>
              <Rating value={item.rating || 0} precision={0.1} size='small' readOnly />
              <Typography variant='body2' color='textSecondary'>
                ({item.review_count || 0})
              </Typography>
            </Box>
            <Box className='flex items-center gap-1'>
              <Package size={16} />
              <Typography variant='body2'>{item.stock || 0} in stock</Typography>
            </Box>
          </Box>

          <Typography variant='body2' color='textSecondary' className='line-clamp-2 mb-4'>
            {item.description}
          </Typography>

          <Box className='flex items-center justify-between'>
            <Box>
              {item.discount_percentage > 0 ? (
                <Box className='flex items-center gap-2'>
                  <Typography variant='h6' color='error'>
                    {item.discounted_price} DZ
                  </Typography>
                  <Typography variant='body2' color='textSecondary' sx={{ textDecoration: 'line-through' }}>
                    {item.price} DZ
                  </Typography>
                </Box>
              ) : (
                <Typography variant='h6' color='primary'>
                  {item.price} DZ
                </Typography>
              )}
            </Box>
            <Box className='flex gap-2'>
              <Button variant='outlined' color='primary' onClick={() => handleItemClick(item)}>
                View Product
              </Button>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  )

  return (
    <Box className='saved-items-container'>
      {/* Header */}
      <Box className='mb-8'>
        <Typography variant='h4' className='font-bold mb-2'>
          Saved Items
        </Typography>
        <Typography variant='body1' className='text-textSecondary'>
          View and manage your saved items
        </Typography>
      </Box>

      {/* Filters */}
      <Box className='mb-8'>
        <Box className='flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6'>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab value='all' label='All Items' />
            <Tab value='skill' label='Skills' />
            <Tab value='space' label='Spaces' />
            <Tab value='store' label='Stores' />
            <Tab value='product' label='Products' />
          </Tabs>

          <TextField
            placeholder='Search saved items...'
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            variant='outlined'
            size='small'
            className='min-w-[240px] w-full sm:w-auto'
            InputProps={{
              startAdornment: (
                <InputAdornment position='start'>
                  <Search className='text-textSecondary' size={20} />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position='end'>
                  <CustomIconButton size='small' onClick={() => setSearchTerm('')} className='text-textSecondary'>
                    <X size={20} />
                  </CustomIconButton>
                </InputAdornment>
              )
            }}
          />
        </Box>

        {/* Results count */}
        <Typography variant='body2' className='text-textSecondary'>
          Showing {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
        </Typography>
      </Box>

      {/* Items Grid */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
          <CircularProgress />
        </Box>
      ) : filteredItems.length > 0 ? (
        <Grid container spacing={6}>
          {filteredItems.map(item => (
            <Grid item xs={12} sm={6} md={4} key={`${item.type}-${item.id}`} onClick={() => handleItemClick(item)}>
              {item.type === 'skill' && renderSkillCard(item)}
              {item.type === 'space' && renderSpaceCard(item)}
              {item.type === 'store' && renderStoreCard(item)}
              {item.type === 'product' && renderProductCard(item)}
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box sx={{ textAlign: 'center', py: 6 }}>
          <Typography variant='h6'>No saved items found</Typography>
          <Typography variant='body2' color='textSecondary'>
            {searchTerm ? 'Try adjusting your search' : 'Start saving items to see them here'}
          </Typography>
        </Box>
      )}
    </Box>
  )
}

const SavedPage = () => {
  return <SavedPageContent />
}

export default SavedPage
