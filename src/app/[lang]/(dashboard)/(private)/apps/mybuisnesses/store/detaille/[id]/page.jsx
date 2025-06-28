// Next Imports
import dynamic from 'next/dynamic'

// Component Imports
import UserProfile from '@/views/apps/mybuisnesses/store'

// Data Imports
import { getProfileData } from '@/app/server/actions'

const AddproductTab = dynamic(() => import('@/views/apps/mybuisnesses/store/AddProduct'))
const SettingsTab = dynamic(() => import('@/views/apps/mybuisnesses/store/UpdateStore'))
const ListproductsTab = dynamic(() => import('@/views/apps/mybuisnesses/store/ProductList/page'))

// Vars
const tabContentList = data => ({
  addproduct: <AddproductTab storeId={data?.storeId} />,
  settings: <SettingsTab storeId={data?.storeId} />,
  Listproduct: <ListproductsTab storeId={data?.storeId} />
})

/**
 * ! If you need data using an API call, uncomment the below API code, update the `process.env.API_URL` variable in the
 * ! `.env` file found at root of your project and also update the API endpoints like `/pages/profile` in below example.
 * ! Also, remove the above server action import and the action itself from the `src/app/server/actions.ts` file to clean up unused code
 * ! because we've used the server action for getting our static data.
 */
/* const getProfileData = async (storeId) => {
  // Vars
  const res = await fetch(`${process.env.API_URL}/suppliers/${storeId}`)

  if (!res.ok) {
    throw new Error('Failed to fetch store data')
  }

  return res.json()
} */

// Profile page component that displays store details with tabs
export default async function ProfilePage({ params, searchParams }) {
  // Await params and searchParams to resolve dynamic properties
  const { id: storeId } = await params
  const { tab } = await searchParams

  // Fetch store data
  const data = await getProfileData(storeId)

  // Determine initial tab, default to Listproduct
  const initialTab = tab || 'Listproduct'

  // Add storeId to data for components
  const enhancedData = {
    ...data,
    storeId
  }

  return <UserProfile data={enhancedData} tabContentList={tabContentList(enhancedData)} initialTab={initialTab} />
}
