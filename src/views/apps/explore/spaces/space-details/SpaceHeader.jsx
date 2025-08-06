'use client'

import { useState, useEffect } from 'react'

import { Box, Card, CardContent, Typography, Chip, IconButton, CardMedia } from '@mui/material'
import { MapPin, Star, CheckCircle, Share2, Bookmark, BookmarkCheck, Phone, Mail } from 'lucide-react'

import CustomIconButton from '@core/components/mui/IconButton'
import apiClient from '@/libs/api'

const STORAGE_BASE_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000').replace(/\/+$/, '')

const SpaceHeader = ({ space }) => {
  const [isSaved, setIsSaved] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Check if space is saved
  useEffect(() => {
    const checkSavedStatus = async () => {
      try {
        const response = await apiClient.post('/saved-workspaces/is-saved', {
          workspace_id: space.id
        })

        setIsSaved(response.data.is_saved)
      } catch (error) {
        console.error('Failed to check saved status:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkSavedStatus()
  }, [space.id])

  const handleSaveSpace = async () => {
    try {
      if (isSaved) {
        // Unsave
        await apiClient.post('/saved-workspaces/unsave', {
          workspace_id: space.id
        })
      } else {
        // Save
        await apiClient.post('/saved-workspaces/save', {
          workspace_id: space.id
        })
      }

      setIsSaved(!isSaved)
    } catch (error) {
      console.error('Failed to save/unsave space:', error)
    }
  }

  // Log incoming space data for debugging
  if (process.env.NODE_ENV !== 'production') {
    console.log('SpaceHeader received space:', {
      id: space.id,
      business_name: space.business_name,
      type: space.type,
      picture: space.picture,
      address: space.address,
      location: space.location,
      phone_number: space.phone_number,
      email: space.email,
      rating: space.rating,
      reviewCount: space.reviewCount,
      featured: space.featured,
      verified: space.verified,
      is_active: space.is_active,
      studio: space.studio,
      coworking: space.coworking
    })
  }

  // Construct image URL
  const imageUrl = space.picture
    ? space.picture.startsWith('http')
      ? space.picture
      : `${STORAGE_BASE_URL}/storage/${space.picture.replace(/^\/+/, '')}`
    : '/images/spaces/default.png'

  return (
    <Card className='mb-6'>
      {/* Single Image */}
      <Box className='relative h-[400px]'>
        <CardMedia
          component='img'
          height='400'
          image={imageUrl}
          alt={space.business_name || 'Space'}
          sx={{
            borderRadius: 1,
            objectFit: 'cover',
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%'
          }}
          onError={e => {
            console.error(`Failed to load image: ${imageUrl}`, e)
            e.target.src = '/images/spaces/default.png'
          }}
          onLoad={() => console.log(`Successfully loaded image: ${imageUrl}`)}
        />

        {/* Featured and Active badges */}
        <Box className='absolute top-4 left-4 flex flex-col gap-2'>
          {space.featured && <Chip label='Featured' color='primary' />}
          <Chip label={space.is_active ? 'Active' : 'Inactive'} color={space.is_active ? 'success' : 'error'} />
        </Box>

        {/* Action buttons */}
        <Box className='absolute top-4 right-4 flex gap-2'>
          <CustomIconButton color='inherit' variant='contained' className='bg-primary hover:bg-white' title='Share'>
            <Share2 size={18} />
          </CustomIconButton>
          <CustomIconButton
            color='inherit'
            variant='contained'
            className={`${isSaved ? 'bg-white text-primary' : 'bg-primary hover:bg-white'}`}
            onClick={handleSaveSpace}
            disabled={isLoading}
            title={isSaved ? 'Remove from favorites' : 'Save to favorites'}
          >
            {isSaved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
          </CustomIconButton>
        </Box>
      </Box>

      <CardContent>
        <Box className='flex flex-col md:flex-row md:items-start md:justify-between gap-6'>
          {/* Left side - Space info */}
          <Box className='flex-1'>
            <Box className='flex items-center gap-2 mb-2'>
              <Typography variant='h4' className='font-bold'>
                {space.business_name || 'Untitled Space'}
              </Typography>
              {space.verified && <CheckCircle className='text-success' size={24} />}
            </Box>

            <Typography variant='h6' color='textSecondary' className='mb-4'>
              {space.type.charAt(0).toUpperCase() + space.type.slice(1)} Space
            </Typography>

            <Box className='flex flex-wrap items-center gap-4 mb-4'>
              <Box className='flex items-center gap-1'>
                <MapPin size={18} className='text-textSecondary' />
                <Typography variant='body2'>
                  {space.address}, {space.location}
                </Typography>
              </Box>
              <Box className='flex items-center gap-1'>
                <Phone size={18} className='text-textSecondary' />
                <Typography variant='body2'>{space.phone_number || 'N/A'}</Typography>
              </Box>
              <Box className='flex items-center gap-1'>
                <Mail size={18} className='text-textSecondary' />
                <Typography variant='body2'>{space.email || 'N/A'}</Typography>
              </Box>
              <Box className='flex items-center gap-1'>
                <Star size={18} className='text-warning' />
                <Typography variant='body2'>
                  <span className='font-medium'>{space.rating || 'N/A'}</span>
                  <span className='text-textSecondary'> ({space.reviewCount || 0} reviews)</span>
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Right side - Pricing */}
          <Box className='bg-background rounded-lg p-6 min-w-[300px]'>
            {space.type === 'studio' ? (
              <>
                <Box className='mb-4'>
                  <Typography variant='h4' className='font-bold mb-1'>
                    {space.studio?.price_per_hour ? `${space.studio.price_per_hour}` : 'N/A'}
                  </Typography>
                  <Typography variant='body2' className='text-textSecondary'>
                    per hour
                  </Typography>
                </Box>
                <Box className='mb-4'>
                  <Typography variant='h4' className='font-bold mb-1'>
                    {space.studio?.price_per_day ? `${space.studio.price_per_day}` : 'N/A'}
                  </Typography>
                  <Typography variant='body2' className='text-textSecondary'>
                    per day
                  </Typography>
                </Box>
              </>
            ) : (
              <>
                <Box className='mb-4'>
                  <Typography variant='h4' className='font-bold mb-1'>
                    {space.coworking?.price_per_day ? `$${space.coworking.price_per_day}` : 'N/A'}
                  </Typography>
                  <Typography variant='body2' className='text-textSecondary'>
                    per day
                  </Typography>
                </Box>
                <Box className='mb-4'>
                  <Typography variant='h4' className='font-bold mb-1'>
                    {space.coworking?.price_per_month ? `$${space.coworking.price_per_month}` : 'N/A'}
                  </Typography>
                  <Typography variant='body2' className='text-textSecondary'>
                    per month
                  </Typography>
                </Box>
              </>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  )
}

export default SpaceHeader
