'use client'

// React Imports
import { useState, useEffect, useCallback } from 'react'

// Next Imports
import { useSession } from 'next-auth/react'

// MUI Imports
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
import MenuItem from '@mui/material/MenuItem'
import Chip from '@mui/material/Chip'
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'
import InputAdornment from '@mui/material/InputAdornment'

// Third-party Imports
import { useForm, Controller } from 'react-hook-form'

import { Plus } from 'lucide-react'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'

// API Imports
import apiClient from '@/libs/api'

// Base URL for static files
const STORAGE_BASE_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000').replace(/\/+$/, '');

/**
 * SkillEditDialog component for editing an existing service provider skill
 * @param {object} props - Component props
 * @param {boolean} props.open - Whether the dialog is open
 * @param {function} props.onClose - Function to close the dialog
 * @param {object} props.skill - Skill data (for compatibility)
 * @param {object} props.serviceProvider - Service provider data
 * @param {function} props.refreshData - Callback to refresh parent data
 */
const SkillEditDialog = ({ open, onClose, skill, serviceProvider, refreshData }) => {
  // States
  const [skillDomains, setSkillDomains] = useState([])
  const [skillsList, setSkillsList] = useState([])
  const [dataLoading, setDataLoading] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [originalData, setOriginalData] = useState(null)
  const [openConfirm, setOpenConfirm] = useState(false)
  const [selectedSkills, setSelectedSkills] = useState([])

  // Session
  const { data: session } = useSession()

  // Form hook
  const {
    control,
    reset: resetForm,
    handleSubmit,
    formState: { errors, isValid, isDirty },
    setValue,
    watch
  } = useForm({
    defaultValues: {
      description: '',
      startingPrice: '',
      available: true,
      skillDomainId: '',
      newSkill: ''
    },
    mode: 'onChange'
  })

  // Watch selected skills
  const newSkill = watch('newSkill')

  // Fetch service provider data, skill domains, and skills
  useEffect(() => {
    let isMounted = true

    const fetchServiceProvider = async () => {
      if (!serviceProvider?.id || !open) return

      try {
        const response = await apiClient.get(`/service-providers/by-user/${session?.user?.id}`)
        const providerData = response.data.data

        if (isMounted && providerData) {
          const formData = {
            description: providerData.description || '',
            startingPrice: providerData.starting_price?.toString() || '',
            available: providerData.available !== undefined ? providerData.available : true,
            skillDomainId: providerData.skill_domain_id?.toString() || '',
            newSkill: ''
          }

          resetForm(formData)
          setOriginalData(formData)
          setSelectedSkills(providerData.skills?.map(s => s.id.toString()) || [])

          if (process.env.NODE_ENV !== 'production') {
            console.log('Service provider data fetched:', providerData)
          }
        }
      } catch (error) {
        if (isMounted) {
          setError(
            error.response?.status === 404
              ? 'Service provider not found'
              : error.response?.data?.message || 'Failed to load service provider data'
          )
        }
      }
    }

    const fetchSkillDomains = async () => {
      try {
        const response = await apiClient.get('/skill-domains')
        const domains = response.data.data || []

        setSkillDomains(domains)

        if (process.env.NODE_ENV !== 'production') {
          console.log('Skill domains fetched:', domains)
        }
      } catch (error) {
        if (isMounted) {
          setError('Failed to load skill domains. Please try again.')

          if (process.env.NODE_ENV !== 'production') {
            console.error('Failed to fetch skill domains:', error)
          }
        }
      }
    }

    const fetchSkills = async () => {
      try {
        const response = await apiClient.get('/skills')

        setSkillsList(response.data.data || [])

        if (process.env.NODE_ENV !== 'production') {
          console.log('Skills fetched:', response.data.data)
        }
      } catch (error) {
        if (isMounted) {
          setError('Failed to load skills. Please try again.')

          if (process.env.NODE_ENV !== 'production') {
            console.error('Failed to fetch skills:', error)
          }
        }
      }
    }

    const fetchData = async () => {
      setDataLoading(true)
      setError(null)

      try {
        await Promise.all([fetchServiceProvider(), fetchSkillDomains(), fetchSkills()])
      } finally {
        if (isMounted) {
          setDataLoading(false)
        }
      }
    }

    if (open && session) {
      fetchData()
    }

    return () => {
      isMounted = false
    }
  }, [open, session, serviceProvider?.id, resetForm])

  // Handle adding a skill
  const handleAddSkill = useCallback(() => {
    if (newSkill && !selectedSkills.includes(newSkill)) {
      setSelectedSkills(prev => [...prev, newSkill])
      setValue('newSkill', '')
    }
  }, [newSkill, setValue])

  // Handle removing a skill
  const handleRemoveSkill = useCallback(skillId => {
    setSelectedSkills(prev => prev.filter(id => id !== skillId))
  }, [])

  // Form submission handler
  const onSubmit = () => {
    if (selectedSkills.length === 0) {
      setError('At least one skill is required')

      return
    }

    setOpenConfirm(true)
  }

  // Confirm submission
  const confirmSubmit = async data => {
    setOpenConfirm(false)

    if (!session?.user?.id || !serviceProvider?.id) {
      setError('Authentication required')

      return
    }

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // Handle possible null/empty values
      const skillIdsArray = selectedSkills.length > 0
        ? selectedSkills.map(id => parseInt(id, 10))
        : []

      // Build payload carefully to avoid null/undefined issues
      const payload = {
        description: data.description || null,
        starting_price: data.startingPrice ? parseFloat(data.startingPrice) : null,
        available: data.available ? true : false
      }

      // Only add skill_domain_id if it has a value
      if (data.skillDomainId) {
        payload.skill_domain_id = parseInt(data.skillDomainId, 10)
      }

      // Only add skill_ids if there are any
      if (skillIdsArray.length > 0) {
        payload.skill_ids = skillIdsArray
      }

      if (process.env.NODE_ENV !== 'production') {
        console.log('Sending data to API:', JSON.stringify(payload, null, 2))
      }

      const response = await apiClient.put(`/service-providers/${serviceProvider.id}`, payload)

      setSuccess('Skill updated successfully')

      const updatedData = response.data.data

      const newFormData = {
        description: updatedData.description || '',
        startingPrice: updatedData.starting_price?.toString() || '',
        available: updatedData.available !== undefined ? updatedData.available : true,
        skillDomainId: updatedData.skill_domain_id?.toString() || '',
        newSkill: ''
      }

      resetForm(newFormData)
      setOriginalData(newFormData)
      setSelectedSkills(updatedData.skills?.map(s => s.id.toString()) || [])

      if (refreshData) {
        refreshData(updatedData)
      }

      setTimeout(() => {
        setSuccess(null)
        onClose()
      }, 1500)
    } catch (error) {
      console.error('Failed to update service provider:', error)

      if (error.response) {
        console.error('Error status:', error.response.status)
        console.error('Error data:', error.response.data)
      }

      const errorMessage =
        error.response?.status === 422
          ? error.response.data.errors
            ? Object.values(error.response.data.errors).flat().join(', ')
            : error.response.data.message || 'Validation failed'
          : error.response?.status === 404
            ? 'Service provider not found'
            : error.response?.status === 500
              ? `Server error: ${error.response.data.error || 'Unknown server error'}`
              : 'Failed to update store'

      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Reset handler
  const reset = useCallback(() => {
    if (originalData) {
      resetForm(originalData)
      setSelectedSkills(serviceProvider?.skills?.map(s => s.id.toString()) || [])
    }

    setError(null)
    setSuccess(null)
    setOpenConfirm(false)
    onClose()
  }, [originalData, resetForm, onClose, serviceProvider])

  // Handle dialog key press
  const handleDialogKeyDown = e => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSubmit(confirmSubmit)()
    }
  }

  return (
    <Dialog open={open} onClose={reset} maxWidth='md' fullWidth>
      <DialogTitle className='flex items-center justify-between'>
        Edit Your Skill
        <IconButton size='small' onClick={reset} aria-label='Close dialog'>
          <i className='tabler-x text-2xl text-textPrimary' />
        </IconButton>
      </DialogTitle>
      <DialogContent>
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
        {loading || dataLoading ? (
          <Box className='flex justify-center items-center p-4'>
            <CircularProgress size={30} />
            <Typography className='ml-2'>Loading...</Typography>
          </Box>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-6'>
            <Box className='flex flex-col gap-4'>
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
                    placeholder='Experienced web developer specializing in e-commerce solutions'
                    {...(errors.description && { error: true, helperText: errors.description.message })}
                  />
                )}
              />
              <Controller
                name='skillDomainId'
                control={control}
                rules={{ required: 'Skill Domain is required' }}
                render={({ field }) => (
                  <CustomTextField
                    select
                    fullWidth
                    label='Skill Domain'
                    {...field}
                    {...(errors.skillDomainId && { error: true, helperText: errors.skillDomainId.message })}
                    disabled={skillDomains.length === 0}
                  >
                    <MenuItem value='' disabled>
                      Select Skill Domain
                    </MenuItem>
                    {skillDomains.length === 0 ? (
                      <MenuItem value='' disabled>
                        No skill domains available
                      </MenuItem>
                    ) : (
                      skillDomains.map(domain => (
                        <MenuItem key={domain.id} value={domain.id.toString()}>
                          {domain.name}
                        </MenuItem>
                      ))
                    )}
                  </CustomTextField>
                )}
              />
              <Controller
                name='startingPrice'
                control={control}
                rules={{
                  required: 'Starting Price is required',
                  validate: value => !isNaN(parseFloat(value)) || 'Starting Price must be a valid number'
                }}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    fullWidth
                    label='Starting Price'
                    type='number'
                    placeholder='50'
                    InputProps={{
                      startAdornment: <InputAdornment position='start'>$</InputAdornment>
                    }}
                    {...(errors.startingPrice && { error: true, helperText: errors.startingPrice.message })}
                  />
                )}
              />
              {/* <Controller
                name='available'
                control={control}
                render={({ field }) => (
                  <FormControlLabel
                    control={
                      <Switch
                        checked={field.value}
                        onChange={e => field.onChange(e.target.checked)}
                        color='success'
                      />
                    }
                    label='Available for new projects'
                  />
                )}
              /> */}
              <Box>
                <Typography variant='subtitle1' className='font-medium mb-3'>
                  Skills
                </Typography>
                <Box className='flex flex-wrap gap-1 mb-2'>
                  {selectedSkills.map(skillId => {
                    const skillName = skillsList.find(s => s.id.toString() === skillId.toString())?.name || skillId

                    return (
                      <Chip
                        key={skillId}
                        label={skillName}
                        onDelete={() => handleRemoveSkill(skillId)}
                        size='small'
                        color='primary'
                      />
                    )
                  })}
                </Box>
                <Box className='flex gap-2'>
                  <Controller
                    name='newSkill'
                    control={control}
                    render={({ field }) => (
                      <CustomTextField
                        select
                        label='Add Skill'
                        {...field}
                        size='small'
                        fullWidth
                        disabled={skillsList.length === 0}
                      >
                        <MenuItem value='' disabled>
                          Select Skill
                        </MenuItem>
                        {skillsList
                          .filter(skill => !selectedSkills.includes(skill.id.toString()))
                          .map(skill => (
                            <MenuItem key={skill.id} value={skill.id.toString()}>
                              {skill.name}
                            </MenuItem>
                          ))}
                      </CustomTextField>
                    )}
                  />
                  <Button
                    variant='contained'
                    color='primary'
                    onClick={handleAddSkill}
                    startIcon={<Plus size={18} />}
                    disabled={!newSkill}
                  >
                    Add
                  </Button>
                </Box>
              </Box>
            </Box>
            <Box className='flex items-center gap-4'>
              <Button
                variant='contained'
                type='submit'
                disabled={loading || !isValid || (!isDirty && selectedSkills.length === 0)}
              >
                {loading ? 'Updating...' : 'Submit'}
              </Button>
              <Button variant='tonal' color='error' onClick={reset} disabled={loading}>
                Cancel
              </Button>
            </Box>
          </form>
        )}
        <Dialog open={openConfirm} onClose={() => setOpenConfirm(false)} onKeyDown={handleDialogKeyDown}>
          <DialogTitle>Confirm Skill Update</DialogTitle>
          <DialogContent>Are you sure you want to update this skill?</DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenConfirm(false)}>Cancel</Button>
            <Button onClick={handleSubmit(confirmSubmit)} variant='contained' autoFocus>
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
      </DialogContent>
    </Dialog>
  )
}

export default SkillEditDialog
