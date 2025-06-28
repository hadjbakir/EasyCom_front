'use client'

// React Imports
import { useRef, useState, useEffect } from 'react'

// MUI Imports
import IconButton from '@mui/material/IconButton'
import Badge from '@mui/material/Badge'
import Popper from '@mui/material/Popper'
import Fade from '@mui/material/Fade'
import Paper from '@mui/material/Paper'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import Typography from '@mui/material/Typography'
import Chip from '@mui/material/Chip'
import Tooltip from '@mui/material/Tooltip'
import Divider from '@mui/material/Divider'
import Avatar from '@mui/material/Avatar'
import useMediaQuery from '@mui/material/useMediaQuery'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'

// Third Party Components
import classnames from 'classnames'
import PerfectScrollbar from 'react-perfect-scrollbar'

// Component Imports
import { useTheme } from '@mui/material/styles'

import CustomAvatar from '@core/components/mui/Avatar'

// Config Imports
import themeConfig from '@configs/themeConfig'

// Hook Imports
import { useSettings } from '@core/hooks/useSettings'

// Util Imports
import { getInitials } from '@/utils/getInitials'

// API Import
import apiClient from '@/libs/api'

// Add STORAGE_BASE_URL definition at the top
const STORAGE_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

const ScrollWrapper = ({ children, hidden }) => {
  if (hidden) {
    return <div className='overflow-x-hidden bs-full'>{children}</div>
  } else {
    return (
      <PerfectScrollbar className='bs-full' options={{ wheelPropagation: false, suppressScrollX: true }}>
        {children}
      </PerfectScrollbar>
    )
  }
}

const getAvatar = params => {
  const { avatarImage, avatarIcon, avatarText, title, avatarColor, avatarSkin } = params

  if (avatarImage) {
    return <Avatar src={avatarImage} />
  } else if (avatarIcon) {
    return (
      <CustomAvatar color={avatarColor} skin={avatarSkin || 'light-static'}>
        <i className={avatarIcon} />
      </CustomAvatar>
    )
  } else {
    return (
      <CustomAvatar color={avatarColor} skin={avatarSkin || 'light-static'}>
        {avatarText || getInitials(title)}
      </CustomAvatar>
    )
  }
}

const getNotificationIcon = (type = 'order') => {
  switch (type) {
    case 'order':
      return 'tabler-shopping-cart'
    case 'payment':
      return 'tabler-credit-card'
    case 'message':
      return 'tabler-message-circle'
    case 'alert':
      return 'tabler-alert-circle'
    default:
      return 'tabler-bell'
  }
}

const getNotificationColor = (type = 'order') => {
  switch (type) {
    case 'order':
      return 'success'
    case 'payment':
      return 'info'
    case 'message':
      return 'primary'
    case 'alert':
      return 'warning'
    default:
      return 'secondary'
  }
}

const formatTimeAgo = timestamp => {
  if (!timestamp) return 'Just now'

  const now = new Date()
  const time = new Date(timestamp)
  const diffInMinutes = Math.floor((now - time) / (1000 * 60))

  if (diffInMinutes < 1) return 'Just now'
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`

  return `${Math.floor(diffInMinutes / 1440)}d ago`
}

const NotificationDropdown = () => {
  // States
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Refs
  const anchorRef = useRef(null)
  const ref = useRef(null)

  // Hooks
  const hidden = useMediaQuery(theme => theme.breakpoints.down('lg'))
  const isSmallScreen = useMediaQuery(theme => theme.breakpoints.down('sm'))
  const { settings } = useSettings()
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  // Light Mode Styles
  const lightModeStyles = {
    paper: 'bg-white',
    notification: 'hover:bg-gray-50 bg-white border-gray-200/50',
    unread: 'bg-blue-50',
    textPrimary: 'text-gray-900',
    textSecondary: 'text-gray-700',
    divider: 'border-gray-200/50',
    emptyIcon: 'text-gray-400',
    emptyText: 'text-gray-500'
  }

  // Dark Mode Styles
  const darkModeStyles = {
    paper: 'bg-slate-800/80 backdrop-blur-sm border-slate-700/50',
    notification: 'hover:bg-slate-700/30 bg-slate-800 border-slate-700/50',
    unread: 'bg-blue-900/30',
    textPrimary: 'text-slate-100',
    textSecondary: 'text-slate-300',
    divider: 'border-slate-700/50',
    emptyIcon: 'text-slate-500',
    emptyText: 'text-slate-400'
  }

  const styles = isDark ? darkModeStyles : lightModeStyles

  // Fetch notifications from API
  const fetchNotifications = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiClient.get('/notifications')

      console.log('Fetched notifications:', response.data)

      // Expecting response.data.data as array of notifications
      if (response.data && response.data.data) {
        setNotifications(response.data.data)
      } else {
        setNotifications([])
      }
    } catch (err) {
      setError('Failed to load notifications')
      setNotifications([])
    } finally {
      setLoading(false)
    }
  }

  // Fetch notifications when component mounts or dropdown opens
  useEffect(() => {
    if (open) {
      fetchNotifications()
    }
  }, [open])

  const handleClose = () => {
    setOpen(false)
  }

  const handleToggle = () => {
    setOpen(prevOpen => !prevOpen)
  }

  const markAsRead = async notificationId => {
    try {
      // Optional: Call API to mark as read
      // await apiClient.patch(`/notifications/${notificationId}/read`)

      // Update local state
      setNotifications(prev =>
        prev.map(notification => (notification.id === notificationId ? { ...notification, read: true } : notification))
      )
    } catch (err) {
      console.error('Failed to mark notification as read:', err)
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <>
      <IconButton ref={anchorRef} onClick={handleToggle} className={styles.textPrimary}>
        <Badge
          color='error'
          className='cursor-pointer'
          variant='dot'
          overlap='circular'
          invisible={unreadCount === 0}
          sx={{
            '& .MuiBadge-dot': { top: 6, right: 5, boxShadow: 'var(--mui-palette-background-paper) 0px 0px 0px 2px' }
          }}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <i className='tabler-bell' />
        </Badge>
      </IconButton>
      <Popper
        open={open}
        transition
        disablePortal
        placement='bottom-end'
        ref={ref}
        anchorEl={anchorRef.current}
        {...(isSmallScreen
          ? {
              className: 'is-full !mbs-3 z-[1] max-bs-[550px] bs-[550px]',
              modifiers: [
                {
                  name: 'preventOverflow',
                  options: {
                    padding: themeConfig.layoutPadding
                  }
                }
              ]
            }
          : { className: 'is-96 !mbs-3 z-[1] max-bs-[550px] bs-[550px]' })}
      >
        {({ TransitionProps, placement }) => (
          <Fade {...TransitionProps} style={{ transformOrigin: placement === 'bottom-end' ? 'right top' : 'left top' }}>
            <Paper
              className={classnames(
                'bs-full',
                styles.paper,
                settings.skin === 'bordered' ? 'border shadow-none' : 'shadow-lg'
              )}
            >
              <ClickAwayListener onClickAway={handleClose}>
                <div className='bs-full flex flex-col'>
                  <div className='flex items-center justify-between plb-3.5 pli-4 is-full gap-2'>
                    <Typography variant='h6' className={classnames('flex-auto', styles.textPrimary)}>
                      Notifications
                    </Typography>
                    {unreadCount > 0 && (
                      <Chip label={`${unreadCount} new`} size='small' color='primary' variant='filled' />
                    )}
                  </div>
                  <Divider className={styles.divider} />
                  <ScrollWrapper hidden={hidden}>
                    {loading ? (
                      <div className='flex items-center justify-center p-8'>
                        <CircularProgress size={24} />
                        <Typography variant='body2' className='ml-2'>
                          Loading notifications...
                        </Typography>
                      </div>
                    ) : error ? (
                      <div className='flex items-center justify-center p-8'>
                        <Typography variant='body2' color='error'>
                          {error}
                        </Typography>
                        <Button size='small' onClick={fetchNotifications} className='ml-2'>
                          Retry
                        </Button>
                      </div>
                    ) : notifications.length === 0 ? (
                      <Box className='flex flex-col items-center justify-center p-8 text-center'>
                        <i className={classnames('tabler-bell-off text-4xl mb-4', styles.emptyIcon)} />
                        <Typography variant='body2' className={styles.emptyText}>
                          No notifications yet
                        </Typography>
                      </Box>
                    ) : (
                      notifications.map((notification, index) => {
                        const fullName =
                          notification.full_name ||
                          (notification.data && notification.data.full_name) ||
                          'Unknown Customer'

                        const notificationType = notification.type || 'order'
                        const orderId = notification.data?.order_id || notification.order_id
                        const amount = notification.data?.amount || notification.amount
                        const timestamp = notification.created_at || notification.timestamp

                        // Avatar logic
                        let avatarSrc = '/images/avatars/1.png'

                        if (notification.picture) {
                          avatarSrc = `${STORAGE_BASE_URL}${notification.picture}`
                        }

                        console.log('avatarSrc:',avatarSrc)

                        return (
                          <div
                            key={notification.id || index}
                            className={classnames(
                              'flex plb-4 pli-4 gap-3 transition-colors cursor-pointer relative border-be group',
                              styles.notification,
                              { [styles.unread]: !notification.read },
                              { [styles.divider]: index !== notifications.length - 1 }
                            )}
                            onClick={() => markAsRead(notification.id)}
                          >
                            {/* Unread indicator */}
                            {!notification.read && (
                              <div className='absolute left-2 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-blue-500 rounded-full' />
                            )}

                            {/* Notification Icon */}
                            <div className='flex-shrink-0'>
                              <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }} src={avatarSrc}>
                                {getInitials(fullName)}
                              </Avatar>
                            </div>

                            {/* Content */}
                            <div className='flex flex-col flex-auto min-w-0'>
                              {/* Header with customer info */}
                              <Box className='flex items-center gap-2 mb-1'>
                                <Typography
                                  variant='subtitle2'
                                  className={classnames('font-medium', styles.textPrimary)}
                                >
                                  {fullName}
                                </Typography>
                                {timestamp && (
                                  <Typography variant='caption' className={classnames('ml-auto', styles.textSecondary)}>
                                    <i className='tabler-clock text-xs mr-1' />
                                    {formatTimeAgo(timestamp)}
                                  </Typography>
                                )}
                              </Box>

                              {/* Main message */}
                              <Typography variant='body2' className={classnames('mb-2', styles.textSecondary)}>
                                {notificationType === 'order'
                                  ? `Placed a new order${orderId ? ` (${orderId})` : ''}`
                                  : notification.message || 'New notification'}
                              </Typography>

                              {/* Order details */}
                              {(orderId || amount) && (
                                <Stack direction='row' spacing={2} className='mt-1'>
                                  {orderId && (
                                    <Chip label={`Order: ${orderId}`} size='small' variant='outlined' color='primary' />
                                  )}
                                  {amount && (
                                    <Chip
                                      label={`$${Number.parseFloat(amount).toFixed(2)}`}
                                      size='small'
                                      color='success'
                                      variant='filled'
                                    />
                                  )}
                                </Stack>
                              )}
                            </div>

                            {/* Action button */}
                            <div className='flex-shrink-0 flex items-start'>
                              <Tooltip title='Mark as read'>
                                <IconButton
                                  size='small'
                                  className='opacity-0 group-hover:opacity-100 transition-opacity'
                                  onClick={e => {
                                    e.stopPropagation()
                                    markAsRead(notification.id)
                                  }}
                                >
                                  <i className='tabler-check text-sm' />
                                </IconButton>
                              </Tooltip>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </ScrollWrapper>

                  {/* Footer */}
                  {notifications.length > 0 && (
                    <>
                      <Divider className={styles.divider} />
                      <Box className='p-3'>
                        <Button fullWidth variant='text' size='small' onClick={handleClose}>
                          Close
                        </Button>
                      </Box>
                    </>
                  )}
                </div>
              </ClickAwayListener>
            </Paper>
          </Fade>
        )}
      </Popper>
    </>
  )
}

export default NotificationDropdown
