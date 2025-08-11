'use client'

import { useState, useEffect } from 'react'

import NextLink from 'next/link'
import { useParams } from 'next/navigation'

import Grid from '@mui/material/Grid2'
import Avatar from '@mui/material/Avatar'
import Chip from '@mui/material/Chip'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import Box from '@mui/material/Box'
import Rating from '@mui/material/Rating'
import Tooltip from '@mui/material/Tooltip'
import FormControl from '@mui/material/FormControl'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import InputLabel from '@mui/material/InputLabel'
import Badge from '@mui/material/Badge'
import { Bookmark } from '@mui/icons-material'

import OptionMenu from '@core/components/option-menu'
import CustomIconButton from '@core/components/mui/IconButton'
import apiClient from '@/libs/api'

// Base URL for static files
const STORAGE_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

const SkillProviders = () => {
  const [data, setData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [skillFilter, setSkillFilter] = useState('all')
  const [skillDomains, setSkillDomains] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  const { lang: locale } = useParams()

  // Fetch service providers and skill domains
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      setError(null)

      try {
        // Fetch skill domains
        const domainsResponse = await apiClient.get('/skill-domains')
        const domains = domainsResponse.data.data || []

        setSkillDomains(domains)

        // Fetch service providers
        const providersResponse = await apiClient.get('/service-providers')
        const providers = providersResponse.data.data || []

        console.log('Fetched service providers:', providers)
        console.log('Providers count:', providers.length)

        if (providers.length === 0) {
          console.warn('No service providers found in the API response')
        }

        // Map providers to component format
        const enrichedProviders = providers.map(provider => ({
          id: provider.id,
          name: provider.user?.full_name || `Provider ${provider.id}`,
          designation: provider.skill_domain?.name
            ? `${provider.skill_domain.name.replace(' Development', ' Developer')}`
            : 'Unknown',
          avatar:
            provider.pictures?.length > 0
              ? `${STORAGE_BASE_URL}${provider.pictures[0].picture}`
              : provider.user?.picture
                ? provider.user.picture.startsWith('/storage')
                  ? `${STORAGE_BASE_URL}${provider.user.picture}`
                  : `${STORAGE_BASE_URL}/storage${provider.user.picture}`
                : '/images/avatars/1.png',
          rating:
            provider.reviews?.length > 0
              ? provider.reviews.reduce((acc, review) => acc + review.rating, 0) / provider.reviews.length
              : 0,
          reviewCount: provider.reviews?.length || 0,
          reviews: provider.reviews || [],
          chips: [...(provider.skills?.map(skill => ({ title: skill.name, color: 'info' })) || [])],
          skillNames: provider.skills?.map(skill => skill.name) || [],
          startingPrice: provider.starting_price,
          available: true,
          featured: false,
          description: provider.description,
          skillDomainName: provider.skill_domain?.name || '',
          isSaved: false
        }))

        console.log('Enriched providers:', enrichedProviders)
        console.log('Enriched providers count:', enrichedProviders.length)

        setData(enrichedProviders)
        setFilteredData(enrichedProviders)
      } catch (error) {
        console.error('Failed to fetch data:', error)
        setError(error.response?.data?.message || 'Failed to load service providers or skill domains')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Filter data based on search and skill domain filter
  useEffect(() => {
    let result = [...data]

    if (searchTerm && searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim()
      console.log('Searching for:', searchLower)
      console.log(
        'Available data:',
        data.map(item => ({
          name: item.name,
          designation: item.designation,
          skillNames: item.skillNames
        }))
      )

      result = result.filter(
        item =>
          (item.name?.toLowerCase() || '').includes(searchLower) ||
          (item.designation?.toLowerCase() || '').includes(searchLower) ||
          (item.description?.toLowerCase() || '').includes(searchLower) ||
          item.chips?.some(chip => (chip.title?.toLowerCase() || '').includes(searchLower)) ||
          item.skillNames?.some(skill => skill.toLowerCase().includes(searchLower)) ||
          false
      )

      console.log('Filtered results:', result.length)
    }

    if (skillFilter !== 'all') {
      result = result.filter(item => (item.skillDomainName?.toLowerCase() || '') === skillFilter.toLowerCase())
    }

    setFilteredData(result)
  }, [data, searchTerm, skillFilter])

  if (error) {
    return (
      <Grid container spacing={6}>
        <Grid size={{ xs: 12 }}>
          <Typography variant='body1' align='center' color='error'>
            {error}
          </Typography>
        </Grid>
      </Grid>
    )
  }

  if (loading) {
    return (
      <Grid container spacing={6}>
        <Grid size={{ xs: 12 }}>
          <Box className='flex flex-col items-center justify-center py-12'>
            <Typography variant='body1' align='center'>
              Loading service providers...
            </Typography>
          </Box>
        </Grid>
      </Grid>
    )
  }

  return (
    <Box className='skill-providers-container'>
      {/* Search and Filter Controls */}
      <Box className='mb-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between'>
        <TextField
          placeholder='Search skill providers...'
          value={searchTerm}
          onChange={e => {
            console.log('Search input changed:', e.target.value)
            setSearchTerm(e.target.value)
          }}
          variant='outlined'
          size='small'
          className='min-w-[240px] w-full sm:w-auto'
          InputProps={{
            startAdornment: (
              <InputAdornment position='start'>
                <i className='tabler-search text-textSecondary' />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position='end'>
                <CustomIconButton size='small' onClick={() => setSearchTerm('')} className='text-textSecondary'>
                  <i className='tabler-x' />
                </CustomIconButton>
              </InputAdornment>
            )
          }}
        />
        <FormControl size='small' className='min-w-[180px] w-full sm:w-auto'>
          <InputLabel id='skill-filter-label'>Filter by skill domain</InputLabel>
          <Select
            labelId='skill-filter-label'
            value={skillFilter}
            label='Filter by skill domain'
            onChange={e => setSkillFilter(e.target.value)}
          >
            <MenuItem value='all'>All</MenuItem>
            {skillDomains.map(domain => (
              <MenuItem key={domain.id} value={domain.name}>
                {domain.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* Debug info */}
      {process.env.NODE_ENV === 'development' && (
        <Box className='mb-4 p-2 bg-gray-100 rounded text-xs'>
          <Typography variant='body2'>
            Debug: Search term: "{searchTerm}" | Total data: {data.length} | Filtered: {filteredData.length}
          </Typography>
        </Box>
      )}

      {/* Results count */}
      <Typography variant='body2' className='mb-4 text-textSecondary'>
        Showing {filteredData.length} {filteredData.length === 1 ? 'provider' : 'providers'}
      </Typography>

      {/* Provider Cards Grid */}
      <Grid container spacing={6}>
        {filteredData.length > 0 ? (
          filteredData.map((item, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item.id}>
              <Card
                className='relative transition-all duration-300 hover:shadow-lg hover:translate-y-[-4px] overflow-hidden'
                onClick={e => {
                  if (e.target.closest('button,  [role="menuitem"], [role="button"]')) {
                    e.stopPropagation()
                  }
                }}
              >
                {item.featured && (
                  <Chip label='Featured' color='primary' size='small' className='absolute top-4 left-4 z-10' />
                )}
                <Box className='absolute top-4 right-4 z-10 flex gap-2'>
                  <CustomIconButton
                    onClick={async e => {
                      e.stopPropagation()

                      try {
                        await apiClient.post('/saved-service-providers/save', {
                          service_provider_id: item.id
                        })

                        // Update local state to reflect the change
                        setData(prev => prev.map(p => (p.id === item.id ? { ...p, isSaved: true } : p)))
                      } catch (error) {
                        console.error('Failed to save provider:', error)
                      }
                    }}
                    className='text-gray-500 hover:text-blue-500 bg-white/80 hover:bg-white'
                  >
                    <Bookmark className='h-5 w-5' />
                  </CustomIconButton>
                </Box>
                <NextLink href={`/${locale}/apps/explore/skills/${item.id}`} passHref>
                  <CardContent className='flex flex-col items-center p-6'>
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
                        src={item.avatar}
                        className='w-24 h-24 border-4 border-solid border-background shadow-md'
                      />
                    </Badge>
                    <Box className='flex flex-col items-center text-center mt-4 mb-2'>
                      <Typography variant='h5' className='font-semibold'>
                        {item.name}
                      </Typography>
                      <Typography variant='body2' color='textSecondary' className='mt-1'>
                        {item.designation}
                      </Typography>
                      <Box className='flex items-center gap-1 mt-2'>
                        <Rating value={item.rating} precision={0.1} size='small' readOnly />
                        <Typography variant='body2' color='textSecondary'>
                          ({item.reviewCount} reviews)
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant='body2' color='textSecondary' className='text-center mt-2 line-clamp-2'>
                      {item.description}
                    </Typography>
                    <Box className='flex flex-wrap gap-2 mt-4 justify-center'>
                      {item.chips.map((chip, index) => (
                        <Chip key={index} label={chip.title} color={chip.color} size='small' />
                      ))}
                      <Chip label={`From ${item.startingPrice} DZ`} color='default' size='small' variant='outlined' />
                    </Box>
                  </CardContent>
                </NextLink>
              </Card>
            </Grid>
          ))
        ) : (
          <Grid size={{ xs: 12 }}>
            <Box className='flex flex-col items-center justify-center py-12'>
              <i className='tabler-search-off text-6xl text-textDisabled mb-4' />
              <Typography variant='h6' align='center'>
                No skill providers found
              </Typography>
              <Typography variant='body2' align='center' className='text-textSecondary mt-1'>
                Try adjusting your search or filter criteria
              </Typography>
              <Button
                variant='tonal'
                color='primary'
                className='mt-4'
                onClick={() => {
                  setSearchTerm('')
                  setSkillFilter('all')
                }}
              >
                Clear filters
              </Button>
            </Box>
          </Grid>
        )}
      </Grid>
    </Box>
  )
}

export default SkillProviders
