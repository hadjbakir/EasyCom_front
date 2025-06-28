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
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import InputAdornment from '@mui/material/InputAdornment'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'

// Third-party Imports
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { Upload } from 'lucide-react'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'
import apiClient from '@/libs/api'

// Validation schema
const spaceSchema = yup.object().shape({
  businessName: yup.string().required('Business name is required'),
  description: yup.string().required('Description is required'),
  location: yup.string().required('Location is required'),
  address: yup.string().required('Address is required'),
  openingHours: yup.string().required('Opening hours is required'),
  email: yup.string().email('Invalid email format').required('Email is required'),
  phone_number: yup.string().required('Phone number is required'),
  isActive: yup.boolean().required('Active status is required'),
  pricePerDay: yup
    .number()
    .typeError('Price must be a number')
    .positive('Price must be positive')
    .required('Price per day is required'),
  pricePerMonth: yup
    .number()
    .nullable()
    .transform(value => (isNaN(value) ? undefined : value))
    .when('$isCoworking', {
      is: true,
      then: schema =>
        schema
          .typeError('Price must be a number')
          .positive('Price must be positive')
          .required('Price per month is required'),
      otherwise: schema => schema.notRequired()
    }),
  seatingCapacity: yup
    .number()
    .nullable()
    .transform(value => (isNaN(value) ? undefined : value))
    .when('$isCoworking', {
      is: true,
      then: schema =>
        schema
          .typeError('Capacity must be a number')
          .positive('Capacity must be positive')
          .integer('Capacity must be an integer')
          .required('Seating capacity is required'),
      otherwise: schema => schema.notRequired()
    }),
  meetingRooms: yup
    .number()
    .nullable()
    .transform(value => (isNaN(value) ? undefined : value))
    .when('$isCoworking', {
      is: true,
      then: schema =>
        schema
          .typeError('Meeting rooms must be a number')
          .min(0, 'Meeting rooms cannot be negative')
          .integer('Meeting rooms must be an integer')
          .required('Number of meeting rooms is required'),
      otherwise: schema => schema.notRequired()
    }),
  pricePerHour: yup
    .number()
    .nullable()
    .transform(value => (isNaN(value) ? undefined : value))
    .when('$isStudio', {
      is: true,
      then: schema =>
        schema
          .typeError('Price must be a number')
          .positive('Price must be positive')
          .required('Price per hour is required'),
      otherwise: schema => schema.notRequired()
    }),
  studio_service_ids: yup
    .array()
    .of(yup.number().integer().positive())
    .when('$isStudio', {
      is: true,
      then: schema => schema.min(1, 'At least one service is required').required('Services are required'),
      otherwise: schema => schema.notRequired()
    }),
  workingHours: yup
    .array()
    .of(
      yup.object().shape({
        day: yup.number().required().min(1).max(7),
        is_open: yup.boolean().required(),
        time_from: yup.string().nullable(),
        time_to: yup.string().nullable()
      })
    )
    .notRequired()
})

const STORAGE_BASE_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000').replace(/\/+$/, '')

// Helper function to construct workspace image URLs
const constructWorkspaceImageUrl = imagePath => {
  if (!imagePath) return null

  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath
  }

  const cleanPath = imagePath.replace(/^\/+/, '')

  return `${STORAGE_BASE_URL}/storage/${cleanPath}`
}

const EditDrawer = ({ open, handleClose, onSpaceUpdated, initialData = null }) => {
  const isCoworking = initialData?.type === 'coworking'
  const isStudio = initialData?.type === 'studio'

  // States
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [openConfirm, setOpenConfirm] = useState(false)
  const [selectedPicture, setSelectedPicture] = useState(null)
  const [picturePreviewUrl, setPicturePreviewUrl] = useState(null)
  const [studioServices, setStudioServices] = useState([])

  // Refs
  const pictureInputRef = useRef(null)

  // Session
  const { data: session } = useSession()

  // Form hook
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors }
  } = useForm({
    defaultValues: {
      businessName: '',
      description: '',
      location: '',
      address: '',
      openingHours: '',
      email: '',
      phone_number: '',
      isActive: true,
      pricePerDay: '',
      pricePerMonth: '',
      seatingCapacity: '',
      meetingRooms: '',
      pricePerHour: '',
      studio_service_ids: [],
      workingHours: [
        { day: 3, is_open: true, time_from: '09:00', time_to: '17:00' }, // Monday
        { day: 4, is_open: true, time_from: '09:00', time_to: '17:00' }, // Tuesday
        { day: 5, is_open: true, time_from: '09:00', time_to: '17:00' }, // Wednesday
        { day: 6, is_open: true, time_from: '09:00', time_to: '17:00' }, // Thursday
        { day: 7, is_open: true, time_from: '09:00', time_to: '17:00' }, // Friday
        { day: 1, is_open: true, time_from: '10:00', time_to: '14:00' }, // Saturday
        { day: 2, is_open: false, time_from: '', time_to: '' } // Sunday
      ]
    },
    resolver: yupResolver(spaceSchema),
    mode: 'onChange',
    context: { isCoworking, isStudio }
  })

  // Populate form with initialData for editing
  useEffect(() => {
    if (initialData) {
      console.log('EditDrawer - initialData:', initialData)
      console.log('EditDrawer - initialData.studio.services:', initialData?.studio?.services)
      setValue('businessName', initialData.name || initialData.business_name || '')
      setValue('description', initialData.description || '')
      setValue('location', initialData.city || initialData.location || '')
      setValue('address', initialData.address || '')
      setValue('openingHours', initialData.availability?.monday?.hours || initialData.opening_hours || '9:00 - 17:00')
      setValue('email', initialData.email || '')
      setValue('phone_number', initialData.phone || initialData.phone_number || '')
      setValue('isActive', initialData.is_active ?? true)

      if (isCoworking) {
        setValue('pricePerDay', initialData.dailyRate || initialData.coworking?.price_per_day || '')
        setValue('pricePerMonth', initialData.monthlyRate || initialData.coworking?.price_per_month || '')
        setValue('seatingCapacity', initialData.capacity || initialData.coworking?.seating_capacity || '')
        setValue('meetingRooms', initialData.coworking?.meeting_rooms || '')
      }

      if (isStudio) {
        setValue('pricePerHour', initialData.hourlyRate || initialData.studio?.price_per_hour || '')
        setValue('pricePerDay', initialData.dailyRate || initialData.studio?.price_per_day || '')
        const services = initialData.studio?.services || []
        const serviceIds = services.map(s => s.id) || []

        console.log('EditDrawer - Setting studio_service_ids:', serviceIds)
        console.log('EditDrawer - Setting studioServices:', services)
        setValue('studio_service_ids', serviceIds)
        setStudioServices(services)
      }

      // Set working hours (hidden)
      if (initialData.working_hours && Array.isArray(initialData.working_hours)) {
        const mappedWorkingHours = initialData.working_hours.map(hour => ({
          day: hour.day,
          is_open: hour.is_open,
          time_from: hour.is_open && hour.time_from ? hour.time_from.slice(0, 5) : '',
          time_to: hour.is_open && hour.time_to ? hour.time_to.slice(0, 5) : ''
        }))

        const dayMap = {
          1: 'saturday',
          2: 'sunday',
          3: 'monday',
          4: 'tuesday',
          5: 'wednesday',
          6: 'thursday',
          7: 'friday'
        }

        const allDays = Object.keys(dayMap).map(Number)

        const filledWorkingHours = allDays.map(day => {
          const existing = mappedWorkingHours.find(h => h.day === day)

          return existing || { day, is_open: false, time_from: '', time_to: '' }
        })

        setValue('workingHours', filledWorkingHours)
      }

      // Set main picture
      if (initialData.mainImage || initialData.picture) {
        const picUrl = initialData.mainImage || initialData.picture
        const fullUrl = constructWorkspaceImageUrl(picUrl)

        console.log('EditDrawer - Main picture URL:', fullUrl)
        setPicturePreviewUrl(fullUrl)
      }
    } else {
      console.log('EditDrawer - No initialData, closing drawer')
      reset()
      setPicturePreviewUrl(null)
      setSelectedPicture(null)
      setStudioServices([])
      handleClose()
    }
  }, [initialData, setValue, reset, isCoworking, isStudio, handleClose])

  // Handle picture selection
  const handlePictureChange = event => {
    const file = event.target.files[0]

    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError('Picture size must be less than 2MB')

        return
      }

      console.log('EditDrawer - Selected picture:', file.name)
      setSelectedPicture(file)
      const reader = new FileReader()

      reader.onloadend = () => {
        setPicturePreviewUrl(reader.result)
      }

      reader.readAsDataURL(file)
    }
  }

  // Form submission handler
  const onSubmit = data => {
    console.log('EditDrawer - Form submitted with data:', data)
    setOpenConfirm(true)
  }

  // Confirm submission
  const confirmSubmit = async data => {
    setOpenConfirm(false)
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      if (!session?.user?.id || !initialData?.id) {
        throw new Error('Missing required information to update workspace')
      }

      let responseData

      // Update workspace details
      if (isCoworking) {
        const coworkingData = {
          business_name: data.businessName,
          phone_number: data.phone_number,
          email: data.email,
          location: data.location,
          address: data.address,
          description: data.description,
          opening_hours: data.openingHours,
          is_active: data.isActive ? '1' : '0',
          price_per_day: parseFloat(data.pricePerDay) || 0,
          price_per_month: parseFloat(data.pricePerMonth) || 0,
          seating_capacity: parseInt(data.seatingCapacity) || 15,
          meeting_rooms: parseInt(data.meetingRooms) || 0,
          working_hours: data.workingHours.map(hour => ({
            day: hour.day,
            is_open: hour.is_open,
            time_from: hour.is_open ? hour.time_from : null,
            time_to: hour.is_open ? hour.time_to : null
          }))
        }

        console.log('EditDrawer - Sending coworking data:', coworkingData)
        const response = await apiClient.post(`/workspaces/coworking/${initialData.id}`, coworkingData)

        console.log('EditDrawer - Coworking update response:', response.data)
        responseData = response.data.data
      } else if (isStudio) {
        const studioData = {
          business_name: data.businessName,
          phone_number: data.phone_number,
          email: data.email,
          location: data.location,
          address: data.address,
          description: data.description,
          opening_hours: data.openingHours,
          is_active: data.isActive ? '1' : '0',
          price_per_hour: parseFloat(data.pricePerHour) || 0,
          price_per_day: parseFloat(data.pricePerDay) || 0,
          studio_service_ids: data.studio_service_ids || [],
          working_hours: data.workingHours.map(hour => ({
            day: hour.day,
            is_open: hour.is_open,
            time_from: hour.is_open ? hour.time_from : null,
            time_to: hour.is_open ? hour.time_to : null
          }))
        }

        console.log('EditDrawer - Sending studio data:', studioData)
        const response = await apiClient.post(`/workspaces/studio/${initialData.id}`, studioData)

        console.log('EditDrawer - Studio update response:', response.data)
        responseData = response.data.data

        // Ensure studio.services is included in response
        if (responseData.studio?.services) {
          responseData.studio.services =
            responseData.studio.services ||
            data.studio_service_ids.map(id => ({
              id,
              service: studioServices.find(s => s.id === id)?.service || 'Unknown'
            }))
        }
      }

      // Handle picture upload if selected
      if (selectedPicture) {
        const pictureFormData = new FormData()

        pictureFormData.append('picture', selectedPicture)
        console.log('EditDrawer - Uploading picture:', selectedPicture.name)

        const pictureResponse = await apiClient.post(`/workspaces/${initialData.id}/upload-picture`, pictureFormData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })

        console.log('EditDrawer - Picture upload response:', pictureResponse.data)
        responseData.picture = pictureResponse.data.data.picture || responseData.picture
      }

      setSuccess('Workspace updated successfully')
      console.log('EditDrawer - Updated responseData:', responseData)
      onSpaceUpdated({
        ...responseData,
        type: isCoworking ? 'coworking' : 'studio',
        is_active: data.isActive,
        working_hours: data.workingHours,
        studio: {
          ...responseData.studio,
          services:
            responseData.studio?.services ||
            data.studio_service_ids.map(id => ({
              id,
              service: studioServices.find(s => s.id === id)?.service || 'Unknown'
            }))
        }
      })

      // Reset form and state
      reset()
      setSelectedPicture(null)
      setPicturePreviewUrl(null)

      // Do not clear studioServices to preserve for potential reopen
      // setStudioServices([])

      // Close drawer immediately
      handleClose()
      setSuccess(null)
    } catch (err) {
      console.error('EditDrawer - Error updating workspace:', err)
      const message = err.response?.data?.message || 'Failed to update workspace'
      const errors = err.response?.data?.errors || {}

      setError(`${message} ${Object.values(errors).flat().join(', ')}`)
    } finally {
      setLoading(false)
    }
  }

  // Handle closing confirmation
  const handleCloseConfirm = () => {
    setOpenConfirm(false)
  }

  // Prevent rendering if no initialData
  if (!initialData) {
    console.log('EditDrawer - No initialData, closing drawer')
    handleClose()

    return null
  }

  return (
    <Drawer
      open={open}
      anchor='right'
      variant='temporary'
      onClose={handleClose}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 } } }}
    >
      <Box className='flex items-center justify-between plb-5 pli-6'>
        <Typography variant='h6'>Edit Workspace</Typography>
        <IconButton size='small' onClick={handleClose}>
          <i className='tabler-x' />
        </IconButton>
      </Box>
      <Divider />
      <Box className='p-6'>
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
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box sx={{ mb: 4 }}>
            <Box
              sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', mb: 4 }}
            >
              <Avatar
                sx={{ width: 100, height: 100, mb: 2 }}
                src={picturePreviewUrl || '/images/spaces/default.jpg'}
                alt='Space Picture'
              />
              <Button variant='outlined' startIcon={<Upload />} onClick={() => pictureInputRef.current.click()}>
                Upload Picture
              </Button>
              <input
                type='file'
                ref={pictureInputRef}
                style={{ display: 'none' }}
                accept='image/jpeg,image/png,image/jpg'
                onChange={handlePictureChange}
              />
            </Box>

            <Controller
              name='businessName'
              control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label='Business Name'
                  placeholder='Enter business name'
                  sx={{ mb: 4 }}
                  error={Boolean(errors.businessName)}
                  helperText={errors.businessName?.message}
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
                  label='Description'
                  placeholder='Describe your space'
                  multiline
                  rows={4}
                  sx={{ mb: 4 }}
                  error={Boolean(errors.description)}
                  helperText={errors.description?.message}
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
                  placeholder='Enter full address'
                  sx={{ mb: 4 }}
                  error={Boolean(errors.address)}
                  helperText={errors.address?.message}
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
                  label='City'
                  placeholder='Enter city'
                  sx={{ mb: 4 }}
                  error={Boolean(errors.location)}
                  helperText={errors.location?.message}
                />
              )}
            />
            <Controller
              name='openingHours'
              control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label='Opening Hours'
                  placeholder='e.g. 9:00 - 17:00'
                  sx={{ mb: 4 }}
                  error={Boolean(errors.openingHours)}
                  helperText={errors.openingHours?.message}
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
                  placeholder='Enter email address'
                  sx={{ mb: 4 }}
                  error={Boolean(errors.email)}
                  helperText={errors.email?.message}
                />
              )}
            />
            <Controller
              name='phone_number'
              control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label='Phone Number'
                  placeholder='Enter phone number'
                  sx={{ mb: 4 }}
                  error={Boolean(errors.phone_number)}
                  helperText={errors.phone_number?.message}
                />
              )}
            />
            <Controller
              name='isActive'
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Checkbox {...field} checked={field.value} />}
                  label='Active'
                  sx={{ mb: 4 }}
                />
              )}
            />
            {isCoworking && (
              <>
                <Controller
                  name='pricePerDay'
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      type='number'
                      label='Price per Day'
                      placeholder='Enter price per day'
                      InputProps={{
                        startAdornment: <InputAdornment position='start'>$</InputAdornment>
                      }}
                      sx={{ mb: 4 }}
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
                      type='number'
                      label='Price per Month'
                      placeholder='Enter price per month'
                      InputProps={{
                        startAdornment: <InputAdornment position='start'>$</InputAdornment>
                      }}
                      sx={{ mb: 4 }}
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
                      type='number'
                      label='Seating Capacity'
                      placeholder='Enter number of seats'
                      sx={{ mb: 4 }}
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
                      type='number'
                      label='Meeting Rooms'
                      placeholder='Enter number of meeting rooms'
                      sx={{ mb: 4 }}
                      error={Boolean(errors.meetingRooms)}
                      helperText={errors.meetingRooms?.message}
                    />
                  )}
                />
              </>
            )}
            {isStudio && (
              <>
                <Controller
                  name='pricePerHour'
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      fullWidth
                      type='number'
                      label='Price per Hour'
                      placeholder='Enter price per hour'
                      InputProps={{
                        startAdornment: <InputAdornment position='start'>$</InputAdornment>
                      }}
                      sx={{ mb: 4 }}
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
                      type='number'
                      label='Price per Day'
                      placeholder='Enter price per day'
                      InputProps={{
                        startAdornment: <InputAdornment position='start'>$</InputAdornment>
                      }}
                      sx={{ mb: 4 }}
                      error={Boolean(errors.pricePerDay)}
                      helperText={errors.pricePerDay?.message}
                    />
                  )}
                />
                <Controller
                  name='studio_service_ids'
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth sx={{ mb: 4 }} error={Boolean(errors.studio_service_ids)}>
                      <InputLabel id='studio-services-label'>Studio Services</InputLabel>
                      <Select
                        {...field}
                        labelId='studio-services-label'
                        label='Studio Services'
                        multiple
                        value={field.value || []}
                        onChange={e => field.onChange(e.target.value)}
                        renderValue={selected =>
                          selected
                            .map(id => studioServices.find(service => service.id === id)?.service || id)
                            .join(', ')
                        }
                      >
                        {studioServices.map(service => (
                          <MenuItem key={service.id} value={service.id}>
                            {service.service}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.studio_service_ids && (
                        <Typography variant='caption' color='error'>
                          {errors.studio_service_ids.message}
                        </Typography>
                      )}
                    </FormControl>
                  )}
                />
              </>
            )}
            <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
              <Button type='submit' variant='contained' sx={{ mr: 3 }}>
                Update
              </Button>
              <Button variant='outlined' color='secondary' onClick={handleClose}>
                Cancel
              </Button>
            </Box>
          </Box>
        </form>
      </Box>
      <Dialog open={openConfirm} onClose={handleCloseConfirm}>
        <DialogTitle>Confirm Update</DialogTitle>
        <DialogContent>
          Are you sure you want to update this {isCoworking ? 'coworking' : 'studio'} space?
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirm} color='secondary'>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit(confirmSubmit)}
            color='primary'
            variant='contained'
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Updating...' : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>
    </Drawer>
  )
}

export default EditDrawer
