'use client'

// React Imports
import { useState } from 'react'

// Next Imports
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'

// MUI Imports
import useMediaQuery from '@mui/material/useMediaQuery'
import { styled, useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Checkbox from '@mui/material/Checkbox'
import Button from '@mui/material/Button'
import FormControlLabel from '@mui/material/FormControlLabel'
import Divider from '@mui/material/Divider'
import Alert from '@mui/material/Alert'

// Third-party Imports
import { signIn } from 'next-auth/react'
import { Controller, useForm } from 'react-hook-form'
import { valibotResolver } from '@hookform/resolvers/valibot'
import { email, object, minLength, string, pipe, nonEmpty, regex } from 'valibot'
import classnames from 'classnames'

import apiClient from '@/libs/api'

// Component Imports
import Logo from '@components/layout/shared/Logo'
import CustomTextField from '@core/components/mui/TextField'

// Hook Imports
import { useImageVariant } from '@core/hooks/useImageVariant'
import { useSettings } from '@core/hooks/useSettings'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

// Styled Custom Components
const RegisterIllustration = styled('img')(({ theme }) => ({
  zIndex: 2,
  blockSize: 'auto',
  maxBlockSize: 600,
  maxInlineSize: '100%',
  margin: theme.spacing(12),
  [theme.breakpoints.down(1536)]: { maxBlockSize: 550 },
  [theme.breakpoints.down('lg')]: { maxBlockSize: 450 }
}))

const MaskImg = styled('img')({
  blockSize: 'auto',
  maxBlockSize: 345,
  inlineSize: '100%',
  position: 'absolute',
  insetBlockEnd: 0,
  zIndex: -1
})

const schema = object({
  full_name: pipe(string(), nonEmpty('Full name is required')),
  email: pipe(string(), minLength(1, 'This field is required'), email('Email is invalid')),
  phone_number: pipe(
    string(),
    nonEmpty('Phone number is required'),
    minLength(10, 'Phone number must be at least 10 digits'),
    regex(/^\d+$/, 'Phone number must contain only digits') // Validation pour chiffres uniquement
  ),
  password: pipe(
    string(),
    nonEmpty('This field is required'),
    minLength(8, 'Password must be at least 8 characters long')
  )
})

const Register = ({ mode }) => {
  // States
  const [isPasswordShown, setIsPasswordShown] = useState(false)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  // Vars
  const darkImg = '/images/pages/auth-mask-dark.png'
  const lightImg = '/images/pages/auth-mask-light.png'
  const darkIllustration = '/images/illustrations/auth/v2-register-dark.png'
  const lightIllustration = '/images/illustrations/auth/v2-register-light.png'
  const borderedDarkIllustration = '/images/illustrations/auth/v2-register-dark-border.png'
  const borderedLightIllustration = '/images/illustrations/auth/v2-register-light-border.png'

  // Hooks
  const router = useRouter()
  const { lang: locale } = useParams()
  const { settings } = useSettings()
  const theme = useTheme()
  const hidden = useMediaQuery(theme.breakpoints.down('md'))

  const authBackground = useImageVariant(mode, lightImg, darkImg)

  const characterIllustration = useImageVariant(
    mode,
    lightIllustration,
    darkIllustration,
    borderedLightIllustration,
    borderedDarkIllustration
  )

  const {
    control,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: valibotResolver(schema),
    defaultValues: {
      full_name: '',
      email: '',
      phone_number: '',
      password: ''
    }
  })

  const handleClickShowPassword = () => setIsPasswordShown(show => !show)

  const onSubmit = async data => {
    setLoading(true)
    setError(null)

    try {
      const response = await apiClient.post('/register', data)

      if (response.status === 201) {
        router.push(getLocalizedUrl(`/verify-email?email=${encodeURIComponent(data.email)}`, locale))
      } else {
        setError('Une erreur inconnue est survenue.')
        setLoading(false)
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed')
      setLoading(false)
    }
  }

  // Gestion de la saisie pour ne permettre que des chiffres
  const handlePhoneNumberKeyPress = event => {
    const charCode = event.charCode

    if (charCode < 48 || charCode > 57) {
      // 48-57 sont les codes ASCII pour 0-9
      event.preventDefault()
    }
  }

  return (
    <div className='flex bs-full justify-center'>
      <div
        className={classnames(
          'flex bs-full items-center justify-center flex-1 min-bs-[100dvh] relative p-6 max-md:hidden',
          {
            'border-ie': settings.skin === 'bordered'
          }
        )}
      >
        <RegisterIllustration src={characterIllustration} alt='character-illustration' />
        {!hidden && <MaskImg alt='mask' src={authBackground} />}
      </div>
      <div className='flex justify-center items-center bs-full bg-backgroundPaper !min-is-full p-6 md:!min-is-[unset] md:p-12 md:is-[480px]'>
        <Link
          href={getLocalizedUrl('/login', locale)}
          className='absolute block-start-5 sm:block-start-[33px] inline-start-6 sm:inline-start-[38px]'
        >
          <Logo />
        </Link>
        <div className='flex flex-col gap-6 is-full sm:is-auto md:is-full sm:max-is-[400px] md:max-is-[unset] mbs-8 sm:mbs-11 md:mbs-0'>
          <Typography variant='h4'>Adventure starts here 🚀</Typography>
          {error && <Alert severity='error'>{error}</Alert>}
          <form noValidate autoComplete='off' onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-6'>
            <Controller
              name='full_name'
              control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  autoFocus
                  fullWidth
                  label='Full Name'
                  placeholder='Enter your full name'
                  error={!!errors.full_name}
                  helperText={errors.full_name?.message}
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
                  placeholder='Enter your email'
                  type='email'
                  error={!!errors.email}
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
                  label='Phone No.'
                  placeholder='213 (0)5 45 67 89 40'
                  type='text' // Pas 'number' pour éviter les flèches
                  onKeyPress={handlePhoneNumberKeyPress} // Filtre les touches
                  inputProps={{ pattern: '[0-9]*', inputMode: 'numeric' }} // Restreint à chiffres
                  slotProps={{
                    input: {
                      startAdornment: (
                        <InputAdornment position='start'>
                          <i className='tabler-phone' />
                        </InputAdornment>
                      )
                    }
                  }}
                  error={!!errors.phone_number}
                  helperText={errors.phone_number?.message}
                />
              )}
            />
            <Controller
              name='password'
              control={control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  fullWidth
                  label='Password'
                  placeholder='············'
                  type={isPasswordShown ? 'text' : 'password'}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position='end'>
                          <IconButton edge='end' onClick={handleClickShowPassword}>
                            <i className={isPasswordShown ? 'tabler-eye-off' : 'tabler-eye'} />
                          </IconButton>
                        </InputAdornment>
                      )
                    }
                  }}
                  error={!!errors.password}
                  helperText={errors.password?.message}
                />
              )}
            />
            <FormControlLabel
              control={<Checkbox />}
              label={
                <>
                  I agree to{' '}
                  <Link className='text-primary' href='/' onClick={e => e.preventDefault()}>
                    privacy policy & terms
                  </Link>
                </>
              }
            />
            <Button fullWidth variant='contained' type='submit' disabled={loading}>
              {loading ? 'Signing Up...' : 'Sign Up'}
            </Button>
            <div className='flex justify-center items-center flex-wrap gap-2'>
              <Typography>Already have an account?</Typography>
              <Typography component={Link} href={getLocalizedUrl('/login', locale)} color='primary.main'>
                Sign in instead
              </Typography>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Register
