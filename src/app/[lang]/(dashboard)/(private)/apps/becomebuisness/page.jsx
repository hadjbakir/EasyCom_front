// Next Imports
import dynamic from "next/dynamic"

// Component Imports
import UserProfile from "@/views/apps/become-buisness"

// Data Imports
import { getProfileData } from "@/app/server/actions"

// Dynamic Imports for Tab Components
const StoreTab = dynamic(() => import("@/views/apps/become-buisness/CreateStore"))
const SkillTab = dynamic(() => import("@/views/apps/become-buisness/CreateSkill"))
const ServiceTab = dynamic(() => import("@/views/apps/become-buisness/CreateService/rent"))

// Vars
const tabContentList = (data) => ({
  createstore: <StoreTab />,
  createskill: <SkillTab />,
  createservice: <ServiceTab />,
})

const ProfilePage = async () => {
  // Vars
  const data = await getProfileData()

  return <UserProfile data={data} tabContentList={tabContentList(data)} />
}

export default ProfilePage
