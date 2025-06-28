'use client'

// React Imports
import { useState, useEffect } from 'react'

// Next Imports
import { useRouter } from 'next/navigation'

import { useSession } from 'next-auth/react'

// MUI Imports
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid2'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import CardActions from '@mui/material/CardActions'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'

// API Imports
import apiClient from '@/libs/api'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

const STORAGE_BASE_URL = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000').replace(/\/+$/, '')

const FormLayoutsSeparator = () => {
  // States
  const [formData, setFormData] = useState({
    description: '',
    skill_domain_id: '',
    skill_ids: [],
    starting_price: ''
  })

  const [skillDomains, setSkillDomains] = useState([])
  const [skills, setSkills] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [domainsLoading, setDomainsLoading] = useState(true)
  const [skillsLoading, setSkillsLoading] = useState(true)
  const [profileLoading, setProfileLoading] = useState(true)
  const [domainsError, setDomainsError] = useState(null)
  const [skillsError, setSkillsError] = useState(null)
  const [hasProfile, setHasProfile] = useState(false)
  const [serviceProviderId, setServiceProviderId] = useState(null)

  // Hooks
  const { data: session, status } = useSession()
  const router = useRouter()

  // Clear success message after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess(null)
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [success])

  // Fetch skill domains, skills, and check profile on mount
  useEffect(() => {
    const fetchSkillDomains = async () => {
      setDomainsLoading(true)
      setDomainsError(null)

      try {
        const response = await apiClient.get('/skill-domains')

        setSkillDomains(response.data.data || [])

        if (process.env.NODE_ENV !== 'production') {
          console.log('Skill domains fetched:', response.data.data)
        }
      } catch (error) {
        const errorMessage =
          error.response?.status === 404
            ? 'Skill domains endpoint not found. Please check the backend route.'
            : 'Failed to load skill domains. Please try again.'

        setDomainsError(errorMessage)

        if (process.env.NODE_ENV !== 'production') {
          console.error('Failed to fetch skill domains:', error)
        }
      } finally {
        setDomainsLoading(false)
      }
    }

    const fetchSkills = async () => {
      setSkillsLoading(true)
      setSkillsError(null)

      try {
        const response = await apiClient.get('/skills')

        setSkills(response.data.data || [])

        if (process.env.NODE_ENV !== 'production') {
          console.log('Skills fetched:', response.data.data)
        }
      } catch (error) {
        const errorMessage =
          error.response?.status === 404
            ? 'Skills endpoint not found. Please check the backend route.'
            : 'Failed to load skills. Please try again.'

        setSkillsError(errorMessage)

        if (process.env.NODE_ENV !== 'production') {
          console.error('Failed to fetch skills:', error)
        }
      } finally {
        setSkillsLoading(false)
      }
    }

    const checkExistingProfile = async () => {
      setProfileLoading(true)

      if (!session?.user?.id) {
        setProfileLoading(false)

        return
      }

      try {
        const response = await apiClient.get(`/service-providers?user_id=${session.user.id}`)
        const providers = response.data.data || []

        // Check if any provider exists for this specific user ID
        const existingProvider = providers.find(provider => provider.user_id === session.user.id)

        if (existingProvider) {
          setHasProfile(true)
          setServiceProviderId(existingProvider.id)

          if (process.env.NODE_ENV !== 'production') {
            console.log('Existing service provider profile found for user:', existingProvider)
          }
        }
      } catch (error) {
        if (process.env.NODE_ENV !== 'production') {
          console.error('Failed to check existing profile:', error)
        }

        if (error.response?.status !== 404) {
          console.error('Unexpected error checking profile:', error)
        }
      } finally {
        setProfileLoading(false)
      }
    }

    const fetchData = async () => {
      await Promise.all([
        fetchSkillDomains(),
        fetchSkills(),
        status === 'authenticated' ? checkExistingProfile() : Promise.resolve()
      ])
    }

    fetchData()
  }, [session, status])

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError(null)
  }

  // Handle form reset
  const handleReset = () => {
    setFormData({
      description: '',
      skill_domain_id: '',
      skill_ids: [],
      starting_price: ''
    })
    setError(null)
  }

  // Handle form submission
  const handleSubmit = async e => {
    e.preventDefault()

    if (hasProfile) {
      setError('You have already created a skill profile.')

      return
    }

    if (!session?.user?.accessToken) {
      setError('You must be logged in to create a service provider profile')

      return
    }

    const { description, skill_domain_id, skill_ids } = formData

    if (!description || !skill_domain_id || skill_ids.length === 0) {
      setError('All fields (Description, Skill Domain, Skills) are required')

      return
    }

    setLoading(true)
    setError(null)

    try {
      const payload = {
        user_id: session.user.id,
        description: description.trim(),
        skill_domain_id: parseInt(skill_domain_id),
        skill_ids: skill_ids.map(id => parseInt(id)),
        starting_price: formData.starting_price ? parseFloat(formData.starting_price) : null
      }

      if (process.env.NODE_ENV !== 'production') {
        console.log('Sending service provider data:', payload)
      }

      const response = await apiClient.post('/service-providers', payload)
      const serviceProviderId = response.data.data?.id || response.data.id

      if (!serviceProviderId) {
        throw new Error('Service provider ID not returned in response')
      }

      setSuccess('Skill profile created successfully')
      setHasProfile(true)
      setServiceProviderId(serviceProviderId)
    } catch (error) {
      const errorMessage =
        error.response?.status === 422
          ? error.response.data.errors
            ? Object.values(error.response.data.errors).flat().join(', ')
            : error.response.data.message || 'Validation failed'
          : error.response?.status === 404
            ? 'Service provider endpoint not found. Please check the backend route.'
            : error.response?.status === 401
              ? 'Authentication failed. Please log in again.'
              : error.response?.status === 403
                ? 'You do not have permission to perform this action.'
                : error.response?.status === 409
                  ? 'You have already created a skill profile.'
                  : `Failed to create service provider: ${error.message || 'Unknown error'}`

      setError(errorMessage)

      if (error.response?.status === 409) {
        setHasProfile(true)
        setServiceProviderId(error.response.data.data?.id || error.response.data.id || null)
      }
    } finally {
      setLoading(false)
    }
  }

  // Navigate to My Skills
  const handleGoToMySkills = () => {
    const url = getLocalizedUrl('/apps/mybusinesses?tab=myskills', session?.user?.lang || 'en')

    router.push(url)
  }

  // Loading state UI
  if (status === 'loading' || domainsLoading || skillsLoading || profileLoading) {
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
          <Alert severity='warning'>Please log in to create a service provider profile.</Alert>
        </CardContent>
      </Card>
    )
  }

  // Error state UI for skill domains or skills
  if (domainsError || skillsError) {
    return (
      <Card>
        <CardContent>
          <Alert severity='error'>{domainsError || skillsError}</Alert>
        </CardContent>
      </Card>
    )
  }

  // Profile already exists UI
  if (hasProfile) {
    return (
      <Card>
        <CardContent>
          <Alert
            severity='info'
            className='mbe-4'
            action={
              <Button variant='contained' color='primary' onClick={handleGoToMySkills}>
                Go to My Skills
              </Button>
            }
          >
            You have already created a skill profile.
          </Alert>
          {success && (
            <Alert severity='success' className='mbe-4' role='alert'>
              {success}
            </Alert>
          )}
        </CardContent>
      </Card>
    )
  }

  // Form UI
  return (
    <Card>
      <CardHeader title='Create Service Provider Profile' />
      <Divider />
      <form onSubmit={handleSubmit}>
        <CardContent>
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
          <Grid container spacing={6}>
            <Grid size={{ xs: 12 }}>
              <CustomTextField
                fullWidth
                label='Description'
                placeholder='Experienced web developer specializing in e-commerce solutions'
                value={formData.description}
                onChange={e => handleInputChange('description', e.target.value)}
                disabled={loading}
                multiline
                rows={4}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                fullWidth
                label='Starting Price (DZD)'
                placeholder='e.g. 5000'
                value={formData.starting_price}
                onChange={e => handleInputChange('starting_price', e.target.value)}
                disabled={loading}
                type='number'
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                select
                fullWidth
                label='Domain'
                value={formData.skill_domain_id}
                onChange={e => handleInputChange('skill_domain_id', e.target.value)}
                disabled={loading || skillDomains.length === 0}
              >
                <MenuItem value='' disabled>
                  Select Skill Domain
                </MenuItem>
                {skillDomains.map(domain => (
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
                label='Skills'
                value={formData.skill_ids}
                disabled={loading || skills.length === 0}
                slotProps={{
                  select: {
                    multiple: true,
                    onChange: e => handleInputChange('skill_ids', e.target.value)
                  }
                }}
              >
                {skills.map(skill => (
                  <MenuItem key={skill.id} value={skill.id}>
                    {skill.name}
                  </MenuItem>
                ))}
              </CustomTextField>
            </Grid>
          </Grid>
        </CardContent>
        <Divider />
        <CardActions>
          <Button type='submit' variant='contained' className='mie-2' disabled={loading}>
            {loading ? 'Creating...' : 'Create'}
          </Button>
          <Button type='reset' variant='tonal' color='secondary' onClick={handleReset} disabled={loading}>
            Reset
          </Button>
        </CardActions>
      </form>
    </Card>
  )
}

export default FormLayoutsSeparator
