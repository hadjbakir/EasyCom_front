'use client'

import { useState, useEffect } from 'react'

import { useParams } from 'next/navigation'
import NextLink from 'next/link'

import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Chip,
  CircularProgress,
  Alert,
  Tab,
  Tabs,
  Tooltip
} from '@mui/material'
import { MapPin, Search, X, Bookmark, BookmarkCheck } from 'lucide-react'

import apiClient from '@/libs/api'
import CustomIconButton from '@core/components/mui/IconButton'

const STORAGE_BASE_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000').replace(/\/+$/, '')

const constructWorkspaceImageUrl = path => {
  if (!path) return '/images/spaces/default.png'
  if (path.startsWith('http')) return path

  return `${STORAGE_BASE_URL}/storage/${path.replace(/^\/+/, '')}`
}

const SpacesList = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState(0)
  const [priceRange, setPriceRange] = useState('all')
  const [spaces, setSpaces] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [savedSpaces, setSavedSpaces] = useState([])
  const [savingSpace, setSavingSpace] = useState(null)

  const { lang: locale } = useParams()

  // Map API data to component's expected structure
  const mapSpaceData = workspace => {
    if (process.env.NODE_ENV !== 'production') {
      console.log('SpacesList: Mapping workspace:', {
        id: workspace.id,
        type: workspace.type,
        business_name: workspace.business_name,
        is_active: workspace.is_active,
        coworking: workspace.coworking,
        studio: workspace.studio
      })
    }

    return {
      id: workspace.id,
      title: workspace.business_name,
      type: workspace.type.charAt(0).toUpperCase() + workspace.type.slice(1),
      location: workspace.location,
      is_active: !!workspace.is_active, // Handle boolean true/false
      image: constructWorkspaceImageUrl(workspace.picture),
      pricing:
        workspace.type === 'studio'
          ? {
              perHour: workspace.studio?.price_per_hour ?? 'N/A',
              perDay: workspace.studio?.price_per_day ?? 'N/A'
            }
          : {
              perDay: workspace.coworking?.price_per_day ?? 'N/A',
              perMonth: workspace.coworking?.price_per_month ?? 'N/A'
            }
    }
  }

  // Fetch saved spaces
  const fetchSavedSpaces = async () => {
    try {
      const response = await apiClient.get('/saved-workspaces')
      const savedIds = response.data.data.map(space => space.id)

      setSavedSpaces(savedIds)
    } catch (error) {
      console.error('Failed to fetch saved spaces:', error)
    }
  }

  // Handle save/unsave
  const handleSaveSpace = async (spaceId, e) => {
    e.preventDefault() // Prevent navigation
    e.stopPropagation() // Prevent card click

    if (savingSpace === spaceId) return // Prevent multiple clicks

    setSavingSpace(spaceId)

    try {
      if (savedSpaces.includes(spaceId)) {
        // Unsave
        await apiClient.post('/saved-workspaces/unsave', {
          workspace_id: spaceId
        })
        setSavedSpaces(prev => prev.filter(id => id !== spaceId))
      } else {
        // Save
        await apiClient.post('/saved-workspaces/save', {
          workspace_id: spaceId
        })
        setSavedSpaces(prev => [...prev, spaceId])
      }
    } catch (error) {
      console.error('Failed to save/unsave space:', error)
    } finally {
      setSavingSpace(null)
    }
  }

  // Fetch spaces based on active tab
  useEffect(() => {
    const fetchSpaces = async () => {
      setLoading(true)
      setError(null)

      try {
        const spaceType = activeTab === 0 ? 'coworking' : 'studio'
        const response = await apiClient.get(`/workspaces/type/${spaceType}`)
        const workspaces = response.data.data || []

        if (process.env.NODE_ENV !== 'production') {
          console.log(`SpacesList: Fetched ${spaceType} workspaces:`, workspaces)
        }

        setSpaces(workspaces.map(mapSpaceData))

        // Fetch saved spaces after loading spaces
        await fetchSavedSpaces()
      } catch (err) {
        console.error('Error fetching spaces:', err)
        setError('Failed to load spaces. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchSpaces()
  }, [activeTab])

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue)
  }

  // Filter spaces based on search and price
  const filteredSpaces = spaces.filter(space => {
    const matchesSearch =
      space.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      space.location.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesPrice =
      priceRange === 'all' ||
      (priceRange === 'under50' && space.pricing.perDay !== 'N/A' && space.pricing.perDay < 50) ||
      (priceRange === '50to100' &&
        space.pricing.perDay !== 'N/A' &&
        space.pricing.perDay >= 50 &&
        space.pricing.perDay <= 100) ||
      (priceRange === 'over100' && space.pricing.perDay !== 'N/A' && space.pricing.perDay > 100)

    return matchesSearch && matchesPrice
  })

  return (
    <Box>
      {/* Header */}
      <Box className='mb-8'>
        <Typography variant='h4' className='font-bold mb-2'>
          Explore Spaces
        </Typography>
        <Typography variant='body1' className='text-textSecondary'>
          Find the perfect coworking space or studio for your needs
        </Typography>
      </Box>

      {/* Tabs */}
      <Box className='mb-6'>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor='primary'
          textColor='primary'
          variant='fullWidth'
          className='border-b border-divider'
        >
          <Tab label='Coworking Spaces' />
          <Tab label='Studio Spaces' />
        </Tabs>
      </Box>

      {/* Filters */}
      <Box className='mb-8 flex flex-col sm:flex-row gap-4'>
        <TextField
          placeholder='Search spaces...'
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className='flex-1'
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <Search className='text-textSecondary' size={20} />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position='end'>
                <CustomIconButton size='small' onClick={() => setSearchTerm('')}>
                  <X size={20} />
                </CustomIconButton>
              </InputAdornment>
            )
          }}
        />

        <FormControl className='min-w-[200px]'>
          <InputLabel>Price Range</InputLabel>
          <Select value={priceRange} label='Price Range' onChange={e => setPriceRange(e.target.value)}>
            <MenuItem value='all'>All Prices</MenuItem>
            <MenuItem value='under50'>Under $50/day</MenuItem>
            <MenuItem value='50to100'>$50 - $100/day</MenuItem>
            <MenuItem value='over100'>Over $100/day</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Loading and Error States */}
      {loading && (
        <Box className='flex justify-center my-8'>
          <CircularProgress />
        </Box>
      )}
      {error && (
        <Alert severity='error' className='mb-4'>
          {error}
        </Alert>
      )}

      {/* Results count */}
      {!loading && !error && (
        <Typography variant='body2' className='mb-4 text-textSecondary'>
          Showing {filteredSpaces.length} {filteredSpaces.length === 1 ? 'space' : 'spaces'}
        </Typography>
      )}

      {/* Spaces Grid */}
      {!loading && !error && (
        <Grid container spacing={4}>
          {filteredSpaces.map(space => (
            <Grid item xs={12} md={6} lg={4} key={space.id}>
              <NextLink href={`/${locale}/apps/explore/spaces/${space.id}`} passHref>
                <Card className='h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1'>
                  <Box className='relative' sx={{ height: 200, bgcolor: 'grey.200' }}>
                    <CardMedia
                      component='img'
                      height='200'
                      image={space.image}
                      alt={space.title}
                      sx={{
                        borderRadius: 1,
                        objectFit: 'cover'
                      }}
                      onError={e => {
                        console.error(`Failed to load image: ${space.image}`)
                        e.target.src = '/images/spaces/default.png'
                      }}
                    />
                    <Box className='absolute top-4 left-4 flex gap-2'>
                      <Chip
                        label={space.is_active ? 'Active' : 'Inactive'}
                        color={space.is_active ? 'success' : 'error'}
                        size='small'
                      />
                      <Tooltip title={savedSpaces.includes(space.id) ? 'Remove from favorites' : 'Save to favorites'}>
                        <CustomIconButton
                          size='small'
                          onClick={e => handleSaveSpace(space.id, e)}
                          className={`${savedSpaces.includes(space.id) ? 'bg-white text-primary' : 'bg-primary text-white'}`}
                          disabled={savingSpace === space.id}
                        >
                          {savedSpaces.includes(space.id) ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
                        </CustomIconButton>
                      </Tooltip>
                    </Box>
                  </Box>

                  <CardContent>
                    <Box className='mb-4'>
                      <Typography variant='h6' className='font-semibold mb-1'>
                        {space.title}
                      </Typography>
                      <Chip
                        label={space.type}
                        size='small'
                        color={space.type === 'Coworking' ? 'primary' : 'secondary'}
                        className='mb-2'
                      />

                      <Box className='flex items-center gap-2 mb-3 mt-2'>
                        <MapPin size={16} className='text-textSecondary' />
                        <Typography variant='body2' className='text-textSecondary'>
                          {space.location}
                        </Typography>
                      </Box>

                      <Box className='mt-4'>
                        {space.type === 'Studio' ? (
                          <>
                            <Typography variant='h6' className='font-semibold'>
                              {space.pricing.perHour !== 'N/A' ? `$${space.pricing.perHour}/hr` : 'Hourly N/A'}
                            </Typography>
                            <Typography variant='body2' className='text-textSecondary'>
                              {space.pricing.perDay !== 'N/A' ? `$${space.pricing.perDay}/day` : 'Daily N/A'}
                            </Typography>
                          </>
                        ) : (
                          <>
                            <Typography variant='h6' className='font-semibold'>
                              {space.pricing.perDay !== 'N/A' ? `$${space.pricing.perDay}/day` : 'Daily N/A'}
                            </Typography>
                            <Typography variant='body2' className='text-textSecondary'>
                              {space.pricing.perMonth !== 'N/A' ? `$${space.pricing.perMonth}/month` : 'Monthly N/A'}
                            </Typography>
                          </>
                        )}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </NextLink>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  )
}

export default SpacesList
