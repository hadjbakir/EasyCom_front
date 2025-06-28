'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid2'
import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabPanel from '@mui/lab/TabPanel'

// Component Imports
import CustomTabList from '@core/components/mui/TabList'

const UserProfile = ({ tabContentList, data }) => {
  // States
  const [activeTab, setActiveTab] = useState('createstore')

  const handleChange = (event, value) => {
    setActiveTab(value)
  }

  return (
    <Grid container spacing={6}>

      {activeTab === undefined ? null : (
        <Grid size={{ xs: 12 }} className='flex flex-col gap-6'>
          <TabContext value={activeTab}>
            <CustomTabList onChange={handleChange} variant='scrollable' pill='true'>
              <Tab
                label={
                  <div className='flex items-center gap-1.5'>
                    <i className='tabler-user-check text-lg' />
                    Create Store
                  </div>
                }
                value='createstore'
              />
              <Tab
                label={
                  <div className='flex items-center gap-1.5'>
                    <i className='tabler-users text-lg' />
                    Create Skill
                  </div>
                }
                value='createskill'
              />
              <Tab
                label={
                  <div className='flex items-center gap-1.5'>
                    <i className='tabler-layout-grid text-lg' />
                    Create Service
                  </div>
                }
                value='createservice'
              />

            </CustomTabList>

            <TabPanel value={activeTab} className='p-0'>
              {tabContentList[activeTab]}
            </TabPanel>
          </TabContext>
        </Grid>
      )}
    </Grid>
  )
}

export default UserProfile
