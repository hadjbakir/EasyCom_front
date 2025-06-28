'use client'

import Image from 'next/image'
import Link from 'next/link'

import { Box, Typography, Grid, Card, CardContent, Rating } from '@mui/material'
import { MapPin, ArrowRight } from 'lucide-react'

const STORAGE_BASE_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000').replace(/\/+$/, '')

const RelatedSpaces = ({ currentSpace, spaces, locale = 'en' }) => {
  // Guard clause for missing currentSpace or spaces
  if (!currentSpace || !Array.isArray(spaces)) {
    return (
      <Box className='mb-6'>
        <Typography variant='h6' className='font-medium mb-6'>
          Similar Spaces
        </Typography>
        <Typography variant='body1' color='textSecondary'>
          Loading similar spaces...
        </Typography>
      </Box>
    )
  }

  // Log inputs for debugging
  if (process.env.NODE_ENV !== 'production') {
    console.log('RelatedSpaces: currentSpace:', {
      id: currentSpace.id,
      business_name: currentSpace.business_name,
      type: currentSpace.type,
      location: currentSpace.location,
      is_active: currentSpace.is_active,
      coworking: currentSpace.coworking,
      studio: currentSpace.studio
    })
    console.log('RelatedSpaces: spaces:', spaces)
  }

  // Get current space price
  const currentPrice =
    currentSpace.type === 'coworking' ? currentSpace.coworking?.price_per_day : currentSpace.studio?.price_per_day

  // Calculate price range (±20%)
  const priceRange = currentPrice
    ? {
        min: currentPrice * 0.8,
        max: currentPrice * 1.2
      }
    : null

  // Filter related spaces by location OR type
  let filteredSpaces = spaces
    .filter(space => {
      // Exclude current space
      if (space.id === currentSpace.id) return false
      // Active only
      if (!space.is_active) return false
      // Match location OR type
      return space.location === currentSpace.location || space.type === currentSpace.type
    })
    .slice(0, 3) // Limit to three

  // If less than 3, fill the rest randomly from the same type (excluding current and only active)
  if (filteredSpaces.length < 3) {
    const alreadyIncludedIds = new Set(filteredSpaces.map(s => s.id))
    const candidates = spaces.filter(space =>
      space.id !== currentSpace.id &&
      space.type === currentSpace.type &&
      space.is_active &&
      !alreadyIncludedIds.has(space.id)
    )
    // Shuffle candidates
    for (let i = candidates.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[candidates[i], candidates[j]] = [candidates[j], candidates[i]]
    }
    filteredSpaces = filteredSpaces.concat(candidates.slice(0, 3 - filteredSpaces.length))
  }

  return (
    <Box className='mb-6'>
      <Box className='flex justify-between items-center mb-6'>
        <Typography variant='h6' className='font-medium'>
          Similar {currentSpace.type.charAt(0).toUpperCase() + currentSpace.type.slice(1)} Spaces
        </Typography>
        <Link href='/apps/explore/spaces'>
          <Box component='button' className='text-primary text-sm flex items-center gap-1 hover:underline'>
            View all
            <ArrowRight size={18} />
          </Box>
        </Link>
      </Box>

      <Grid container spacing={4}>
        {filteredSpaces.length === 0 ? (
          <Typography variant='body1' color='textSecondary'>
            No similar spaces found.
          </Typography>
        ) : (
          filteredSpaces.map(space => {
            // Construct image URL
            const imageUrl = space.picture
              ? space.picture.startsWith('http')
                ? space.picture
                : `${STORAGE_BASE_URL}/storage/${space.picture.replace(/^\/+/, '')}`
              : '/images/spaces/default.png'

            // Get price
            const pricePerDay =
              space.type === 'coworking' ? space.coworking?.price_per_day : space.studio?.price_per_day

            // Estimate capacity for studio
            const capacity = space.type === 'coworking' ? space.coworking?.seating_capacity : 10 // Default for studio

            return (
              <Grid item xs={12} md={4} key={space.id}>
                <Link href={`/${locale}/apps/explore/spaces/${space.id}`} passHref>
                  <Card
                    className='h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer'
                    component='article'
                    aria-label={`View details for ${space.business_name}`}
                  >
                    <Box className='relative h-48'>
                      <Image
                        src={imageUrl}
                        alt={space.business_name}
                        fill
                        className='object-cover'
                        onError={e => {
                          console.error(`Failed to load image: ${imageUrl}`, e)
                          e.target.src = '/images/spaces/default.png'
                        }}
                        onLoad={() => console.log(`Successfully loaded image: ${imageUrl}`)}
                      />
                    </Box>
                    <CardContent>
                      <Typography variant='h6' className='font-semibold mb-1'>
                        {space.business_name}
                      </Typography>
                      <Typography variant='body2' color='textSecondary' className='mb-2'>
                        {space.type.charAt(0).toUpperCase() + space.type.slice(1)} Space
                      </Typography>

                      <Box className='flex items-center gap-2 mb-3'>
                        <MapPin size={16} className='text-textSecondary' />
                        <Typography variant='body2' className='text-textSecondary'>
                          {space.location}
                        </Typography>
                      </Box>

                      <Box className='flex items-center justify-between mb-4'>
                        <Box className='flex items-center gap-1'>
                          <Rating value={space.rating || 0} precision={0.1} size='small' readOnly />
                          <Typography variant='body2' className='text-textSecondary'>
                            ({space.reviewCount || 0})
                          </Typography>
                        </Box>
                      </Box>

                      <Box className='flex items-center justify-between'>
                        <Box>
                          <Typography variant='h6' className='font-semibold'>
                            {pricePerDay ? `$${pricePerDay}` : 'N/A'}
                          </Typography>
                          <Typography variant='caption' className='text-textSecondary'>
                            per day
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Link>
              </Grid>
            )
          })
        )}
      </Grid>
    </Box>
  )
}

export default RelatedSpaces
