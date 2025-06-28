'use client'

// React Imports
import { useState, useCallback } from 'react'

// Next Imports
import { useSession } from 'next-auth/react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid2'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
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

// Function to validate password requirements
const validatePassword = password => {
  const minLength = password.length >= 8
  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumberOrSymbol = /[0-9!@#$%^&*()\-_=+{}[\]|\\:;"'<>,.?/\s]/.test(password)

  return {
    isValid: minLength && hasUpperCase && hasLowerCase && hasNumberOrSymbol,
    errors: [
      !minLength && 'Password must be at least 8 characters long',
      !hasUpperCase && 'Password must contain at least one uppercase letter',
      !hasLowerCase && 'Password must contain at least one lowercase letter',
      !hasNumberOrSymbol && 'Password must contain at least one number or symbol'
    ].filter(Boolean)
  }
}

const ChangePasswordCard = () => {
  // States
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [showPasswords, setShowPasswords] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false)

  // Get session data for authentication
  const { data: session, status } = useSession()

  // Handler to toggle password visibility
  const handleTogglePassword = useCallback(field => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }, [])

  // Handler to update form data
  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    setError(null) // Clear error on input change
  }, [])

  // Handler to open confirmation dialog
  const handleSubmit = async e => {
    e.preventDefault()

    if (!session?.user?.accessToken) {
      setError('You must be logged in to change your password')

      return
    }

    // Validate form data
    const { currentPassword, newPassword, confirmPassword } = formData

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('All fields are required')

      return
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match')

      return
    }

    const { isValid, errors } = validatePassword(newPassword)

    if (!isValid) {
      setError(errors[0]) // Show first error for simplicity

      return
    }

    // Open confirmation dialog instead of sending API request
    setOpenConfirmDialog(true)
  }

  // Handler to confirm password change
  const handleConfirmChange = async () => {
    setOpenConfirmDialog(false)
    setLoading(true)
    setError(null)

    try {
      // Send password change request to API
      const response = await apiClient.put('/user/update-password', {
        current_password: formData.currentPassword,
        new_password: formData.newPassword
      })

      if (process.env.NODE_ENV !== 'production') {
        console.log('Password change API response:', response.data)
      }

      // Show success message
      setSuccess('Password changed successfully')
      setTimeout(() => setSuccess(null), 3000)

      // Reset form
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Failed to change password:', error)
      }

      const errorMessage =
        error.response?.status === 400
          ? error.response.data.message || 'The current password is incorrect'
          : error.response?.status === 401
            ? 'Unauthenticated - Please log in again'
            : 'Failed to change password'

      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Handler to cancel confirmation
  const handleCancelChange = () => {
    setOpenConfirmDialog(false)
  }

  // Handler to reset form
  const handleReset = () => {
    setFormData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
    setError(null)
    setSuccess(null)
  }

  // Loading state UI
  if (status === 'loading') {
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
          <Alert severity='warning'>Please log in to change your password.</Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader title='Change Password' />
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
        <form onSubmit={handleSubmit}>
          <Grid container className='mb-4' spacing={6}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                fullWidth
                label='Current Password'
                type={showPasswords.currentPassword ? 'text' : 'password'}
                value={formData.currentPassword}
                onChange={e => handleInputChange('currentPassword', e.target.value)}
                placeholder='············'
                disabled={loading}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position='end'>
                        <IconButton
                          edge='end'
                          onClick={() => handleTogglePassword('currentPassword')}
                          onMouseDown={e => e.preventDefault()}
                          aria-label={showPasswords.currentPassword ? 'Hide current password' : 'Show current password'}
                        >
                          <i className={showPasswords.currentPassword ? 'tabler-eye-off' : 'tabler-eye'} />
                        </IconButton>
                      </InputAdornment>
                    )
                  }
                }}
              />
            </Grid>
          </Grid>
          <Grid container className='mbs-0' spacing={6}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                fullWidth
                label='New Password'
                type={showPasswords.newPassword ? 'text' : 'password'}
                value={formData.newPassword}
                onChange={e => handleInputChange('newPassword', e.target.value)}
                placeholder='············'
                disabled={loading}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position='end'>
                        <IconButton
                          edge='end'
                          onClick={() => handleTogglePassword('newPassword')}
                          onMouseDown={e => e.preventDefault()}
                          aria-label={showPasswords.newPassword ? 'Hide new password' : 'Show new password'}
                        >
                          <i className={showPasswords.newPassword ? 'tabler-eye-off' : 'tabler-eye'} />
                        </IconButton>
                      </InputAdornment>
                    )
                  }
                }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomTextField
                fullWidth
                label='Confirm New Password'
                type={showPasswords.confirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={e => handleInputChange('confirmPassword', e.target.value)}
                placeholder='············'
                disabled={loading}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position='end'>
                        <IconButton
                          edge='end'
                          onClick={() => handleTogglePassword('confirmPassword')}
                          onMouseDown={e => e.preventDefault()}
                          aria-label={showPasswords.confirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                        >
                          <i className={showPasswords.confirmPassword ? 'tabler-eye-off' : 'tabler-eye'} />
                        </IconButton>
                      </InputAdornment>
                    )
                  }
                }}
              />
            </Grid>
            <Grid size={{ xs: 12 }} className='flex flex-col gap-4'>
              <Typography variant='h6'>Password Requirements:</Typography>
              <div className='flex flex-col gap-4'>
                <div className='flex items-center gap-2.5'>
                  <i className='tabler-circle-filled text-[8px]' />
                  Minimum 8 characters long - the more, the better
                </div>
                <div className='flex items-center gap-2.5'>
                  <i className='tabler-circle-filled text-[8px]' />
                  At least one lowercase & one uppercase character
                </div>
                <div className='flex items-center gap-2.5'>
                  <i className='tabler-circle-filled text-[8px]' />
                  At least one number, symbol, or whitespace character
                </div>
              </div>
            </Grid>
            <Grid size={{ xs: 12 }} className='flex gap-4'>
              <Button variant='contained' type='submit' disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button variant='tonal' color='secondary' onClick={handleReset} disabled={loading}>
                Reset
              </Button>
            </Grid>
          </Grid>
        </form>
        {/* Confirmation dialog for password change */}
        <Dialog
          open={openConfirmDialog}
          onClose={handleCancelChange}
          aria-labelledby='confirm-password-dialog-title'
          aria-describedby='confirm-password-dialog-description'
        >
          <DialogTitle id='confirm-password-dialog-title'>Confirm Password Change</DialogTitle>
          <DialogContent>
            <Typography id='confirm-password-dialog-description'>
              Are you sure you want to change your password?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button variant='tonal' color='secondary' onClick={handleCancelChange}>
              Cancel
            </Button>
            <Button variant='contained' onClick={handleConfirmChange} autoFocus>
              Confirm
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  )
}

export default ChangePasswordCard
