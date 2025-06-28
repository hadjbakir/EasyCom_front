'use client'

import { useParams } from 'next/navigation'
import dynamic from 'next/dynamic'

import { useSession } from 'next-auth/react'

// Dynamically import components
const SpaceDetails = dynamic(() => import('@/views/apps/explore/spaces/space-details'), {
  ssr: false
})

const SpaceDetailsPage = () => {
  const params = useParams()
  const { data: session } = useSession()

  return (
    <div className='max-w-7xl mx-auto px-4 py-8'>
      <SpaceDetails id={params.id} user={session?.user} />
    </div>
  )
}

export default SpaceDetailsPage
