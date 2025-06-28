'use client'

// React Imports
import { useState, useEffect, useCallback } from 'react'

// Next Imports
import { useRouter, useParams } from 'next/navigation'

import { useSession } from 'next-auth/react'

// MUI Imports
import Grid from '@mui/material/Grid2'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import MenuItem from '@mui/material/MenuItem'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'

// API Imports
import apiClient from '@/libs/api'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

// Base URL for static files (e.g., images)
const STORAGE_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

// Initial form data
const initialData = {
  businessName: '',
  description: '',
  address: '',
  domainId: '',
  type: '',
  picture: ''
}

/**
 * UpdateStore component for updating an existing store
 */
const UpdateStore = ({ storeId }) => {
  // States
  const [formData, setFormData] = useState(initialData)
  const [originalData, setOriginalData] = useState(initialData)
  const [fileInput, setFileInput] = useState(null)
  const [imgSrc, setImgSrc] = useState('/images/avatars/Tannemirt.png')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [domains, setDomains] = useState([])
  const [domainsLoading, setDomainsLoading] = useState(true)
  const [domainsError, setDomainsError] = useState(null)
  const [openConfirm, setOpenConfirm] = useState(false)
  const [isFormChanged, setIsFormChanged] = useState(false)

  // Hooks
  const { data: session, status } = useSession()
  const router = useRouter()
  const { lang: locale } = useParams()

  // Log for debugging (development only)
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.log('UpdateStore mounted:', { storeId, sessionStatus: status })
    }
  }, [storeId, status])

  // Redirect to login if unauthenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push(getLocalizedUrl('/login', locale))
    }
  }, [status, router, locale])

  // Validate ID
  useEffect(() => {
    if (!storeId || isNaN(storeId)) {
      setError('Invalid store ID')
      setLoading(false)
    }
  }, [storeId])

  // Check if form has changed
  useEffect(() => {
    const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalData) || fileInput !== null

    setIsFormChanged(hasChanges)

    if (process.env.NODE_ENV !== 'production' && hasChanges) {
      console.log('Form changed:', {
        formData,
        originalData,
        fileInput: fileInput ? 'Image selected' : 'No image'
      })
    }
  }, [formData, originalData, fileInput])

  // Fetch store data and domains
  useEffect(() => {
    let isMounted = true

    const fetchStore = async () => {
      if (!storeId || isNaN(storeId)) return

      try {
        if (process.env.NODE_ENV !== 'production') {
          console.log('Fetching store data for ID:', storeId)
        }

        const storeResponse = await apiClient.get(`/suppliers/${storeId}`)

        if (isMounted) {
          const storeData = storeResponse.data.data

          const newData = {
            businessName: storeData.business_name || '',
            description: storeData.description || '',
            address: storeData.address || '',
            domainId: storeData.domain_id || '',
            type: storeData.type || '',
            picture: storeData.picture || ''
          }

          setFormData(newData)
          setOriginalData(newData)

          const newImgSrc = storeData.picture
            ? `${STORAGE_BASE_URL}/storage/${storeData.picture}`
            : '/images/avatars/Tannemirt.png'

          setImgSrc(newImgSrc)

          if (process.env.NODE_ENV !== 'production') {
            console.log('Store data fetched:', storeData)
            console.log('Image source set to:', newImgSrc)
          }
        }
      } catch (error) {
        if (isMounted) {
          const errorMessage =
            error.response?.status === 404
              ? 'Store not found'
              : error.response?.data?.message || 'Failed to load store data'

          setError(errorMessage)

          if (process.env.NODE_ENV !== 'production') {
            console.error('Failed to fetch store:', error.response?.data || error)
          }
        }
      }
    }

    const fetchDomains = async () => {
      try {
        if (process.env.NODE_ENV !== 'production') {
          console.log('Fetching domains')
        }

        const domainsResponse = await apiClient.get('/domains')

        if (isMounted) {
          setDomains(domainsResponse.data.data || [])

          if (process.env.NODE_ENV !== 'production') {
            console.log('Domains fetched:', domainsResponse.data.data)
          }
        }
      } catch (error) {
        if (isMounted) {
          setDomainsError('Failed to load domains. Please try again.')

          if (process.env.NODE_ENV !== 'production') {
            console.error('Failed to fetch domains:', error.response?.data || error)
          }
        }
      } finally {
        if (isMounted) {
          setDomainsLoading(false)
        }
      }
    }

    const fetchData = async () => {
      if (!storeId || isNaN(storeId)) return
      setLoading(true)
      setError(null)
      setDomainsError(null)

      try {
        await Promise.all([fetchStore(), fetchDomains()])
      } catch (error) {
        if (isMounted) {
          setError('Failed to load data. Please try again.')

          if (process.env.NODE_ENV !== 'production') {
            console.error('Fetch data error:', error)
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    if (status === 'authenticated') {
      fetchData()
    }

    return () => {
      isMounted = false
    }
  }, [storeId, status, locale])

  // Handler for image error
  const handleImageError = useCallback(() => {
    setImgSrc('/images/avatars/Tannemirt.png')

    if (process.env.NODE_ENV !== 'production') {
      console.log('Image failed to load, using fallback')
    }
  }, [])

  // Handler to update form data
  const handleFormChange = useCallback((field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError(null)
  }, [])

  // Handler for file input change
  const handleFileInputChange = useCallback(file => {
    const { files } = file.target

    if (files && files.length !== 0) {
      if (files[0].size > 2 * 1024 * 1024) {
        setError('Image size must be less than 2MB')

        return
      }

      const reader = new FileReader()

      reader.onload = () => {
        setImgSrc(reader.result)

        if (process.env.NODE_ENV !== 'production') {
          console.log('Local image preview:', reader.result.substring(0, 50) + '...')
        }
      }

      reader.readAsDataURL(files[0])
      setFileInput(files[0])
    }
  }, [])

  // Handler for file input reset
  const handleFileInputReset = useCallback(() => {
    setFileInput(null)

    const resetImgSrc = originalData.picture
      ? `${STORAGE_BASE_URL}/storage/${originalData.picture}`
      : '/images/avatars/Tannemirt.png'

    setImgSrc(resetImgSrc)

    if (process.env.NODE_ENV !== 'production') {
      console.log('Image source after reset:', resetImgSrc)
    }
  }, [originalData.picture])

  // Handler for form reset
  const handleReset = useCallback(() => {
    setFormData(originalData)
    handleFileInputReset()
    setError(null)
    setSuccess(null)
    setIsFormChanged(false)
  }, [originalData, handleFileInputReset])

  // Handler for form submission
  const handleSubmit = async e => {
    e.preventDefault()
    setOpenConfirm(true)
  }

  // Handler for dialog key press
  const handleDialogKeyDown = e => {
    if (e.key === 'Enter') {
      e.preventDefault()
      confirmUpdate()
    }
  }

  // Confirm update handler
  const confirmUpdate = async () => {
    setOpenConfirm(false)

    if (!session?.user?.accessToken) {
      setError('You must be logged in to update the store')
      router.push(getLocalizedUrl('/login', locale))

      return
    }

    const { businessName, description, address, domainId, type } = formData

    if (!businessName || !description || !address || !domainId || !type) {
      setError('All required fields (Store name, Description, Address, Domain, Type) must be filled')

      return
    }

    setLoading(true)
    setError(null)

    try {
      const formDataToSend = new FormData()

      formDataToSend.append('business_name', businessName.trim())
      formDataToSend.append('description', description)
      formDataToSend.append('address', address)
      formDataToSend.append('domain_id', domainId)
      formDataToSend.append('type', type)

      if (fileInput) {
        formDataToSend.append('picture', fileInput)
      }

      if (process.env.NODE_ENV !== 'production') {
        console.log('Sending update data:', {
          business_name: formDataToSend.get('business_name'),
          description: formDataToSend.get('description'),
          address: formDataToSend.get('address'),
          domain_id: formDataToSend.get('domain_id'),
          type: formDataToSend.get('type'),
          picture: formDataToSend.get('picture') ? 'File present' : 'No file'
        })
      }

      // Utiliser POST au lieu de PUT, conformément à la configuration actuelle
      const response = await apiClient.post(`/suppliers/${storeId}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${session.user.accessToken}`
        }
      })

      if (process.env.NODE_ENV !== 'production') {
        console.log('Store update API response:', response.data)
      }

      setSuccess('Store updated successfully')
      setTimeout(() => setSuccess(null), 3000)

      const updatedData = response.data.data

      const newData = {
        businessName: updatedData.business_name || formData.businessName,
        description: updatedData.description || formData.description,
        address: updatedData.address || formData.address,
        domainId: updatedData.domain_id || formData.domainId,
        type: updatedData.type || formData.type,
        picture: updatedData.picture || formData.picture
      }

      setFormData(newData)
      setOriginalData(newData)

      const newImgSrc = updatedData.picture
        ? `${STORAGE_BASE_URL}/storage/${updatedData.picture}`
        : '/images/avatars/Tannemirt.png'

      setImgSrc(newImgSrc)
      setFileInput(null)
      setIsFormChanged(false)

      if (process.env.NODE_ENV !== 'production') {
        console.log('Updated data:', updatedData)
        console.log('New form data:', newData)
        console.log('Image source after update:', newImgSrc)
      }
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Failed to update store:', error.response?.data || error)
      }

      const errorMessage =
        error.response?.status === 422
          ? error.response.data.errors
            ? Object.values(error.response.data.errors).flat().join(', ')
            : error.response.data.message || 'Validation failed'
          : error.response?.status === 404
            ? 'Store not found'
            : error.response?.status === 401
              ? 'Unauthorized. Please log in again.'
              : error.response?.status === 405
                ? 'Method not allowed. Please contact support.'
                : error.response?.data?.message || 'Failed to update store'

      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Loading state UI
  if (status === 'loading' || loading) {
    return (
      <Card>
        <CardContent className='flex justify-center items-center p-6'>
          <CircularProgress />
          <Typography className='ml-2'>Loading...</Typography>
        </CardContent>
      </Card>
    )
  }

  // Error state UI
  if (error) {
    return (
      <Card>
        <CardContent>
          <Alert severity='error'>{error}</Alert>
        </CardContent>
      </Card>
    )
  }

  // Domains error state UI
  if (domainsError) {
    return (
      <Card>
        <CardContent>
          <Alert severity='error'>{domainsError}</Alert>
        </CardContent>
      </Card>
    )
  }

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
          <img
            height={100}
            width={100}
            className='rounded'
            src={imgSrc || '/placeholder.svg'}
            alt='Supplier Profile'
            onError={handleImageError}
          />
          <div className='flex flex-grow flex-col gap-4'>
            <div className='flex flex-col sm:flex-row gap-4'>
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
              <Button variant='tonal' color='secondary' onClick={handleFileInputReset}>
                Reset
              </Button>
            </div>
            <Typography>Allowed JPG or PNG. Max size of 2MB</Typography>
          </div>
        </div>
      </CardContent>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={6}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                fullWidth
                label='Store name'
                value={formData.businessName}
                placeholder='Tech Shop'
                onChange={e => handleFormChange('businessName', e.target.value)}
                disabled={loading}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                fullWidth
                label='Address'
                value={formData.address}
                placeholder='123 Main St, City'
                onChange={e => handleFormChange('address', e.target.value)}
                disabled={loading}
                required
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                select
                fullWidth
                label='Domain'
                value={formData.domainId}
                onChange={e => handleFormChange('domainId', e.target.value)}
                disabled={loading || domains.length === 0}
                required
              >
                {domains.map(domain => (
                  <MenuItem key={domain.id} value={domain.id}>
                    {domain.name}
                  </MenuItem>
                ))}
              </CustomTextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                select
                fullWidth
                label='Type'
                value={formData.type}
                onChange={e => handleFormChange('type', e.target.value)}
                disabled={loading}
                required
              >
                <MenuItem value='workshop'>Workshop</MenuItem>
                <MenuItem value='importer'>Importer</MenuItem>
                <MenuItem value='merchant'>Merchant</MenuItem>
              </CustomTextField>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <CustomTextField
                fullWidth
                multiline
                rows={4}
                label='Description'
                value={formData.description}
                placeholder='Electronics and repair services'
                onChange={e => handleFormChange('description', e.target.value)}
                disabled={loading}
                required
              />
            </Grid>
            <Grid size={{ xs: 12 }} className='flex gap-4 flex-wrap'>
              <Button variant='contained' type='submit' disabled={loading || domains.length === 0 || !isFormChanged}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button variant='tonal' color='secondary' onClick={handleReset} disabled={loading}>
                Reset
              </Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>
      <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)} onKeyDown={handleDialogKeyDown}>
        <DialogTitle>Confirm Update</DialogTitle>
        <DialogContent>Are you sure you want to update the store details?</DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirm(false)}>Cancel</Button>
          <Button onClick={confirmUpdate} variant='contained' autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  )
}

export default UpdateStore
