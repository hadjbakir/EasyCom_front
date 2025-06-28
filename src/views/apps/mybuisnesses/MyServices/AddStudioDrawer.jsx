'use client'

// React Imports
import { useState, useRef, useEffect } from 'react'

import { useSession } from 'next-auth/react'

// MUI Imports
import Button from '@mui/material/Button'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Avatar from '@mui/material/Avatar'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import InputAdornment from '@mui/material/InputAdornment'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Chip from '@mui/material/Chip'

// Third-party Imports
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Upload, X } from 'lucide-react'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'
import apiClient from '@/libs/api'

// Validation schema
const studioSchema = yup.object().shape({
  businessName: yup.string().required('Business name is required'),
  phoneNumber: yup
    .string()
    .matches(/^\+?\d{10,15}$/, 'Phone number must be 10-15 digits')
    .required('Phone number is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  description: yup.string().required('Description is required'),
  address: yup.string().required('Address is required'),
  location: yup.string().required('Location is required'),
  openingHours: yup.string().required('Opening hours is required'),
  isActive: yup.boolean().required(),
  pricePerHour: yup
    .number()
    .typeError('Price must be a number')
    .positive('Price must be positive')
    .required('Price per hour is required'),
  pricePerDay: yup
    .number()
    .typeError('Price must be a number')
    .positive('Price must be positive')
    .required('Price per day is required'),
  studioServiceIds: yup.array().of(yup.number()).optional(),
  picture: yup
    .mixed()
    .nullable()
    .test(
      'fileType',
      'Only JPG or PNG files are allowed',
      value => !value || ['image/jpeg', 'image/png'].includes(value.type)
    )
    .test('fileSize', 'File size must be less than 2MB', value => !value || value.size <= 2 * 1024 * 1024)
})

const STORAGE_BASE_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000').replace(/\/+$/, '')

// Helper function to construct image URLs
const constructWorkspaceImageUrl = imagePath => {
  if (!imagePath) {
    console.log('Invalid image path:', imagePath)

    return null
  }

  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    console.log('Full URL detected:', imagePath)

    return imagePath
  }

  const cleanPath = imagePath.replace(/^\/+/, '')

  return `${STORAGE_BASE_URL}/storage/${cleanPath}`
}

const AddStudioDrawer = ({ open, handleClose, onSpaceCreated, initialData, onSpaceUpdated }) => {
  // States
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [selectedPicture, setSelectedPicture] = useState(null)
  const [picturePreviewUrl, setPicturePreviewUrl] = useState(null)
  const [openConfirm, setOpenConfirm] = useState(false)

  // Refs
  const pictureInputRef = useRef(null)

  // Session
  const { data: session } = useSession()

  // Form hook
  const {
    control,
    reset,
    handleSubmit,
    formState: { errors, isValid },
    setValue
  } = useForm({
    defaultValues: {
      businessName: '',
      phoneNumber: '',
      email: '',
      description: '',
      address: '',
      location: '',
      openingHours: '',
      isActive: true,
      pricePerHour: '',
      pricePerDay: '',
      studioServiceIds: [],
      picture: null
    },
    resolver: yupResolver(studioSchema),
    mode: 'onChange'
  })

  // Define isEdit at component level
  const isEdit = !!initialData?.id

  // Populate form with initialData for editing
  useEffect(() => {
    console.log('AddStudioDrawer - Initial Data received:', initialData)

    if (initialData) {
      setValue('businessName', initialData.business_name || '')
      setValue('phoneNumber', initialData.phone_number || '')
      setValue('email', initialData.email || '')
      setValue('description', initialData.description || '')
      setValue('address', initialData.address || '')
      setValue('location', initialData.location || '')
      setValue('openingHours', initialData.opening_hours || '')
      setValue('isActive', initialData.is_active ?? true)
      setValue('pricePerHour', initialData.studio?.price_per_hour || '')
      setValue('pricePerDay', initialData.studio?.price_per_day || '')
      setValue('studioServiceIds', initialData.studio?.services?.map(s => s.id) || [])

      // Set main picture
      if (initialData.picture) {
        const pictureUrl = constructWorkspaceImageUrl(initialData.picture)

        console.log('AddStudioDrawer - Main picture URL:', pictureUrl)
        setPicturePreviewUrl(pictureUrl)
      } else {
        setPicturePreviewUrl('/images/spaces/default-studio.jpg')
      }
    } else {
      reset()
      setPicturePreviewUrl(null)
      setSelectedPicture(null)
    }
  }, [initialData, setValue, reset])

  // Handle picture selection
  const handlePictureChange = event => {
    const file = event.target.files[0]

    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('Picture size must be less than 2MB')

        return
      }

      console.log('AddStudioDrawer - Selected picture:', file.name)
      setSelectedPicture(file)
      setValue('picture', file, { shouldValidate: true })
      const reader = new FileReader()

      reader.onloadend = () => {
        setPicturePreviewUrl(reader.result)
      }

      reader.readAsDataURL(file)
    }
  }

  // Trigger file input click
  const handlePictureClick = () => {
    pictureInputRef.current.click()
  }

  // Form submission handler
  const onSubmit = data => {
    console.log('AddStudioDrawer - Form submitted with data:', data)
    setOpenConfirm(true)
  }

  // Confirm submission
  const confirmSubmit = async data => {
    setOpenConfirm(false)
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      if (!session?.user?.id) {
        throw new Error('You must be logged in to create or update a workspace')
      }

      // Prepare FormData for workspace
      const formData = new FormData()

      formData.append('user_id', session.user.id)
      formData.append('business_name', data.businessName.trim())
      formData.append('phone_number', data.phoneNumber)
      formData.append('email', data.email)
      formData.append('location', data.location)
      formData.append('address', data.address)
      formData.append('description', data.description)
      formData.append('opening_hours', data.openingHours)
      formData.append('is_active', data.isActive ? '1' : '0')
      formData.append('price_per_hour', data.pricePerHour)
      formData.append('price_per_day', data.pricePerDay)
      formData.append('type', 'studio')

      if (data.studioServiceIds && data.studioServiceIds.length > 0) {
        data.studioServiceIds.forEach(id => formData.append('studio_service_ids[]', id))
      }

      if (selectedPicture) {
        formData.append('picture', selectedPicture)
      }

      // Log FormData
      if (process.env.NODE_ENV !== 'production') {
        console.log('AddStudioDrawer - FormData contents:', Object.fromEntries(formData))
      }

      // Create or update studio
      let response
      let workspaceId

      if (isEdit) {
        response = await apiClient.post(`/workspaces/studio/${initialData.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        workspaceId = initialData.id
      } else {
        response = await apiClient.post('/workspaces/studio/create', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        workspaceId = response.data.data.id
      }

      console.log(`AddStudioDrawer - ${isEdit ? 'Update' : 'Create'} response:`, response.data)

      // Construct new/updated space object
      const newSpace = {
        id: workspaceId,
        user_id: session.user.id,
        business_name: data.businessName,
        phone_number: data.phoneNumber,
        email: data.email,
        location: data.location,
        address: data.address,
        description: data.description,
        opening_hours: data.openingHours,
        type: 'studio',
        is_active: data.isActive,
        picture: response.data.data.picture
          ? constructWorkspaceImageUrl(response.data.data.picture)
          : '/images/spaces/default-studio.jpg',
        studio: {
          id: response.data.data.studio?.id || (isEdit ? initialData.studio?.id : Date.now()),
          price_per_hour: parseFloat(data.pricePerHour),
          price_per_day: parseFloat(data.pricePerDay),
          services: data.studioServiceIds.map(id => ({
            id,
            service: studioServices.find(s => s.id === id)?.name || `Service ${id}`
          }))
        },
        created_at: isEdit ? initialData.created_at : new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      console.log('AddStudioDrawer - Constructed newSpace:', newSpace)
      setSuccess(`Studio ${isEdit ? 'updated' : 'created'} successfully`)

      if (isEdit) {
        onSpaceUpdated(newSpace)
      } else {
        onSpaceCreated(newSpace)
      }

      reset()
      setSelectedPicture(null)
      setPicturePreviewUrl(null)
      setTimeout(() => {
        handleClose()
        setSuccess(null)
      }, 3000)
    } catch (err) {
      console.error(`AddStudioDrawer - Failed to ${isEdit ? 'update' : 'create'} studio:`, err)
      const message = err.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} studio.`
      const errors = err.response?.data?.errors || {}

      setError(`${message} ${Object.values(errors).flat().join(', ')}`)
    } finally {
      setLoading(false)
    }
  }

  // Reset form when drawer is closed
  const handleReset = () => {
    reset()
    setSelectedPicture(null)
    setPicturePreviewUrl(null)
    setError(null)
    setSuccess(null)
    setOpenConfirm(false)
    handleClose()
  }

  // Mock studio services (replace with API call if available)
  const studioServices = [
    { id: 1, name: 'Lighting Equipment' },
    { id: 2, name: 'Sound System' },
    { id: 3, name: 'Green Screen' }
  ]

  return (
    <Drawer
      open={open}
      anchor='right'
      variant='temporary'
      onClose={handleReset}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 } } }}
    >
      <div className='flex items-center justify-between p-5 pl-6'>
        <Typography variant='h5'>{isEdit ? 'Edit Studio' : 'Add New Studio'}</Typography>
        <IconButton size='small' onClick={handleReset} aria-label='Close drawer'>
          <X size={20} />
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
        <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-6'>
          {/* Picture Upload */}
          <Box className='flex flex-col items-center gap-2'>
            <Avatar
              src={picturePreviewUrl || '/images/spaces/default-studio.jpg'}
              alt='Studio Picture'
              sx={{ width: 100, height: 100, cursor: 'pointer' }}
              variant='rounded'
              onClick={handlePictureClick}
            />
            <input
              type='file'
              hidden
              ref={pictureInputRef}
              onChange={handlePictureChange}
              accept='image/png,image/jpeg'
            />
            <Button size='small' variant='outlined' onClick={handlePictureClick} startIcon={<Upload size={16} />}>
              Upload Main Picture
            </Button>
            {errors.picture && (
              <Typography variant='caption' color='error'>
                {errors.picture.message}
              </Typography>
            )}
          </Box>
          <Controller
            name='businessName'
            control={control}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                label='Business Name'
                placeholder='PhotoSnap Studio'
                error={Boolean(errors.businessName)}
                helperText={errors.businessName?.message}
              />
            )}
          />
          <Controller
            name='phoneNumber'
            control={control}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                label='Phone Number'
                placeholder='+1234567890'
                error={Boolean(errors.phoneNumber)}
                helperText={errors.phoneNumber?.message}
              />
            )}
          />
          <Controller
            name='email'
            control={control}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                label='Email'
                placeholder='contact@studio.com'
                error={Boolean(errors.email)}
                helperText={errors.email?.message}
              />
            )}
          />
          <Controller
            name='location'
            control={control}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                label='Location'
                placeholder='Downtown'
                error={Boolean(errors.location)}
                helperText={errors.location?.message}
              />
            )}
          />
          <Controller
            name='address'
            control={control}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                label='Address'
                placeholder='123 Main St'
                error={Boolean(errors.address)}
                helperText={errors.address?.message}
              />
            )}
          />
          <Controller
            name='description'
            control={control}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                multiline
                rows={3}
                label='Description'
                placeholder='Professional photography studio'
                error={Boolean(errors.description)}
                helperText={errors.description?.message}
              />
            )}
          />

          <Controller
            name='isActive'
            control={control}
            render={({ field }) => (
              <FormControlLabel control={<Checkbox {...field} checked={field.value} />} label='Active' />
            )}
          />
          <Controller
            name='pricePerHour'
            control={control}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                label='Hourly Rate'
                placeholder='50'
                type='number'
                InputProps={{
                  startAdornment: <InputAdornment position='start'>$</InputAdornment>
                }}
                error={Boolean(errors.pricePerHour)}
                helperText={errors.pricePerHour?.message}
              />
            )}
          />
          <Controller
            name='pricePerDay'
            control={control}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                label='Daily Rate'
                placeholder='200'
                type='number'
                InputProps={{
                  startAdornment: <InputAdornment position='start'>$</InputAdornment>
                }}
                error={Boolean(errors.pricePerDay)}
                helperText={errors.pricePerDay?.message}
              />
            )}
          />
          <Controller
            name='studioServiceIds'
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                multiple
                fullWidth
                value={field.value || []}
                onChange={e => field.onChange(e.target.value)}
                displayEmpty
                renderValue={selected => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.length === 0 ? (
                      <Typography color='textSecondary'>Select services</Typography>
                    ) : (
                      selected.map(value => (
                        <Chip
                          key={value}
                          label={studioServices.find(s => s.id === value)?.name || `Service ${value}`}
                          size='small'
                        />
                      ))
                    )}
                  </Box>
                )}
              >
                {studioServices.map(service => (
                  <MenuItem key={service.id} value={service.id}>
                    {service.name}
                  </MenuItem>
                ))}
              </Select>
            )}
          />
          <div className='flex items-center gap-4'>
            <Button variant='contained' type='submit' disabled={loading || !isValid}>
              {loading ? 'Submitting...' : isEdit ? 'Update' : 'Submit'}
            </Button>
            <Button variant='tonal' color='error' onClick={handleReset} disabled={loading}>
              Cancel
            </Button>
          </div>
        </form>
        <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)}>
          <DialogTitle>Confirm Studio {isEdit ? 'Update' : 'Creation'}</DialogTitle>
          <DialogContent>Are you sure you want to {isEdit ? 'update' : 'create'} this studio?</DialogContent>
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

export default AddStudioDrawer
