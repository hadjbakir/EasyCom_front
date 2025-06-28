'use client'

// React Imports
import { useState } from 'react'

import { useSession } from 'next-auth/react'
import {
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
  Button,
  FormControlLabel,
  Switch,
  TextField,
  Alert
} from '@mui/material'

// Icon Imports
import { MapPin, Info, Building2, Calendar, DollarSign } from 'lucide-react'

import apiClient from '@/libs/api'

const OverviewTab = ({ space, onUpdateWorkingHours }) => {
  // Session for ownership check
  const { data: session } = useSession()
  const canEdit = session?.user?.id === space.user_id

  // Default working hours for add form
  const defaultWorkingHours = [
    { day: 'Monday', time_from: '', time_to: '', is_open: false  },
    { day: 'Tuesday', time_from: '', time_to: '', is_open: false  },
    { day: 'Wednesday', time_from: '', time_to: '', is_open: false  },
    { day: 'Thursday', time_from: '', time_to: '', is_open: false  },
    { day: 'Friday', time_from: '', time_to: '', is_open: false  },
    { day: 'Saturday', time_from: '', time_to: '', is_open: false  },
    { day: 'Sunday', time_from: '', time_to: '', is_open: false }
  ]

  // Normalize time format (e.g., "09:00:00" -> "09:00")
  const normalizeTime = time => {
    if (!time) return ''
    const [hours, minutes] = time.split(':')

    return `${hours}:${minutes}`
  }

  // Normalize day casing (e.g., "monday" -> "Monday")
  const normalizeDay = day => {
    if (!day) return ''

    return day.charAt(0).toUpperCase() + day.slice(1).toLowerCase()
  }

  // Initialize working hours
  const [workingHours, setWorkingHours] = useState(
    Object.keys(space.availability || {}).length === 0
      ? defaultWorkingHours
      : Object.entries(space.availability).map(([day, schedule]) => ({
          day: normalizeDay(day),
          time_from: schedule.open && schedule.hours ? normalizeTime(schedule.hours.split(' - ')[0]) : '',
          time_to: schedule.open && schedule.hours ? normalizeTime(schedule.hours.split(' - ')[1]) : '',
          is_open: schedule.open
        }))
  )

  // State for tracking changes and errors
  const [hasChanges, setHasChanges] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  // Check if working_hours is empty
  const isWorkingHoursEmpty = Object.keys(space.availability || {}).length === 0

  // Handle form/table changes
  const handleWorkingHoursChange = (index, field, value) => {
    setWorkingHours(prev => {
      const newWorkingHours = [...prev]

      if (field === 'is_open' && !value) {
        newWorkingHours[index] = { ...newWorkingHours[index], is_open: false, time_from: '', time_to: '' }
      } else if (field === 'time_from' || field === 'time_to') {
        const normalizedValue = value ? normalizeTime(value) : ''

        newWorkingHours[index] = { ...newWorkingHours[index], [field]: normalizedValue }
      } else {
        newWorkingHours[index] = { ...newWorkingHours[index], [field]: value }
      }

      setHasChanges(true)

      return newWorkingHours
    })
  }

  // Validate working hours
  const validateWorkingHours = hours => {
    for (const hour of hours) {
      if (hour.is_open) {
        if (!hour.time_from || !hour.time_to) {
          return `Time is required for ${normalizeDay(hour.day)} when it is set to open.`
        }

        // Optional: Validate time format (e.g., HH:mm)
        const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/

        if (!timeRegex.test(hour.time_from) || !timeRegex.test(hour.time_to)) {
          return `Invalid time format for ${normalizeDay(hour.day)}. Use HH:mm (e.g., 09:00).`
        }
      }
    }

    return null
  }

  // Handle form submission
  const handleSubmit = async e => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    // Validate working hours
    const validationError = validateWorkingHours(workingHours)

    if (validationError) {
      setError(validationError)

      return
    }

    try {
      // Ensure proper day casing and exclude id
      const normalizedWorkingHours = workingHours.map(({ id, ...hour }) => ({
        ...hour,
        day: normalizeDay(hour.day)
      }))

      // Log submission details
      console.log('Submitting workingHours:', normalizedWorkingHours)
      console.log('Method:', isWorkingHoursEmpty ? 'POST' : 'PUT')
      console.log('isWorkingHoursEmpty:', isWorkingHoursEmpty)
      console.log('space.availability:', space.availability)

      // Use POST for adding new working hours, PUT for updating
      const method = isWorkingHoursEmpty ? 'post' : 'put'
      const response = await apiClient[method](`/workspaces/${space.id}/working-hours`, normalizedWorkingHours)

      // Log API response
      console.log('API response.data.data:', response.data.data)
      console.log('method', method)

      // Map numeric day values to string day names (aligned with backend)
      const dayMap = {
        1: 'Saturday',
        2: 'Sunday',
        3: 'Monday',
        4: 'Tuesday',
        5: 'Wednesday',
        6: 'Thursday',
        7: 'Friday'
      }

      // Update local workingHours state from API response
      setWorkingHours(
        response.data.data.map(hour => ({
          day: dayMap[parseInt(hour.day)] || normalizeDay(hour.day) || hour.day,
          time_from: hour.is_open && hour.time_from ? normalizeTime(hour.time_from) : '',
          time_to: hour.is_open && hour.time_to ? normalizeTime(hour.time_to) : '',
          is_open: hour.is_open
        }))
      )

      // Notify parent to update space.availability
      onUpdateWorkingHours(response.data.data)

      setHasChanges(false)
      setSuccess('Working hours saved successfully')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      console.error('Error saving working hours:', err.response?.data || err)
      setError(
        err.response?.data?.message === 'Validation error'
          ? 'Invalid input. Please check your times and try again.'
          : 'Failed to save working hours. Please try again.'
      )
    }
  }

  return (
    <Grid container spacing={4}>
      {/* Description Section */}
      <Grid item xs={12}>
        <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
          <CardContent sx={{ p: 4 }}>
            <Box display='flex' alignItems='center' gap={2} mb={3}>
              <Box sx={{ p: 1.5, borderRadius: 1, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
                <Info size={20} />
              </Box>
              <Typography variant='h5' fontWeight='600'>
                About This Space
              </Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />
            <Typography variant='body1' color='text.secondary' sx={{ lineHeight: 1.8 }}>
              {space.description || 'No description available.'}
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      {/* Key Information Section */}
      <Grid item xs={12} md={6}>
        <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, height: '100%' }}>
          <CardContent sx={{ p: 4 }}>
            <Box display='flex' alignItems='center' gap={2} mb={3}>
              <Box sx={{ p: 1.5, borderRadius: 1, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
                <Building2 size={20} />
              </Box>
              <Typography variant='h5' fontWeight='600'>
                Key Information
              </Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />
            <Box display='flex' flexDirection='column' gap={4}>
              <Box display='flex' alignItems='flex-start' gap={3}>
                <Box sx={{ p: 1, borderRadius: 1, bgcolor: 'primary.lighter', color: 'primary.main' }}>
                  <MapPin size={18} />
                </Box>
                <Box>
                  <Typography variant='subtitle1' fontWeight='600'>
                    Location
                  </Typography>
                  <Typography variant='body2' color='text.secondary' mt={0.5}>
                    {space.address || 'No address available'}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    {space.city || 'No city available'}
                  </Typography>
                </Box>
              </Box>
              <Box display='flex' alignItems='flex-start' gap={3}>
                <Box sx={{ p: 1, borderRadius: 1, bgcolor: 'primary.lighter', color: 'primary.main' }}>
                  <MapPin size={18} />
                </Box>
                <Box>
                  <Typography variant='subtitle1' fontWeight='600'>
                    Contact
                  </Typography>
                  <Typography variant='body2' color='text.secondary' mt={0.5}>
                    {space.email || 'No email available'}
                  </Typography>
                  <Typography variant='body2' color='text.secondary'>
                    {space.phone || 'No phone number available'}
                  </Typography>
                </Box>
              </Box>
              <Box display='flex' alignItems='flex-start' gap={3}>
                <Box sx={{ p: 1, borderRadius: 1, bgcolor: 'primary.lighter', color: 'primary.main' }}>
                  <DollarSign size={18} />
                </Box>
                <Box>
                  <Typography variant='subtitle1' fontWeight='600'>
                    Pricing
                  </Typography>
                  {space.type === 'studio' ? (
                    <>
                      <Typography variant='body2' color='text.secondary' mt={0.5}>
                        Hourly Rate: ${space.studio?.price_per_hour || 0}/hour
                      </Typography>
                      <Typography variant='body2' color='text.secondary'>
                        Daily Rate: ${space.studio?.price_per_day || 0}/day
                      </Typography>
                    </>
                  ) : (
                    <>
                      <Typography variant='body2' color='text.secondary' mt={0.5}>
                        Daily Rate: ${space.coworking?.price_per_day || 0}/day
                      </Typography>
                      <Typography variant='body2' color='text.secondary'>
                        Monthly Rate: ${space.coworking?.price_per_month || 0}/month
                      </Typography>
                    </>
                  )}
                </Box>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Business Hours Section */}
      <Grid item xs={12} md={6}>
        <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, height: '100%' }}>
          <CardContent sx={{ p: 4 }}>
            <Box display='flex' alignItems='center' gap={2} mb={3}>
              <Box sx={{ p: 1.5, borderRadius: 1, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
                <Calendar size={20} />
              </Box>
              <Typography variant='h5' fontWeight='600'>
                Business Hours
              </Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />
            {error && (
              <Alert severity='error' sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            {success && (
              <Alert severity='success' sx={{ mb: 2 }}>
                {success}
              </Alert>
            )}

            {canEdit ? (
              <form onSubmit={handleSubmit}>
                {isWorkingHoursEmpty ? (
                  <Box>
                    {workingHours.map((hour, index) => (
                      <Box key={hour.day} sx={{ mb: 2 }}>
                        <Typography variant='subtitle1' sx={{ textTransform: 'capitalize' }}>
                          {hour.day}
                        </Typography>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={hour.is_open}
                              onChange={e => handleWorkingHoursChange(index, 'is_open', e.target.checked)}
                            />
                          }
                          label={hour.is_open ? 'Open' : 'Closed'}
                        />
                        {hour.is_open && (
                          <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                            <TextField
                              type='time'
                              label='From'
                              value={hour.time_from}
                              onChange={e => handleWorkingHoursChange(index, 'time_from', e.target.value)}
                              InputLabelProps={{ shrink: true }}
                              inputProps={{ step: 300 }}
                              sx={{ flex: 1 }}
                              required
                              error={hour.is_open && !hour.time_from}
                              helperText={hour.is_open && !hour.time_from ? 'Time is required' : ''}
                            />
                            <TextField
                              type='time'
                              label='To'
                              value={hour.time_to}
                              onChange={e => handleWorkingHoursChange(index, 'time_to', e.target.value)}
                              InputLabelProps={{ shrink: true }}
                              inputProps={{ step: 300 }}
                              sx={{ flex: 1 }}
                              required
                              error={hour.is_open && !hour.time_to}
                              helperText={hour.is_open && !hour.time_to ? 'Time is required' : ''}
                            />
                          </Box>
                        )}
                      </Box>
                    ))}
                    <Button type='submit' variant='contained' fullWidth sx={{ mt: 2 }}>
                      Save Working Hours
                    </Button>
                  </Box>
                ) : (
                  <Box>
                    <TableContainer component={Paper} variant='outlined' sx={{ borderRadius: 2 }}>
                      <Table size='medium'>
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 600 }}>Day</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Hours</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {workingHours.map((hour, index) => (
                            <TableRow key={hour.day} hover>
                              <TableCell sx={{ textTransform: 'capitalize', fontWeight: 500 }}>{hour.day}</TableCell>
                              <TableCell>
                                <FormControlLabel
                                  control={
                                    <Switch
                                      checked={hour.is_open}
                                      onChange={e => handleWorkingHoursChange(index, 'is_open', e.target.checked)}
                                    />
                                  }
                                  label={hour.is_open ? 'Open' : 'Closed'}
                                  sx={{ m: 0 }}
                                />
                              </TableCell>
                              <TableCell>
                                {hour.is_open ? (
                                  <Box sx={{ display: 'flex', gap: 1 }}>
                                    <TextField
                                      type='time'
                                      value={hour.time_from}
                                      onChange={e => handleWorkingHoursChange(index, 'time_from', e.target.value)}
                                      size='small'
                                      inputProps={{ step: 300 }}
                                      sx={{ width: 100 }}
                                      required
                                      error={hour.is_open && !hour.time_from}
                                      helperText={hour.is_open && !hour.time_from ? 'Required' : ''}
                                    />
                                    <Typography sx={{ alignSelf: 'center' }}>-</Typography>
                                    <TextField
                                      type='time'
                                      value={hour.time_to}
                                      onChange={e => handleWorkingHoursChange(index, 'time_to', e.target.value)}
                                      size='small'
                                      inputProps={{ step: 300 }}
                                      sx={{ width: 100 }}
                                      required
                                      error={hour.is_open && !hour.time_to}
                                      helperText={hour.is_open && !hour.time_to ? 'Required' : ''}
                                    />
                                  </Box>
                                ) : (
                                  '—'
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                    {hasChanges && (
                      <Button type='submit' variant='contained' fullWidth sx={{ mt: 2 }}>
                        Update Working Hours
                      </Button>
                    )}
                  </Box>
                )}
              </form>
            ) : (
              <Typography color='text.secondary'>Only the workspace owner can edit working hours.</Typography>
            )}
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  )
}

export default OverviewTab
