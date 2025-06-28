'use client'

import { useState } from 'react'

import { Box, Typography, Tabs, Tab } from '@mui/material'
import { ShoppingBag, Briefcase, Building2 } from 'lucide-react'

import ServiceClientOrders from './ServiceClientOrders'
import ProductClientOrders from './ProductClientOrders'

// Tab panel component
const TabPanel = props => {
  const { children, value, index, ...other } = props

  return (
    <div
      role='tabpanel'
      hidden={value !== index}
      id={`orders-tabpanel-${index}`}
      aria-labelledby={`orders-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  )
}

// Main component
const ClientOrdersPage = () => {
  const [activeTab, setActiveTab] = useState(0)

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue)
  }

  return (
    <Box>
      <Typography variant='h5' sx={{ mb: 4 }}>
        My Orders
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label='order types tabs'>
          <Tab
            icon={<ShoppingBag size={18} />}
            iconPosition='start'
            label='Product Orders'
            id='orders-tab-0'
            aria-controls='orders-tabpanel-0'
          />
          <Tab
            icon={<Briefcase size={18} />}
            iconPosition='start'
            label='Service Orders'
            id='orders-tab-1'
            aria-controls='orders-tabpanel-1'
          />

        </Tabs>
      </Box>

      <TabPanel value={activeTab} index={0}>
        <ProductClientOrders />
      </TabPanel>
      <TabPanel value={activeTab} index={1}>
        <ServiceClientOrders />
      </TabPanel>

    </Box>
  )
}

export default ClientOrdersPage
