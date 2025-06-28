'use client'

import { useState, useEffect } from 'react'

import { MessageCircle, Share2, Bookmark, MapPin, Star, CheckCircle, FileText, Mail, Phone } from 'lucide-react'
import { Box, Button, Chip, Tooltip, Typography, Avatar, Card, Dialog, DialogContent } from '@mui/material'

import CustomIconButton from '@core/components/mui/IconButton'
import ServiceOrderForm from './ServiceOrderForm'
import apiClient from '@/libs/api'

const ProfileHeader = ({ profile }) => {
  const [orderFormOpen, setOrderFormOpen] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  console.log('ProfileHeader: Profile data:', profile)

  // Check if provider is saved
  useEffect(() => {
    const checkSavedStatus = async () => {
      try {
        const response = await apiClient.post('/saved-service-providers/is-saved', {
          service_provider_id: profile.id
        })

        setIsSaved(response.data.is_saved)
      } catch (error) {
        console.error('Failed to check saved status:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkSavedStatus()
  }, [profile.id])

  const handleOpenOrderForm = () => {
    setOrderFormOpen(true)
  }

  const handleCloseOrderForm = () => {
    setOrderFormOpen(false)
  }

  const handleSaveProvider = async () => {
    try {
      if (isSaved) {
        // Unsave
        await apiClient.post('/saved-service-providers/unsave', {
          service_provider_id: profile.id
        })
      } else {
        // Save
        await apiClient.post('/saved-service-providers/save', {
          service_provider_id: profile.id
        })
      }

      setIsSaved(!isSaved)
    } catch (error) {
      console.error('Failed to save/unsave provider:', error)
    }
  }

  return (
    <Card className='mb-6 overflow-hidden'>
      {/* Banner */}
      <Box className='h-40 md:h-64 w-full relative bg-gradient-to-r from-primary-600 to-primary-800'>
        {/* Featured chip */}
        {profile.featured && (
          <Chip
            label='Featured'
            color='primary'
            size='small'
            className='absolute top-4 left-4 z-10'
            sx={{ backgroundColor: 'primary.main', color: 'white' }}
          />
        )}

        {/* Action buttons */}
        <Box className='absolute top-4 right-4 flex gap-2'>
          <Tooltip title='Share profile'>
            <CustomIconButton color='inherit' variant='contained' className='bg-primary hover:bg-white'>
              <Share2 size={18} />
            </CustomIconButton>
          </Tooltip>
          <Tooltip title={isSaved ? 'Remove from favorites' : 'Save to favorites'}>
            <CustomIconButton
              color='inherit'
              variant='contained'
              className={`${isSaved ? 'bg-white text-primary' : 'bg-primary hover:bg-white'}`}
              onClick={handleSaveProvider}
              disabled={isLoading}
            >
              <Bookmark size={18} />
            </CustomIconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Profile info section */}
      <Box className='px-6 md:px-8 pt-16 pb-6 relative'>
        {/* Avatar */}
        <Avatar
          src={profile.avatar || '/images/avatars/1.png'}
          alt={profile.name}
          className='absolute -top-16 left-8 w-32 h-32 border-4 border-white shadow-lg'
          sx={{ width: 128, height: 128 }}
        />

        <Box className='md:ml-36 flex flex-col md:flex-row md:items-start md:justify-between'>
          <Box>
            {/* Name and verification */}
            <Box className='flex items-center gap-2 mb-1'>
              <Typography variant='h4' className='font-semibold'>
                {profile.name}
              </Typography>
              {profile.verified && (
                <Tooltip title='Verified Profile'>
                  <CheckCircle size={20} className='text-success' />
                </Tooltip>
              )}
            </Box>

            {/* Designation */}
            <Typography variant='h6' className='text-textSecondary mb-2'>
              {profile.designation || 'Unknown'}
            </Typography>

            {/* Contact and location */}
            <Box className='flex flex-wrap items-center gap-x-4 gap-y-2 mb-3'>
              {profile.email && (
                <Box className='flex items-center gap-1 text-textSecondary'>
                  <Mail size={16} />
                  <Typography variant='body2'>{profile.email}</Typography>
                </Box>
              )}
              {profile.phone_number && (
                <Box className='flex items-center gap-1 text-textSecondary'>
                  <Phone size={16} />
                  <Typography variant='body2'>{profile.phone_number}</Typography>
                </Box>
              )}
              {(profile.city || profile.address) && (
                <Box className='flex items-center gap-1 text-textSecondary'>
                  <MapPin size={16} />
                  <Typography variant='body2'>
                    {profile.city
                      ? `${profile.city}${profile.address ? ', ' + profile.address : ''}`
                      : profile.address || 'Unknown'}
                  </Typography>
                </Box>
              )}
              <Box className='flex items-center gap-1'>
                <Star size={16} className='text-warning' />
                <Typography variant='body2'>
                  <span className='font-medium'>{profile.rating}</span>
                  <span className='text-textSecondary'> ({profile.reviewCount} reviews)</span>
                </Typography>
              </Box>
            </Box>

            {/* Skills/chips */}
            <Box className='flex flex-wrap gap-2 mt-2'>
              {Array.isArray(profile.chips) && profile.chips.length > 0 ? (
                profile.chips.map((chip, index) => (
                  <Chip
                    key={index}
                    label={chip.title}
                    color={chip.color}
                    size='small'
                    variant='outlined'
                    className='transition-all hover:scale-105'
                  />
                ))
              ) : (
                <Typography variant='body2' className='text-textSecondary'>
                  No skills listed
                </Typography>
              )}
            </Box>
          </Box>

          {/* Action buttons */}
          <Box className='flex gap-3 mt-4 md:mt-0'>
            <Button
              variant='contained'
              color='primary'
              startIcon={<FileText size={18} />}
              className='shadow-md'
              onClick={handleOpenOrderForm}
            >
              Order Service
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Stats bar */}
      <Box className='grid grid-cols-3 border-t border-divider bg-background'>
        <Box className='py-4 px-2 text-center border-r border-divider'>
          <Typography variant='h6' className='font-semibold'>
            {profile.completedProjects}
          </Typography>
          <Typography variant='body2' className='text-textSecondary'>
            Projects
          </Typography>
        </Box>
        <Box className='py-4 px-2 text-center border-r border-divider'>
          <Typography variant='h6' className='font-semibold'>
            ${profile.startingPrice}
          </Typography>
          <Typography variant='body2' className='text-textSecondary'>
            Starting Price
          </Typography>
        </Box>
        <Box className='py-4 px-2 text-center'>
          <Typography variant='h6' className='font-semibold'>
            {profile.memberSince}
          </Typography>
          <Typography variant='body2' className='text-textSecondary'>
            Member Since
          </Typography>
        </Box>
      </Box>

      {/* Service Order Dialog */}
      <Dialog open={orderFormOpen} onClose={handleCloseOrderForm} maxWidth='md' fullWidth>
        <DialogContent sx={{ p: 0 }}>
          <ServiceOrderForm provider={profile} />
        </DialogContent>
      </Dialog>
    </Card>
  )
}

export default ProfileHeader
