"use client"

import dynamic from "next/dynamic"

// Dynamically import components
const SpacesList = dynamic(() => import("@/views/apps/explore/spaces"), {
  ssr: false
})

const ExploreSpacesPage = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <SpacesList />
    </div>
  )
}

export default ExploreSpacesPage
