'use client'

// MUI Imports
import { useState, useEffect } from 'react'

import Card from '@mui/material/Card'
import CardMedia from '@mui/material/CardMedia'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'

// React Imports

// API Imports
import apiClient from '@/libs/api'

// Base URL for static files
const STORAGE_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

const UserProfileHeader = ({ data }) => {
  const [storeData, setStoreData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchStoreData = async () => {
      if (!data?.storeId) {
        setLoading(false)

        return
      }

      try {
        const response = await apiClient.get(`/suppliers/${data.storeId}`)

        setStoreData(response.data.data)

        if (process.env.NODE_ENV !== 'production') {
          console.log('Store data fetched:', response.data.data)
        }
      } catch (err) {
        console.error('Failed to fetch store data:', err)
        setError('Failed to load store data')
      } finally {
        setLoading(false)
      }
    }

    fetchStoreData()
  }, [data?.storeId])

  if (loading) {
    return (
      <Card>
        <CardContent className='flex justify-center items-center p-6'>
          <CircularProgress />
          <Typography className='ml-2'>Loading store data...</Typography>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <Alert severity='error'>{error}</Alert>
        </CardContent>
      </Card>
    )
  }

  const imageUrl = storeData?.picture
    ? `${STORAGE_BASE_URL}/storage/${storeData.picture}`
    : '/images/avatars/Tannemirt.png'

  return (
    <Card>
      <CardMedia image='/images/pages/profile-banner.png' className='bs-[250px]' />
      <CardContent className='flex gap-5 justify-center flex-col items-center md:items-end md:flex-row !pt-0 md:justify-start'>
        <div className='flex rounded-bs-md mbs-[-40px] border-[5px] mis-[-5px] border-be-0 border-backgroundPaper bg-backgroundPaper'>
          <img
            height={120}
            width={120}
            src={imageUrl || '/placeholder.svg'}
            className='rounded'
            alt={storeData?.business_name || 'Store Profile'}
            onError={e => {
              e.target.src = '/images/avatars/Tannemirt.png'

              if (process.env.NODE_ENV !== 'production') {
                console.log('Image failed to load, using fallback')
              }
            }}
          />
        </div>
        <div className='flex is-full justify-start self-end flex-col items-center gap-6 sm-gap-0 sm:flex-row sm:justify-between sm:items-end '>
          <div className='flex flex-col items-center sm:items-start gap-2'>
            <Typography variant='h4'>{storeData?.business_name || 'Store'}</Typography>
            <div className='flex flex-wrap gap-6 justify-center sm:justify-normal'>
              <div className='flex items-center gap-2'>
                <i className='tabler-palette' />
                <Typography className='font-medium'>{storeData?.type || 'Supplier'}</Typography>
              </div>
              <div className='flex items-center gap-2'>
                <i className='tabler-map-pin' />
                <Typography className='font-medium'>{storeData?.address || 'N/A'}</Typography>
              </div>
              <div className='flex items-center gap-2'>
                <i className='tabler-calendar' />
                <Typography className='font-medium'>
                  {storeData?.created_at
                    ? new Date(storeData.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
                    : 'N/A'}
                </Typography>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default UserProfileHeader
