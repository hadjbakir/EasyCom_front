'use client'

// React Imports
import { useState, useEffect, useCallback, useRef } from 'react'

// Next Imports
import { useSession } from 'next-auth/react'

// MUI Imports
import Grid from '@mui/material/Grid2'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'

import apiClient from '@/libs/api'

// Context Imports
import { useUser } from '@/contexts/UserContext'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'

// Vars
// Base URL for API requests, defaults to localhost if not set in .env
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

// Base URL for static files (e.g., images), defaults to backend domain if not set in .env
const STORAGE_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

// Function to build image URL
const buildImageUrl = picture => {
  if (!picture) return '/images/avatars/1.png'
  if (picture.startsWith('http')) return picture

  // Nettoyer le chemin en supprimant les préfixes storage/ ou public/ et les slashes en début
  const cleanPath = picture.replace(/^(\/+)?(storage\/|public\/)?/g, '')

  return `${STORAGE_BASE_URL}/storage/${cleanPath}`
}

// Function to initialize form data from API or session response
const getInitialDataFromApi = user => {
  console.log('User data passed to getInitialDataFromApi:', user)

  return {
    fullName: user?.full_name || user?.fullName || '',
    email: user?.email || '',
    city: user?.city || '',
    phoneNumber: user?.phone_number || user?.phoneNumber?.toString() || '',
    address: user?.address || ''
  }
}

// Main component for managing account details
const AccountDetails = () => {
  // State for form data
  const [formData, setFormData] = useState(null)

  // State for file input (raw file before upload)
  const [fileInput, setFileInput] = useState(null)

  // State for image source displayed in UI
  const [imgSrc, setImgSrc] = useState('/images/avatars/1.png')

  // State for loading status
  const [loading, setLoading] = useState(true)

  // State for error messages
  const [error, setError] = useState(null)

  // State for success messages
  const [success, setSuccess] = useState(null)

  // Flag to track if form has been updated
  const [isUpdated, setIsUpdated] = useState(false)

  // Get session data and status from NextAuth
  const { data: session, status } = useSession()

  // Get user context for updating shared user data
  const { updateUser } = useUser()

  // Ref to track if initial data has been fetched
  const hasFetched = useRef(false)

  // Memoized function to update user context
  const memoizedUpdateUser = useCallback(
    newUserData => {
      console.log('Updating UserContext with:', newUserData)
      updateUser(newUserData)
    },
    [updateUser]
  )

  // Effect to initialize data on mount
  useEffect(() => {
    let isMounted = true

    // Initialize with session data immediately
    if (status === 'authenticated' && session?.user && isMounted && !hasFetched.current) {
      const initialData = getInitialDataFromApi(session.user)

      setFormData(initialData)
      const newImgSrc = buildImageUrl(session.user.picture)

      setImgSrc(newImgSrc)
      console.log('Initial image source from session:', newImgSrc)
      setLoading(false)
    }

    // Fetch data from API to ensure freshness
    const fetchUserData = async () => {
      if (status === 'authenticated' && session?.user?.accessToken && !hasFetched.current && isMounted) {
        try {
          hasFetched.current = true
          const response = await apiClient.get('/user')
          const userData = response.data.user
          const apiData = getInitialDataFromApi(userData)

          setFormData(apiData)
          const newImgSrc = buildImageUrl(userData.picture)

          setImgSrc(newImgSrc)
          console.log('Updated image source from API:', newImgSrc)
          memoizedUpdateUser({
            id: userData.id,
            fullName: userData.full_name,
            email: userData.email,
            phoneNumber: userData.phone_number,
            picture: userData.picture,
            city: userData.city,
            address: userData.address
          })
          setLoading(false)
        } catch (error) {
          console.error('Failed to fetch user data:', error)

          if (isMounted) {
            setError('Failed to load user data. Please try again.')
            setLoading(false)
          }
        }
      } else if (status === 'unauthenticated' && isMounted) {
        setLoading(false)
      }
    }

    fetchUserData()

    return () => {
      isMounted = false
    }
  }, [status, session, memoizedUpdateUser])

  // Handler to update form data when input changes
  const handleFormChange = (field, value) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value }

      console.log('Updated formData on change:', newData)

      return newData
    })
  }

  // Handler for file input change (image upload)
  const handleFileInputChange = file => {
    const { files } = file.target

    if (files && files.length !== 0) {
      const reader = new FileReader()

      reader.onload = () => {
        setImgSrc(reader.result)
        console.log('Local image preview:', reader.result.substring(0, 50) + '...')
      }

      reader.onerror = () => {
        console.error('FileReader error')
        setError('Failed to preview image')
      }

      reader.readAsDataURL(files[0])
      setFileInput(files[0])
    }
  }

  // Handler to reset file input and image source
  const handleFileInputReset = () => {
    setFileInput(null)
    const resetImgSrc = buildImageUrl(formData?.picture || session?.user?.picture)

    setImgSrc(resetImgSrc)
    console.log('Image source after reset:', resetImgSrc)
  }

  // Handler for form submission to update user data
  const handleSubmit = async e => {
    e.preventDefault()

    if (!session?.user?.accessToken) {
      setError('You must be logged in to save changes')

      return
    }

    setLoading(true)
    setError(null)

    try {
      // Prepare FormData for multipart/form-data request
      const formDataToSend = new FormData()

      formDataToSend.append('full_name', formData.fullName.trim())
      formDataToSend.append('email', formData.email)
      formDataToSend.append('phone_number', formData.phoneNumber)
      formDataToSend.append('address', formData.address)
      formDataToSend.append('city', formData.city)

      if (fileInput) {
        formDataToSend.append('picture', fileInput)
      }

      console.log('Sending data (FormData):', {
        full_name: formDataToSend.get('full_name'),
        email: formDataToSend.get('email'),
        phone_number: formDataToSend.get('phone_number'),
        address: formDataToSend.get('address'),
        city: formDataToSend.get('city'),
        picture: formDataToSend.get('picture') ? 'File present' : 'No file'
      })

      // Send update request to API
      const response = await apiClient.post('/user/update', formDataToSend)

      console.log('API response:', response.data)

      const updatedUser = response.data.user

      console.log('Processed updated user:', updatedUser)

      // Create new form data explicitly
      const newFormData = {
        fullName: updatedUser.full_name || '',
        email: updatedUser.email || '',
        phoneNumber: updatedUser.phone_number || '',
        city: updatedUser.city || '',
        address: updatedUser.address || ''
      }

      console.log('Setting new formData:', newFormData)
      setFormData(newFormData)

      // Update image source
      const newImgSrc = buildImageUrl(updatedUser.picture)

      console.log('Setting new imgSrc:', newImgSrc)
      setImgSrc(newImgSrc)

      // Update user context for UserDropdown
      memoizedUpdateUser({
        id: updatedUser.id,
        fullName: updatedUser.full_name,
        email: updatedUser.email,
        phoneNumber: updatedUser.phone_number,
        picture: updatedUser.picture,
        city: updatedUser.city,
        address: updatedUser.address
      })

      // Show success message
      setSuccess('Profile updated successfully')
      setTimeout(() => setSuccess(null), 3000)

      // Mark form as updated to prevent useEffect overrides
      setIsUpdated(true)

      // Reset file input
      setFileInput(null)
    } catch (error) {
      console.error('Failed to update user data:', error)

      const errorMessage = error.response?.data?.errors
        ? Object.values(error.response.data.errors).flat().join(', ')
        : error.response?.data?.message || 'Failed to save changes'

      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Loading state UI
  if (loading && !formData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  // Unauthenticated state UI
  if (status === 'unauthenticated') {
    return (
      <Card>
        <CardContent>
          <Alert severity='warning'>Please log in to view your account details.</Alert>
        </CardContent>
      </Card>
    )
  }

  // Main UI for account details form
  console.log('Rendering with formData:', formData, 'imgSrc:', imgSrc)

  return (
    <Card>
      <CardContent className='mbe-4'>
        {error && (
          <Alert severity='error' className='mbe-4' role='alert'>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity='success' className='mbe-4' role='alert'>
            {success}
          </Alert>
        )}
        <div className='flex max-sm:flex-col items-center gap-6'>
          {/* Display user profile image */}
          <img
            height={100}
            width={100}
            className='rounded'
            src={imgSrc}
            alt='Profile'
            onError={() => {
              console.error('Image failed to load:', imgSrc)
              setImgSrc('/images/avatars/1.png')
            }}
          />
          <div className='flex flex-grow flex-col gap-4'>
            <div className='flex flex-col sm:flex-row gap-4'>
              {/* Button to upload new photo */}
              <Button component='label' variant='contained' htmlFor='account-settings-upload-image'>
                Upload New Photo
                <input
                  hidden
                  type='file'
                  accept='image/png, image/jpeg'
                  onChange={handleFileInputChange}
                  id='account-settings-upload-image'
                />
              </Button>
              {/* Button to reset image */}
              <Button variant='tonal' color='secondary' onClick={handleFileInputReset}>
                Reset
              </Button>
            </div>
            <Typography>Allowed JPG or PNG. Max size of 2MB</Typography>
          </div>
        </div>
      </CardContent>
      <CardContent>
        {/* Form for editing account details */}
        <form onSubmit={handleSubmit}>
          <Grid container spacing={6}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                fullWidth
                label='Full Name'
                value={formData?.fullName || ''}
                placeholder='John Doe'
                onChange={e => handleFormChange('fullName', e.target.value)}
                disabled={loading}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                fullWidth
                label='Email'
                value={formData?.email || ''}
                placeholder='john.doe@gmail.com'
                onChange={e => handleFormChange('email', e.target.value)}
                disabled={loading}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                fullWidth
                label='Phone Number'
                value={formData?.phoneNumber || ''}
                placeholder='+1 (234) 567-8901'
                onChange={e => handleFormChange('phoneNumber', e.target.value)}
                disabled={loading}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                fullWidth
                label='City'
                value={formData?.city || ''}
                placeholder='Enter your city'
                onChange={e => handleFormChange('city', e.target.value)}
                disabled={loading}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                fullWidth
                label='Address'
                value={formData?.address || ''}
                placeholder='Enter your address'
                onChange={e => handleFormChange('address', e.target.value)}
                disabled={loading}
              />
            </Grid>
            <Grid size={{ xs: 12 }} className='flex gap-4 flex-wrap'>
              {/* Submit button */}
              <Button variant='contained' type='submit' disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
              {/* Reset form button */}
              <Button
                variant='tonal'
                type='reset'
                color='secondary'
                onClick={() => {
                  const resetData = getInitialDataFromApi(session?.user || {})

                  setFormData(resetData)
                  console.log('Form reset to:', resetData)
                }}
                disabled={loading}
              >
                Reset
              </Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  )
}

export default AccountDetails
