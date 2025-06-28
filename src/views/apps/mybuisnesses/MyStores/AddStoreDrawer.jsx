'use client'

// React Imports
import { useState, useEffect, useRef } from 'react'

// Next Imports
import { useSession } from 'next-auth/react'

// MUI Imports
import Button from '@mui/material/Button'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
import Avatar from '@mui/material/Avatar'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'

// Third-party Imports
import { useForm, Controller } from 'react-hook-form'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'

// API Imports
import apiClient from '@/libs/api'

/**
 * AddStoreDrawer component for creating a new store
 * @param {object} props - Component props
 * @param {boolean} props.open - Whether the drawer is open
 * @param {function} props.handleClose - Function to close the drawer
 * @param {function} props.onStoreCreated - Callback when store is created
 */
const AddStoreDrawer = ({ open, handleClose, onStoreCreated }) => {
  // States
  const [domains, setDomains] = useState([])
  const [domainsLoading, setDomainsLoading] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [selectedImage, setSelectedImage] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [openConfirm, setOpenConfirm] = useState(false)

  // Refs
  const fileInputRef = useRef(null)

  // Session
  const { data: session } = useSession()

  // Form hook
  const {
    control,
    reset: resetForm,
    handleSubmit,
    formState: { errors, isValid }
  } = useForm({
    defaultValues: {
      businessName: '',
      description: '',
      address: '',
      domainId: '',
      type: ''
    },
    mode: 'onChange'
  })

  // Fetch domains on mount
  useEffect(() => {
    const fetchDomains = async () => {
      if (!open) return

      setDomainsLoading(true)
      setError(null)

      try {
        const response = await apiClient.get('/domains')

        setDomains(response.data.data || [])

        if (process.env.NODE_ENV !== 'production') {
          console.log('Domains fetched:', response.data.data)
        }
      } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
          console.error('Failed to fetch domains:', error)
        }

        setError('Failed to load domains. Please try again.')
      } finally {
        setDomainsLoading(false)
      }
    }

    fetchDomains()
  }, [open])

  // Handle image selection
  const handleImageChange = event => {
    const file = event.target.files[0]

    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('Image size must be less than 2MB')

        return
      }

      setSelectedImage(file)
      const reader = new FileReader()

      reader.onloadend = () => {
        setPreviewUrl(reader.result)

        if (process.env.NODE_ENV !== 'production') {
          console.log('Image preview generated')
        }
      }

      reader.readAsDataURL(file)
    }
  }

  // Trigger file input click
  const handleImageClick = () => {
    fileInputRef.current.click()
  }

  // Form submission handler
  const onSubmit = () => {
    setOpenConfirm(true)
  }

  // Confirm submission
  const confirmSubmit = async data => {
    setOpenConfirm(false)

    if (!session?.user?.accessToken || !session?.user?.id) {
      setError('You must be logged in to create a store')

      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const formData = new FormData()

      formData.append('user_id', session.user.id)
      formData.append('business_name', data.businessName.trim())
      formData.append('description', data.description)
      formData.append('address', data.address)
      formData.append('domain_id', data.domainId)
      formData.append('type', data.type)

      if (selectedImage) {
        formData.append('picture', selectedImage)
      }

      if (process.env.NODE_ENV !== 'production') {
        console.log('Creating store with data:', {
          user_id: session.user.id,
          business_name: data.businessName,
          description: data.description,
          address: data.address,
          domain_id: data.domainId,
          type: data.type,
          picture: selectedImage ? 'Image present' : 'No image'
        })
      }

      const response = await apiClient.post('/suppliers', formData)

      setSuccess('Store created successfully')

      if (onStoreCreated && response.data.data) {
        onStoreCreated(response.data.data)
      }

      resetForm({
        businessName: '',
        description: '',
        address: '',
        domainId: '',
        type: ''
      })
      setSelectedImage(null)
      setPreviewUrl(null)

      setTimeout(() => {
        handleClose()
        setSuccess(null)
      }, 1500)
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Failed to create store:', error)
      }

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

  // Reset handler
  const reset = () => {
    resetForm({
      businessName: '',
      description: '',
      address: '',
      domainId: '',
      type: ''
    })
    setSelectedImage(null)
    setPreviewUrl(null)
    setError(null)
    setSuccess(null)
    setOpenConfirm(false)
    handleClose()
  }

  // Handle dialog key press
  const handleDialogKeyDown = e => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSubmit(confirmSubmit)()
    }
  }

  return (
    <Drawer
      open={open}
      anchor='right'
      variant='temporary'
      onClose={reset}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 } } }}
    >
      <div className='flex items-center justify-between plb-5 pli-6'>
        <Typography variant='h5'>Add New Store</Typography>
        <IconButton size='small' onClick={reset} aria-label='Close drawer'>
          <i className='tabler-x text-2xl text-textPrimary' />
        </IconButton>
      </div>
      <Divider />
      <div className='p-6'>
        {error && (
          <Alert severity='error' className='mb-4'>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity='success' className='mb-4'>
            {success}
          </Alert>
        )}
        {domainsLoading ? (
          <div className='flex justify-center items-center p-4'>
            <CircularProgress size={30} />
            <Typography className='ml-2'>Loading domains...</Typography>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-6'>
            {/* Image Upload */}
            <Box className='flex flex-col items-center gap-2'>
              <Avatar
                src={previewUrl || '/images/avatars/Tannemirt.png'}
                alt='Store Image'
                sx={{ width: 100, height: 100, cursor: 'pointer' }}
                variant='rounded'
                onClick={handleImageClick}
                imgProps={{
                  onError: e => {
                    e.target.src = '/images/avatars/Tannemirt.png'

                    if (process.env.NODE_ENV !== 'production') {
                      console.log('Image failed to load, using fallback')
                    }
                  }
                }}
              />
              <input type='file' hidden ref={fileInputRef} onChange={handleImageChange} accept='image/png,image/jpeg' />
              <Button
                size='small'
                variant='outlined'
                onClick={handleImageClick}
                startIcon={<i className='tabler-upload' />}
              >
                Upload Image
              </Button>
            </Box>

            <Controller
              name='businessName'
              control={control}
              rules={{ required: 'Store Name is required' }}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label='Store Name'
                  placeholder='Tech Shop'
                  {...(errors.businessName && { error: true, helperText: errors.businessName.message })}
                />
              )}
            />
            <Controller
              name='description'
              control={control}
              rules={{ required: 'Description is required' }}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  multiline
                  rows={4}
                  label='Description'
                  placeholder='Electronics and repair services'
                  {...(errors.description && { error: true, helperText: errors.description.message })}
                />
              )}
            />
            <Controller
              name='address'
              control={control}
              rules={{ required: 'Address is required' }}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label='Address'
                  placeholder='123 Main St, City'
                  {...(errors.address && { error: true, helperText: errors.address.message })}
                />
              )}
            />
            <Controller
              name='domainId'
              control={control}
              rules={{ required: 'Domain is required' }}
              render={({ field }) => (
                <CustomTextField
                  select
                  fullWidth
                  label='Domain'
                  {...field}
                  {...(errors.domainId && { error: true, helperText: errors.domainId.message })}
                  disabled={domains.length === 0}
                >
                  <MenuItem value='' disabled>
                    Select Domain
                  </MenuItem>
                  {domains.map(domain => (
                    <MenuItem key={domain.id} value={domain.id.toString()}>
                      {domain.name}
                    </MenuItem>
                  ))}
                </CustomTextField>
              )}
            />
            <Controller
              name='type'
              control={control}
              rules={{ required: 'Type is required' }}
              render={({ field }) => (
                <CustomTextField
                  select
                  fullWidth
                  label='Type'
                  {...field}
                  {...(errors.type && { error: true, helperText: errors.type.message })}
                >
                  <MenuItem value='' disabled>
                    Select Type
                  </MenuItem>
                  <MenuItem value='workshop'>Workshop</MenuItem>
                  <MenuItem value='importer'>Importer</MenuItem>
                  <MenuItem value='merchant'>Merchant</MenuItem>
                </CustomTextField>
              )}
            />
            <div className='flex items-center gap-4'>
              <Button variant='contained' type='submit' disabled={loading || !isValid}>
                {loading ? 'Creating...' : 'Submit'}
              </Button>
              <Button variant='tonal' color='error' onClick={reset} disabled={loading}>
                Cancel
              </Button>
            </div>
          </form>
        )}
        <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)} onKeyDown={handleDialogKeyDown}>
          <DialogTitle>Confirm Store Creation</DialogTitle>
          <DialogContent>Are you sure you want to create this store?</DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenConfirm(false)}>Cancel</Button>
            <Button onClick={handleSubmit(confirmSubmit)} variant='contained' autoFocus>
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </Drawer>
  )
}

export default AddStoreDrawer
