'use client'

// React Imports
import { useRouter } from 'next/navigation'

import { useSession } from 'next-auth/react'

// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'

// Component Imports
import StoreListTable from '@/views/apps/mybuisnesses/MyStores/StoreListTable'

/**
 * StoreListPage component - Displays a list of user's stores
 * @returns {JSX.Element} - Rendered component
 */
const StoreListPage = () => {
  // Hooks
  const { data: session, status } = useSession()
  const router = useRouter()

  // Redirect to login if unauthenticated
  if (status === 'unauthenticated') {
    router.push('/login')

    return null
  }

  return (
    <Card>
      <CardContent>
        <Typography variant='h4' className='mb-6'>
          My Stores
        </Typography>
        <StoreListTable />
      </CardContent>
    </Card>
  )
}

export default StoreListPage
