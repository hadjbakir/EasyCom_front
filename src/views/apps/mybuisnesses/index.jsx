'use client'

// React Imports
import { useState, useEffect } from 'react'

// Next Imports
import { useParams, useRouter, useSearchParams } from 'next/navigation'

// MUI Imports
import Grid from '@mui/material/Grid2'
import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabPanel from '@mui/lab/TabPanel'

// Component Imports
import CustomTabList from '@core/components/mui/TabList'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

/**
 * UserProfile component - Main component for displaying user's business profile
 * @param {object} props - Component props
 * @param {object} props.data - Data from getProfileData
 * @param {object} props.tabContentList - Object containing tab content components
 */
const UserProfile = ({ data, tabContentList }) => {
  // Hooks
  const router = useRouter()
  const { lang: locale } = useParams()
  const searchParams = useSearchParams()

  // States
  const [activeTab, setActiveTab] = useState('mystores')

  // Set active tab from URL on mount
  useEffect(() => {
    const tab = searchParams.get('tab')

    if (tab && tabContentList[tab]) {
      setActiveTab(tab)
    }
  }, [searchParams, tabContentList])

  // Handle tab change
  const handleChange = (event, newValue) => {
    setActiveTab(newValue)

    // Update URL with tab parameter
    const url = getLocalizedUrl(`/apps/mybuisnesses?tab=${newValue}`, locale)

    router.push(url, { scroll: false })
  }

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }} className='flex flex-col gap-6'>
        <TabContext value={activeTab}>
          <CustomTabList onChange={handleChange} variant='scrollable' pill='true' aria-label='business-tabs'>
            <Tab
              value='mystores'
              label={
                <div className='flex items-center gap-1.5'>
                  <i className='tabler-building-store text-lg' />
                  My Stores
                </div>
              }
            />
            <Tab
              value='myskills'
              label={
                <div className='flex items-center gap-1.5'>
                  <i className='tabler-tool text-lg' />
                  My Skills
                </div>
              }
            />
            <Tab
              value='myservices'
              label={
                <div className='flex items-center gap-1.5'>
                  <i className='tabler-briefcase text-lg' />
                  My Services
                </div>
              }
            />
          </CustomTabList>
          <TabPanel value={activeTab} className='p-0'>
            {tabContentList[activeTab]}
          </TabPanel>
        </TabContext>
      </Grid>
    </Grid>
  )
}

export default UserProfile
