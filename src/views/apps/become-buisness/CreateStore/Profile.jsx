'use client'

// React Imports
import { useState, useEffect, useCallback } from 'react'

// Next Imports
import { useSession } from 'next-auth/react'

// MUI Imports
import Grid from '@mui/material/Grid2'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Alert from '@mui/material/Alert'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'

// API Imports
import apiClient from '@/libs/api'

// Initial form data
const initialData = {
  businessName: '',
  description: '',
  address: '',
  domainId: '',
  type: ''
}

const Profile = () => {
  // State for form data
  const [formData, setFormData] = useState(initialData)

  // State for file input and image preview
  const [fileInput, setFileInput] = useState(null)
  const [imgSrc, setImgSrc] = useState('/images/avatars/Tannemirt.png')

  // State for loading, error, and success
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  // State for domains
  const [domains, setDomains] = useState([])
  const [domainsLoading, setDomainsLoading] = useState(true)
  const [domainsError, setDomainsError] = useState(null)

  // Get session data for user_id
  const { data: session, status } = useSession()

  // Fetch domains on mount
  useEffect(() => {
    const fetchDomains = async () => {
      setDomainsLoading(true)
      setDomainsError(null)

      try {
        const response = await apiClient.get('/domains')

        setDomains(response.data.data || []) // Adjusted for Swagger response

        if (process.env.NODE_ENV !== 'production') {
          console.log('Domains fetched:', response.data.data)
        }
      } catch (error) {
        setDomainsError('Failed to load domains. Please try again.')

        if (process.env.NODE_ENV !== 'production') {
          console.error('Failed to fetch domains:', error)
        }
      } finally {
        setDomainsLoading(false)
      }
    }

    fetchDomains()
  }, [])

  // Handler to update form data
  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    setError(null) // Clear error on input change
  }, [])

  // Handler to reset file input and image source
  const handleFileInputReset = () => {
    setFileInput(null)
    setImgSrc('/images/avatars/Tannemirt.png')
  }

  // Handler for file input change (image upload)
  const handleFileInputChange = file => {
    const { files } = file.target

    if (files && files.length !== 0) {
      // Validate file size (<2MB)
      if (files[0].size > 2 * 1024 * 1024) {
        setError('Image size must be less than 2MB')

        return
      }

      const reader = new FileReader()

      reader.onload = () => {
        setImgSrc(reader.result)
        console.log('Local image preview:', reader.result.substring(0, 50) + '...')
      }

      reader.readAsDataURL(files[0])
      setFileInput(files[0])
    }
  }

  // Handler to reset the entire form
  const handleReset = () => {
    setFormData(initialData)
    handleFileInputReset()
    setError(null)
    setSuccess(null)
  }

  // Handler for form submission to create supplier
  const handleSubmit = async e => {
    e.preventDefault()

    // Check if user is authenticated
    if (!session?.user?.accessToken || !session?.user?.id) {
      setError('You must be logged in to create a store')

      return
    }

    // Validate required fields
    const { businessName, description, address, domainId, type } = formData

    if (!businessName || !description || !address || !domainId || !type) {
      setError('All required fields (Store name, Description, Address, Domain, Type) must be filled')

      return
    }

    setLoading(true)
    setError(null)

    try {
      // Prepare FormData for multipart/form-data request
      const formDataToSend = new FormData()

      formDataToSend.append('user_id', session.user.id)
      formDataToSend.append('business_name', businessName.trim())
      formDataToSend.append('description', description)
      formDataToSend.append('address', address)
      formDataToSend.append('domain_id', domainId)
      formDataToSend.append('type', type)

      if (fileInput) {
        formDataToSend.append('picture', fileInput)
      }

      // Log form data for debugging (in development)
      if (process.env.NODE_ENV !== 'production') {
        console.log('Sending supplier data:', {
          user_id: session.user.id,
          business_name: formDataToSend.get('business_name'),
          description: formDataToSend.get('description'),
          address: formDataToSend.get('address'),
          domain_id: formDataToSend.get('domain_id'),
          type: formDataToSend.get('type'),
          picture: formDataToSend.get('picture') ? 'File present' : 'No file'
        })
      }

      // Send create supplier request to API
      const response = await apiClient.post('/suppliers', formDataToSend)

      // Log API response (in development)
      if (process.env.NODE_ENV !== 'production') {
        console.log('Supplier creation API response:', response.data)
      }

      // Show success message
      setSuccess('Store created successfully')
      setTimeout(() => setSuccess(null), 3000)

      // Reset form
      setFormData(initialData)
      handleFileInputReset()
    } catch (error) {
      // Log error (in development)
      if (process.env.NODE_ENV !== 'production') {
        console.error('Failed to create supplier:', error)
      }

      // Extract validation errors if available
      const errorMessage =
        error.response?.status === 422
          ? error.response.data.errors
            ? Object.values(error.response.data.errors).flat().join(', ')
            : error.response.data.message || 'Validation failed'
          : 'Failed to create store'

      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Loading state UI (domains or session)
  if (status === 'loading' || domainsLoading) {
    return (
      <Card>
        <CardContent className='flex justify-center items-center p-6'>
          <CircularProgress />
          <Typography className='ml-2'>Loading...</Typography>
        </CardContent>
      </Card>
    )
  }

  // Unauthenticated state UI
  if (status === 'unauthenticated') {
    return (
      <Card>
        <CardContent>
          <Alert severity='warning'>Please log in to create a store.</Alert>
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
      <CardHeader title='Store creation' />
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
          <img height={100} width={100} className='rounded' src={imgSrc} alt='Profile' />
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
            <Grid size={{ xs: 12, md: 6 }}>
              <CustomTextField
                fullWidth
                label='Store name'
                placeholder='Tech Shop'
                value={formData.businessName}
                onChange={e => handleInputChange('businessName', e.target.value)}
                disabled={loading}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <CustomTextField
                fullWidth
                label='Address'
                placeholder='123 Main St, City'
                value={formData.address}
                onChange={e => handleInputChange('address', e.target.value)}
                disabled={loading}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <CustomTextField
                select
                fullWidth
                label='Domain'
                value={formData.domainId}
                onChange={e => handleInputChange('domainId', e.target.value)}
                disabled={loading || domains.length === 0}
              >
                {domains.map(domain => (
                  <MenuItem key={domain.id} value={domain.id}>
                    {domain.name}
                  </MenuItem>
                ))}
              </CustomTextField>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <CustomTextField
                select
                fullWidth
                label='Type'
                value={formData.type}
                onChange={e => handleInputChange('type', e.target.value)}
                disabled={loading}
              >
                <MenuItem value='workshop'>Workshop</MenuItem>
                <MenuItem value='importer'>Importer</MenuItem>
                <MenuItem value='merchant'>Merchant</MenuItem>
              </CustomTextField>
            </Grid>
            <Grid size={{ xs: 12 }}>
              <CustomTextField
                fullWidth
                label='Description'
                placeholder='Electronics and repair services'
                value={formData.description}
                onChange={e => handleInputChange('description', e.target.value)}
                disabled={loading}
                multiline
                minRows={4}
              />
            </Grid>
            <Grid size={{ xs: 12 }} className='flex gap-4 flex-wrap'>
              <Button variant='contained' type='submit' disabled={loading || domains.length === 0}>
                {loading ? 'Creating...' : 'Create'}
              </Button>
              <Button variant='tonal' color='secondary' onClick={handleReset} disabled={loading}>
                Reset
              </Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  )
}

export default Profile
