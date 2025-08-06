'use client'

import { useState } from 'react'

import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Alert,
  Divider
} from '@mui/material'

import apiClient from '@/libs/api'

const ServiceOrderForm = ({ provider }) => {
  const [formData, setFormData] = useState({
    projectTitle: '',
    projectDescription: '',
    budget: '',
    deadline: '',
    skill_id: ''
  })

  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  // Use provider.skills for dropdown (array of { id, name })
  const serviceTypes = provider?.skills || []

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0]

  const handleChange = e => {
    const { name, value } = e.target

    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setLoading(true)

    // Validation
    if (!formData.projectTitle) {
      setError('Project title is required')
      setLoading(false)

      return
    }

    if (!formData.projectDescription) {
      setError('Project description is required')
      setLoading(false)

      return
    }

    if (!formData.skill_id) {
      setError('Service type is required')
      setLoading(false)

      return
    }

    if (formData.budget && isNaN(formData.budget)) {
      setError('Budget must be a valid number')
      setLoading(false)

      return
    }

    // Client-side validation for deadline
    if (formData.deadline && formData.deadline < today) {
      setError('Deadline cannot be before today.')
      setLoading(false)

      return
    }

    try {
      const payload = {
        service_provider_id: provider.id,
        skill_id: parseInt(formData.skill_id, 10),
        title: formData.projectTitle,
        description: formData.projectDescription,
        deadline: formData.deadline || null,
        total_amount: formData.budget ? parseFloat(formData.budget) : null
      }

      await apiClient.post('/service-orders', payload, {
        headers: { 'Content-Type': 'application/json' }
      })

      setSuccess(true)
      setFormData({
        projectTitle: '',
        projectDescription: '',
        budget: '',
        deadline: '',
        skill_id: ''
      })
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to submit order')
      console.error('Order submission error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardContent>
        <Typography variant='h6' gutterBottom>
          Order Service from {provider?.name}
        </Typography>
        <Divider sx={{ mb: 3 }} />
        {success && (
          <Alert severity='success' sx={{ mb: 3 }}>
            Your service order has been submitted successfully! {provider?.name} will review your request and contact
            you soon.
          </Alert>
        )}
        {error && (
          <Alert severity='error' sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        <Box component='form' onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                label='Project Title'
                name='projectTitle'
                value={formData.projectTitle}
                onChange={handleChange}
                fullWidth
                required
                placeholder='e.g., Website Redesign, Logo Creation'
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required disabled={loading}>
                <InputLabel>Service Type</InputLabel>
                <Select name='skill_id' value={formData.skill_id} label='Service Type' onChange={handleChange}>
                  {serviceTypes.map(skill => (
                    <MenuItem key={skill.id} value={skill.id}>
                      {skill.name}
                    </MenuItem>
                  ))}
                  {serviceTypes.length === 0 && <MenuItem disabled>No services available</MenuItem>}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label='Budget'
                name='budget'
                value={formData.budget}
                onChange={handleChange}
                fullWidth
                placeholder='Your budget for this project'
                InputProps={{
                  startAdornment: <InputAdornment position='start'>$</InputAdornment>
                }}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label='Deadline'
                name='deadline'
                type='date'
                value={formData.deadline}
                onChange={handleChange}
                fullWidth
                InputLabelProps={{
                  shrink: true
                }}
                min={today}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label='Project Description'
                name='projectDescription'
                value={formData.projectDescription}
                onChange={handleChange}
                fullWidth
                required
                multiline
                rows={4}
                placeholder='Describe your project requirements in detail...'
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12}>
              <Button type='submit' variant='contained' color='primary' size='large' fullWidth disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Order Request'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </CardContent>
    </Card>
  )
}

export default ServiceOrderForm
