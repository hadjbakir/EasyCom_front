// Next Imports
import dynamic from 'next/dynamic'

// Component Imports
import UserProfile from '@/views/apps/mybuisnesses'

// Data Imports
import { getProfileData } from '@/app/server/actions'

// Importation directe du composant MyStores pour éviter les problèmes de chargement dynamique
import StoresTab from '@/views/apps/mybuisnesses/MyStores'

// Chargement dynamique des autres composants d'onglets
const SkillsTab = dynamic(() => import('@/views/apps/mybuisnesses/MySkills'))
const ServicesTab = dynamic(() => import('@/views/apps/mybuisnesses/MyServices'))

// Définition du contenu des onglets
const tabContentList = data => ({
  mystores: <StoresTab data={data} />,
  myskills: <SkillsTab data={data} />,
  myservices: <ServicesTab data={data} />
})

/**
 * ! If you need data using an API call, uncomment the below API code, update the `process.env.API_URL` variable in the
 * ! `.env` file found at root of your project and also update the API endpoints like `/pages/profile` in below example.
 * ! Also, remove the above server action import and the action itself from the `src/app/server/actions.ts` file to clean up unused code
 * ! because we've used the server action for getting our static data.
 */
/* const getProfileData = async () => {
  // Vars
  const res = await fetch(`${process.env.API_URL}/pages/profile`)

  if (!res.ok) {
    throw new Error('Failed to fetch profileData')
  }

  return res.json()
} */

const MyBusinessesPage = async () => {
  // Vars
  const data = await getProfileData()

  return <UserProfile data={data} tabContentList={tabContentList(data)} />
}

export default MyBusinessesPage
