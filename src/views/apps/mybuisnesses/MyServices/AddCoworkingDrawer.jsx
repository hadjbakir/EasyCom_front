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

// Third-party Imports
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Upload, X } from 'lucide-react'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'
import apiClient from '@/libs/api'

// Validation schema
const coworkingSchema = yup.object().shape({
  businessName: yup.string().required('Business name is required'),
  phoneNumber: yup
    .string()
    .matches(/^\+?\d{10,15}$/, 'Phone number must be 10-15 digits')
    .required('Phone number is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  location: yup.string().required('Location is required'),
  address: yup.string().required('Address is required'),
  description: yup.string().required('Description is required'),
  openingHours: yup.string().required('Opening hours is required'),
  isActive: yup.boolean().required(),
  pricePerDay: yup
    .number()
    .typeError('Price must be a number')
    .positive('Price must be positive')
    .required('Price per day is required'),
  pricePerMonth: yup
    .number()
    .typeError('Price must be a number')
    .positive('Price must be positive')
    .required('Price per month is required'),
  seatingCapacity: yup
    .number()
    .typeError('Capacity must be a number')
    .positive('Capacity must be positive')
    .integer('Capacity must be an integer')
    .required('Seating capacity is required'),
  meetingRooms: yup
    .number()
    .typeError('Meeting rooms must be a number')
    .min(0, 'Meeting rooms cannot be negative')
    .integer('Meeting rooms must be an integer')
    .required('Number of meeting rooms is required'),
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
    return imagePath
  }

  const cleanPath = imagePath.replace(/^\/+/, '')

  return `${STORAGE_BASE_URL}/storage/${cleanPath}`
}

const AddCoworkingDrawer = ({ open, handleClose, onSpaceCreated, initialData, onSpaceUpdated }) => {
  console.log('AddCoworkingDrawer rendered with initialData:', initialData)

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
      location: '',
      address: '',
      description: '',
      openingHours: '',
      isActive: true,
      pricePerDay: '',
      pricePerMonth: '',
      seatingCapacity: '',
      meetingRooms: '',
      picture: null
    },
    resolver: yupResolver(coworkingSchema),
    mode: 'onChange'
  })

  // Define isEdit at component level
  const isEdit = !!initialData?.id

  // Initialize form with initialData if provided
  useEffect(() => {
    if (initialData) {
      reset({
        businessName: initialData.business_name || '',
        phoneNumber: initialData.phone_number || '',
        email: initialData.email || '',
        location: initialData.location || '',
        address: initialData.address || '',
        description: initialData.description || '',
        openingHours: initialData.opening_hours || '',
        isActive: initialData.is_active ?? true,
        pricePerDay: initialData.coworking?.price_per_day || '',
        pricePerMonth: initialData.coworking?.price_per_month || '',
        seatingCapacity: initialData.coworking?.seating_capacity || '',
        meetingRooms: initialData.coworking?.meeting_rooms || ''
      })

      // Set main picture preview
      if (initialData.picture) {
        setPicturePreviewUrl(constructWorkspaceImageUrl(initialData.picture))
      } else {
        setPicturePreviewUrl(null)
      }
    } else {
      reset()
      setPicturePreviewUrl(null)
      setSelectedPicture(null)
    }
  }, [initialData, reset, setValue])

  // Handle picture selection
  const handlePictureChange = event => {
    const file = event.target.files[0]

    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('Picture size must be less than 2MB')

        return
      }

      console.log('AddCoworkingDrawer - Selected picture:', file.name)
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
    console.log('AddCoworkingDrawer - Form submitted with data:', data)
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
      formData.append('price_per_day', data.pricePerDay)
      formData.append('price_per_month', data.pricePerMonth)
      formData.append('seating_capacity', data.seatingCapacity)
      formData.append('meeting_rooms', data.meetingRooms)
      formData.append('type', 'coworking')

      if (selectedPicture) {
        formData.append('picture', selectedPicture)
      }

      // Log FormData for debugging
      if (process.env.NODE_ENV !== 'production') {
        console.log('AddCoworkingDrawer - FormData contents:', Object.fromEntries(formData))
      }

      // Create or update coworking space
      let response
      let workspaceId

      if (isEdit) {
        response = await apiClient.post(`/workspaces/coworking/${initialData.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        workspaceId = initialData.id
      } else {
        response = await apiClient.post('/workspaces/coworking/create', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        workspaceId = response.data.data.id
      }

      if (process.env.NODE_ENV !== 'production') {
        console.log(`AddCoworkingDrawer - ${isEdit ? 'Update' : 'Create'} response:`, response.data)
      }

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
        type: 'coworking',
        is_active: data.isActive,
        picture: response.data.data.picture
          ? constructWorkspaceImageUrl(response.data.data.picture)
          : initialData?.picture || '/images/spaces/default-coworking.jpg',
        coworking: {
          id: response.data.data.coworking?.id || (isEdit ? initialData.coworking?.id : Date.now()),
          price_per_day: parseFloat(data.pricePerDay),
          price_per_month: parseFloat(data.pricePerMonth),
          seating_capacity: parseInt(data.seatingCapacity),
          meeting_rooms: parseInt(data.meetingRooms)
        },
        created_at: isEdit ? initialData.created_at : new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      setSuccess(`Coworking space ${isEdit ? 'updated' : 'created'} successfully`)

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
      console.error(`AddCoworkingDrawer - Failed to ${isEdit ? 'update' : 'create'} coworking space:`, err)
      const message = err.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} coworking space.`
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

  return (
    <Drawer
      open={open}
      anchor='right'
      variant='temporary'
      onClose={handleReset}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 } } }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 5, pl: 6 }}>
        <Typography variant='h5'>{isEdit ? 'Edit Coworking Space' : 'Add New Coworking Space'}</Typography>
        <IconButton size='small' onClick={handleReset} aria-label='Close drawer'>
          <X size={20} />
        </IconButton>
      </Box>
      <Divider />
      <Box sx={{ p: 6 }}>
        {error && (
          <Alert severity='error' sx={{ mb: 4 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity='success' sx={{ mb: 4 }}>
            {success}
          </Alert>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-6'>
          {/* Picture Upload */}
          <Box className='flex flex-col items-center gap-2'>
            <Avatar
              src={picturePreviewUrl || '/images/spaces/default-coworking.jpg'}
              alt='Coworking Space Picture'
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
                placeholder='WorkHub Coworking'
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
                placeholder='info@workhub.com'
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
                placeholder='456 Elm St'
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
                placeholder='Modern coworking space'
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
            name='pricePerDay'
            control={control}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                label='Daily Rate'
                placeholder='25'
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
            name='pricePerMonth'
            control={control}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                label='Monthly Rate'
                placeholder='400'
                type='number'
                InputProps={{
                  startAdornment: <InputAdornment position='start'>$</InputAdornment>
                }}
                error={Boolean(errors.pricePerMonth)}
                helperText={errors.pricePerMonth?.message}
              />
            )}
          />
          <Controller
            name='seatingCapacity'
            control={control}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                label='Seating Capacity'
                placeholder='50'
                type='number'
                error={Boolean(errors.seatingCapacity)}
                helperText={errors.seatingCapacity?.message}
              />
            )}
          />
          <Controller
            name='meetingRooms'
            control={control}
            render={({ field }) => (
              <CustomTextField
                {...field}
                fullWidth
                label='Meeting Rooms'
                placeholder='3'
                type='number'
                error={Boolean(errors.meetingRooms)}
                helperText={errors.meetingRooms?.message}
              />
            )}
          />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <Button variant='contained' type='submit' disabled={loading || !isValid}>
              {loading ? 'Submitting...' : isEdit ? 'Update' : 'Submit'}
            </Button>
            <Button variant='tonal' color='error' onClick={handleReset} disabled={loading}>
              Cancel
            </Button>
          </Box>
        </form>
        <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)}>
          <DialogTitle>Confirm Coworking Space {isEdit ? 'Update' : 'Creation'}</DialogTitle>
          <DialogContent>Are you sure you want to {isEdit ? 'update' : 'create'} this coworking space?</DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenConfirm(false)}>Cancel</Button>
            <Button onClick={handleSubmit(confirmSubmit)} variant='contained' autoFocus>
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Drawer>
  )
}

export default AddCoworkingDrawer
