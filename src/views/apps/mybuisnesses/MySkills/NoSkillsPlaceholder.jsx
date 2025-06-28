"use client"

import { useState } from "react"

import { useParams } from 'next/navigation'

import { useRouter } from "next/navigation"

import Link from "next/link"

import { Card, CardContent, Typography, Button, Box, Alert, CircularProgress } from "@mui/material"

import { Plus } from "lucide-react"



import { useSession } from "next-auth/react"

import apiClient from "@/libs/api"



const NoSkillsPlaceholder = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const router = useRouter()
  const { data: session } = useSession()
  const params = useParams()

  const { lang: locale } = params

  const handleCreateSkill = async () => {
    if (!session?.user?.id) {
      setError("You must be logged in to create a skill")

      return
    }

    setLoading(true)
    setError(null)

    try {
      // Create a basic service provider entry
      const formData = new FormData()

      formData.append("user_id", session.user.id)
      formData.append("description", "Professional service provider")

      // You might need to add a default skill domain ID if required by your API
      formData.append("skill_domain_id", "1")

      await apiClient.post("/service-providers", formData)

      // Refresh the page to show the new skill
      window.location.reload()
    } catch (error) {
      console.error("Error creating skill:", error)
      setError(error.response?.data?.message || "Failed to create skill")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardContent className="text-center py-10">
        <Box className="flex flex-col items-center">
          <Typography variant="h5" className="mb-2">
            No Skill Profile Found
          </Typography>
          <Typography variant="body1" color="textSecondary" className="mb-6 max-w-md mx-auto">
            You haven&apos;t created a skill profile yet. Create one to showcase your expertise and start receiving service
            requests.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Plus size={20} />}
            component={Link}
            href={`/${locale}/apps/becomebuisness?tab=createskill`}
          >
            Create Skill Profile
          </Button>
        </Box>
      </CardContent>
    </Card>
  )
}

export default NoSkillsPlaceholder
