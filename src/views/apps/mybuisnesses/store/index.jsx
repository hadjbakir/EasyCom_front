'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid2'
import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabPanel from '@mui/lab/TabPanel'

// Component Imports
import UserProfileHeader from './UserProfileHeader'
import CustomTabList from '@core/components/mui/TabList'
import StoreOrders from './StoreOrders'
import ReviewsTab from './ReviewsTab'

const UserProfile = ({ tabContentList, data, initialTab = 'Listproduct' }) => {
  // States
  const [activeTab, setActiveTab] = useState(initialTab)

  const handleChange = (event, value) => {
    setActiveTab(value)
  }

  return (
    <Grid container spacing={6}>
      <Grid size={{ xs: 12 }}>
        <UserProfileHeader data={data} />
      </Grid>
      {activeTab === undefined ? null : (
        <Grid size={{ xs: 12 }} className='flex flex-col gap-6'>
          <TabContext value={activeTab}>
            <CustomTabList onChange={handleChange} variant='scrollable' pill='true'>
              <Tab
                label={
                  <div className='flex items-center gap-1.5'>
                    <i className='tabler-layout-grid text-lg' />
                    List product
                  </div>
                }
                value='Listproduct'
              />
              <Tab
                label={
                  <div className='flex items-center gap-1.5'>
                    <i className='tabler-user-check text-lg' />
                    Add product
                  </div>
                }
                value='addproduct'
              />
              <Tab
                label={
                  <div className='flex items-center gap-1.5'>
                    <i className='tabler-users text-lg' />
                    Settings
                  </div>
                }
                value='settings'
              />
              <Tab
                label={
                  <div className='flex items-center gap-1.5'>
                    <i className='tabler-layout-grid text-lg' />
                    Orders
                  </div>
                }
                value='orders'
              />
              <Tab
                label={
                  <div className='flex items-center gap-1.5'>
                    <i className='tabler-message-circle text-lg' />
                    Reviews
                  </div>
                }
                value='reviews'
              />
            </CustomTabList>

            <TabPanel value={activeTab} className='p-0'>
              {activeTab === 'orders' ? (
                <StoreOrders storeId={parseInt(data?.storeId)} />
              ) : activeTab === 'reviews' ? (
                <ReviewsTab storeId={parseInt(data?.storeId)} />
              ) : (
                tabContentList[activeTab]
              )}
            </TabPanel>
          </TabContext>
        </Grid>
      )}
    </Grid>
  )
}

export default UserProfile
