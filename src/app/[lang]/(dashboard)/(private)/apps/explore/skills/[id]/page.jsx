'use client'

import { useParams } from 'next/navigation'
import dynamic from 'next/dynamic'

import { useSession } from 'next-auth/react'

// Dynamically import components
const ProfileDetails = dynamic(() => import('@/views/apps/explore/skills/profile-details'), {
  ssr: false
})

const SkillProfilePage = () => {
  const params = useParams()
  const { data: session, status } = useSession()

  // Show loading state while session is being fetched
  if (status === 'loading') {
    return (
      <div className='max-w-7xl mx-auto px-4 py-8'>
        <div>Loading...</div>
      </div>
    )
  }

  return (
    <div className='max-w-7xl mx-auto px-4 py-8'>
      <ProfileDetails id={params.id} user={session?.user} />
    </div>
  )
}

export default SkillProfilePage
