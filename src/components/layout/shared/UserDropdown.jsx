'use client'

// Third-party Imports
import { useRef, useState, useEffect } from 'react'

import { useRouter, useParams } from 'next/navigation'

import { styled } from '@mui/material/styles'
import Badge from '@mui/material/Badge'
import Avatar from '@mui/material/Avatar'
import Popper from '@mui/material/Popper'
import Fade from '@mui/material/Fade'
import Paper from '@mui/material/Paper'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import MenuList from '@mui/material/MenuList'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import MenuItem from '@mui/material/MenuItem'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'

// Next Imports
import { signOut, useSession } from 'next-auth/react'

// Context Imports
import { useUser } from '@/contexts/UserContext'

// Hook Imports
import { useSettings } from '@core/hooks/useSettings'

// Import apiClient
import apiClient from '@/libs/api'

// Import getLocalizedUrl
import { getLocalizedUrl } from '@/utils/i18n'

// Vars
// Base URL for static files (e.g., images), defaults to backend domain if not set in .env
const STORAGE_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

// Function to build image URL
const buildImageUrl = picture => {
  if (!picture) {
    console.log('No picture provided, using default avatar')

    return '/images/avatars/1.png'
  }

  if (picture.startsWith('http')) {
    console.log('Picture is already an absolute URL:', picture)

    return picture
  }

  // Nettoyer le chemin en supprimant les préfixes storage/ ou public/ et les slashes en début
  const cleanPath = picture.replace(/^(\/+)?(storage\/|public\/)?/g, '')
  const url = `${STORAGE_BASE_URL}/storage/${cleanPath}`

  console.log('Constructed image URL:', url)

  return url
}

// Styled component for badge content
const BadgeContentSpan = styled('span')({
  width: 8,
  height: 8,
  borderRadius: '50%',
  cursor: 'pointer',
  backgroundColor: 'var(--mui-palette-success-main)',
  boxShadow: '0 0 0 2px var(--mui-palette-background-paper)'
})

const UserDropdown = () => {
  // States
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Refs
  const anchorRef = useRef(null)

  // Hooks
  const router = useRouter()
  const { data: session, status } = useSession()
  const { settings } = useSettings()
  const { user } = useUser()
  const { lang: locale } = useParams()

  // Effect to manage loading state based on session status
  useEffect(() => {
    if (status === 'loading') {
      setIsLoading(true)
    } else if (status === 'authenticated' && session?.user) {
      setIsLoading(false)
    } else {
      setIsLoading(false)
    }
  }, [status, session])

  // Handler to toggle dropdown
  const handleDropdownOpen = () => {
    setOpen(prev => !prev)
  }

  // Handler to close dropdown and optionally navigate
  const handleDropdownClose = (event, url) => {
    if (url) {
      router.push(getLocalizedUrl(url, locale))
    }

    if (anchorRef.current && anchorRef.current.contains(event?.target)) {
      return
    }

    setOpen(false)
  }

  // Handler to log out user
  const handleUserLogout = async () => {
    try {
      await apiClient.post('/logout')
      console.log('Déconnexion backend réussie')
    } catch (error) {
      console.error('Erreur lors du logout backend :', error?.response?.data || error.message)
    } finally {
      await signOut({ callbackUrl: process.env.NEXT_PUBLIC_APP_LOGIN_URL })
    }
  }

  // Use session data if context user is not yet available
  const displayUser = user || session?.user

  console.log('Display user:', displayUser)

  // Construct image URL
  const imageSrc = buildImageUrl(displayUser?.picture)

  // Render loading state while session is initializing
  if (isLoading) {
    return (
      <Badge
        overlap='circular'
        badgeContent={<BadgeContentSpan />}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        className='mis-2'
      >
        <Avatar className='bs-[38px] is-[38px]'>
          <CircularProgress size={20} />
        </Avatar>
      </Badge>
    )
  }

  return (
    <>
      <Badge
        ref={anchorRef}
        overlap='circular'
        badgeContent={<BadgeContentSpan onClick={handleDropdownOpen} />}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        className='mis-2'
      >
        <Avatar
          ref={anchorRef}
          alt={displayUser?.fullName || 'User'}
          src={imageSrc}
          onClick={handleDropdownOpen}
          onError={() => {
            console.error('Avatar image failed to load:', imageSrc)

            return '/images/avatars/1.png'
          }}
          className='cursor-pointer bs-[38px] is-[38px]'
        />
      </Badge>
      <Popper
        open={open}
        transition
        disablePortal
        placement='bottom-end'
        anchorEl={anchorRef.current}
        className='min-is-[240px] !mbs-3 z-[1]'
      >
        {({ TransitionProps, placement }) => (
          <Fade
            {...TransitionProps}
            style={{
              transformOrigin: placement === 'bottom-end' ? 'right top' : 'left top'
            }}
          >
            <Paper className={settings.skin === 'bordered' ? 'border shadow-none' : 'shadow-lg'}>
              <ClickAwayListener onClickAway={e => handleDropdownClose(e)}>
                <MenuList>
                  <div className='flex items-center plb-2 pli-6 gap-2' tabIndex={-1}>
                    <Avatar
                      alt={displayUser?.fullName || 'User'}
                      src={imageSrc}
                      onError={() => {
                        console.error('Dropdown avatar image failed to load:', imageSrc)

                        return '/images/avatars/1.png'
                      }}
                    />
                    <div className='flex items-start flex-col'>
                      <Typography className='font-medium' color='text.primary'>
                        {displayUser?.fullName || 'User'}
                      </Typography>
                      <Typography variant='caption'>{displayUser?.email || ''}</Typography>
                    </div>
                  </div>
                  <Divider className='mlb-1' />
                  <MenuItem className='mli-2 gap-3' onClick={e => handleDropdownClose(e, '/pages/account-settings')}>
                    <i className='tabler-settings' />
                    <Typography color='text.primary'>Settings</Typography>
                  </MenuItem>
                  <MenuItem className='mli-2 gap-3' onClick={e => handleDropdownClose(e, '/orders')}>
                    <i className='tabler-basket-down' />
                    <Typography color='text.primary'>My Orders</Typography>
                  </MenuItem>
                  <div className='flex items-center plb-2 pli-3'>
                    <Button
                      fullWidth
                      variant='contained'
                      color='error'
                      size='small'
                      endIcon={<i className='tabler-logout' />}
                      onClick={handleUserLogout}
                      sx={{ '& .MuiButton-endIcon': { marginInlineStart: 1.5 } }}
                    >
                      Logout
                    </Button>
                  </div>
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>
    </>
  )
}

export default UserDropdown
