'use client'

// Next Imports
import { useParams } from 'next/navigation'

// MUI Imports
import { useTheme } from '@mui/material/styles'
import { Box, Chip } from '@mui/material'

// Third-party Imports
import PerfectScrollbar from 'react-perfect-scrollbar'

// Component Imports
import { useSession } from 'next-auth/react'

import { Menu, MenuItem, MenuSection } from '@menu/vertical-menu'

// Hook Imports
import useVerticalNav from '@menu/hooks/useVerticalNav'

// Styled Component Imports
import StyledVerticalNavExpandIcon from '@menu/styles/vertical/StyledVerticalNavExpandIcon'

// Style Imports
import menuItemStyles from '@core/styles/vertical/menuItemStyles'
import menuSectionStyles from '@core/styles/vertical/menuSectionStyles'

// Data Imports
import navigationMenuData from '@/data/navigationMenuData'

const RenderExpandIcon = ({ open, transitionDuration }) => (
  <StyledVerticalNavExpandIcon open={open} transitionDuration={transitionDuration}>
    <i className='tabler-chevron-right' />
  </StyledVerticalNavExpandIcon>
)

// Perfect Clearance Menu Item Component
const ClearanceMenuItem = ({ href, children, locale }) => {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  return (
    <Box sx={{ position: 'relative', mb: 1 }}>
      <MenuItem
        href={href}
        icon={
          <Box
            sx={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 20,
              height: 20
            }}
          >
            {/* Using fire icon for hot deals/clearance */}
            <Box
              component='i'
              className='tabler-tag'
              sx={{
                fontSize: '18px',
                color: theme.palette.text.primary,
                display: 'block',
                lineHeight: 1
              }}
            />

            {/* Subtle notification dot */}
            <Box
              sx={{
                position: 'absolute',
                top: -2,
                right: -2,
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: isDark ? '#ff4500' : '#f44336',
                boxShadow: `0 0 0 2px ${theme.palette.background.paper}`
              }}
            />
          </Box>
        }
        sx={{
          position: 'relative',
          backgroundColor: isDark ? 'rgba(255, 140, 0, 0.08)' : 'rgba(230, 81, 0, 0.08)',
          border: `1px solid #ff0000`,
          borderRadius: '8px',
          mb: 1,
          transition: 'all 0.2s ease-in-out',
          minHeight: '48px', // Ensure minimum height for proper display

          '&:hover': {
            backgroundColor: isDark ? 'rgba(255, 140, 0, 0.12)' : 'rgba(230, 81, 0, 0.12)',
            borderColor: '#cc0000',
            transform: 'translateX(2px)',
            boxShadow: isDark ? '0 2px 8px rgba(255, 140, 0, 0.15)' : '0 2px 8px rgba(230, 81, 0, 0.15)'
          },

          '&:active': {
            transform: 'translateX(1px)'
          },

          '& .MuiListItemText-primary': {
            fontWeight: 600,
            color: isDark ? '#ff8c00' : '#e65100',
            whiteSpace: 'nowrap', // Prevent text wrapping
            overflow: 'visible', // Allow text to be fully visible
            textOverflow: 'clip' // Don't truncate text
          },

          '& .MuiListItemIcon-root': {
            minWidth: '40px', // Increase icon container width
            marginRight: '8px', // Reduce margin to save space
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start'
          },

          '& .MuiListItemText-root': {
            margin: 0,
            flex: '1 1 auto',
            minWidth: 0 // Allow text to shrink if needed
          }
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            gap: 1, // Reduce gap to save space
            pr: 1 // Add padding right
          }}
        >
          {/* Text container with proper flex properties */}
          <Box
            sx={{
              flex: '1 1 auto',
              minWidth: 0,
              overflow: 'visible',
              '& .MuiListItemText-primary': {
                fontSize: '0.875rem', // Slightly smaller font to fit better
                lineHeight: 1.2
              }
            }}
          >
            {children}
          </Box>

          {/* Badge with proper spacing */}
          <Box sx={{ flexShrink: 0 }}>
            <Chip
              label='SALE'
              size='small'
              sx={{
                height: '18px',
                fontSize: '9px',
                fontWeight: 'bold',
                backgroundColor: isDark ? '#ff4500' : '#f44336',
                color: 'white',
                borderRadius: '9px',
                minWidth: '28px',
                '& .MuiChip-label': {
                  px: 0.75
                }
              }}
            />
          </Box>
        </Box>
      </MenuItem>
    </Box>
  )
}

const VerticalMenu = ({ dictionary, scrollMenu }) => {
  // Hooks
  const theme = useTheme()
  const verticalNavOptions = useVerticalNav()
  const params = useParams()
  const { data: session } = useSession()
  const user = session?.user

  // Vars
  const { isBreakpointReached, transitionDuration } = verticalNavOptions
  const { lang: locale } = params
  const ScrollWrapper = isBreakpointReached ? 'div' : PerfectScrollbar

  return (
    <ScrollWrapper
      {...(isBreakpointReached
        ? {
            className: 'bs-full overflow-y-auto overflow-x-hidden',
            onScroll: container => scrollMenu(container, false)
          }
        : {
            options: { wheelPropagation: false, suppressScrollX: true },
            onScrollY: container => scrollMenu(container, true)
          })}
    >
      <Menu
        popoutMenuOffset={{ mainAxis: 23 }}
        menuItemStyles={menuItemStyles(verticalNavOptions, theme)}
        renderExpandIcon={({ open }) => <RenderExpandIcon open={open} transitionDuration={transitionDuration} />}
        renderExpandedMenuItemIcon={{ icon: <i className='tabler-circle text-xs' /> }}
        menuSectionStyles={menuSectionStyles(verticalNavOptions, theme)}
      >
        {navigationMenuData.map((item, index) => {
          if (item.isSection) {
            return <MenuSection key={index} label={item.title} />
          }

          if (item.isClearance) {
            return (
              <ClearanceMenuItem key={index} href={`/${locale}${item.href}`} locale={locale}>
                {item.title}
              </ClearanceMenuItem>
            )
          }

          return (
            <MenuItem
              key={index}
              href={item.excludeLang ? item.href : `/${locale}${item.href}`}
              icon={<i className={item.icon} />}
            >
              {item.title}
            </MenuItem>
          )
        })}
      </Menu>
    </ScrollWrapper>
  )
}

export default VerticalMenu
