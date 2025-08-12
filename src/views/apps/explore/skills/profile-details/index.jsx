'use client'

import { useState, useEffect } from 'react'

import { useParams } from 'next/navigation'

import { Box, Typography } from '@mui/material'

import apiClient from '@/libs/api'
import ProfileHeader from './ProfileHeader'
import ProfileTabs from './ProfileTabs'
import RelatedProfiles from './RelatedProfiles'
import { buildAvatarUrl, buildImageUrl } from '@/utils/imageUtils'

const STORAGE_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

const ProfileDetails = ({ user }) => {
  const [profileData, setProfileData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const { id } = useParams()

  useEffect(() => {
    console.log('ProfileDetails user data:', user)
  }, [user])

  useEffect(() => {
    const fetchProfileAndPortfolio = async () => {
      setLoading(true)
      setError(null)

      console.log('ProfileDetails: User data:', {
        id: user?.id,
        email: user?.email,
        hasToken: !!user?.accessToken
      })

      try {
        // Fetch service provider profile
        const profileResponse = await apiClient.get(`/service-providers/${id}`)
        const provider = profileResponse.data.data

        console.log('ProfileDetails: Provider data:', provider)

        // Determine if the current user is the owner by comparing user IDs
        const isOwner = user?.id === provider.user_id

        console.log('ProfileDetails: Ownership check:', {
          isOwner,
          currentUserId: user?.id,
          providerUserId: provider.user_id
        })

        // Fetch portfolio data
        const portfolioResponse = await apiClient.get(`/service-providers/${id}/portfolio`)
        const { projects, service_provider_pictures } = portfolioResponse.data.data

        console.log('ProfileDetails: Portfolio data:', {
          projectsCount: projects.length,
          picturesCount: service_provider_pictures.length
        })

        // Use reviews from profile response
        const reviews = (provider.reviews || []).map(review => ({
          id: review.id.toString(),
          author: review.user?.full_name || `User ${review.user_id}`,
          avatar: buildAvatarUrl(review.user?.picture) || '/images/avatars/default.png',
          date: review.created_at
            ? new Date(review.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: '2-digit',
                year: 'numeric'
              })
            : 'Unknown',
          rating: review.rating,
          comment: review.comment,
          project: review.project || 'N/A',
          email: review.user?.email || `user${review.user_id}@example.com`,
          status: review.status || 'Published',
          reply: review.reply || null,
          replyUser: review.reply_user_id
            ? {
                name: review.reply_user?.full_name || `User ${review.reply_user_id}`,
                avatar: buildAvatarUrl(review.reply_user?.picture) || '/images/avatars/default.png'
              }
            : null
        }))

        console.log('ProfileDetails: Mapped reviews:', reviews)

        const profileData = {
          id: provider.id,
          name: provider.user?.full_name || `Provider ${provider.id}`,
          designation: provider.skill_domain?.name
            ? `${provider.skill_domain.name.replace(' Development', ' Developer')}`
            : 'Unknown',
          avatar:
            buildAvatarUrl(provider.user?.picture) ||
            (provider.pictures?.length > 0 ? buildImageUrl(provider.pictures[0].picture) : '/images/avatars/1.png'),
          about: provider.description || 'No description provided',
          startingPrice: provider.starting_price,
          email: provider.user?.email || '',
          phone_number: provider.user?.phone_number || '',
          address: provider.user?.address || '',
          city: provider.user?.city || '',
          chips: [...(provider.skills?.map(skill => ({ title: skill.name, color: 'info' })) || [])],
          rating: reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0,
          reviewCount: reviews.length,
          completedProjects: projects.length,
          languages: ['English'],
          responseTime: '24 hours',
          verified: true,
          featured: false,
          available: true,
          memberSince: provider.created_at
            ? new Date(provider.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
            : 'Unknown',
          skillDomain: provider.skill_domain?.name || '',
          skills: provider.skills?.map(skill => ({ id: skill.id, name: skill.name })) || [],
          mockSkills: [
            { title: 'UI Design', level: 95, color: 'primary' },
            { title: 'UX Research', level: 85, color: 'secondary' },
            { title: 'Wireframing', level: 90, color: 'success' },
            { title: 'Prototyping', level: 92, color: 'info' },
            { title: 'Illustration', level: 75, color: 'warning' }
          ],
          portfolio: {
            projects: projects.map(project => ({
              id: project.id.toString(),
              type: 'title',
              title: project.title || '',
              description: project.description || '',
              images: project.pictures.map(p => ({
                id: p.id,
                url: buildImageUrl(p.picture)
              })),
              created_at: project.created_at
            })),
            pictures:
              service_provider_pictures.length > 0
                ? [
                    {
                      id: 'simple-portfolio',
                      type: 'simple',
                      title: '',
                      description: '',
                      images: service_provider_pictures.map(p => ({
                        id: p.id,
                        url: buildImageUrl(p.picture)
                      })),
                      created_at: service_provider_pictures[0].created_at
                    }
                  ]
                : []
          },
          reviews,
          isOwner,
          providerUserId: provider.user_id
        }

        setProfileData(profileData)
        console.log('ProfileDetails: Mapped profile:', {
          id: profileData.id,
          name: profileData.name,
          isOwner: profileData.isOwner,
          providerUserId: profileData.providerUserId,
          reviewCount: profileData.reviewCount
        })
      } catch (error) {
        console.error('ProfileDetails: Fetch error:', {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data
        })
        setError(error.response?.data?.message || 'Failed to load provider profile')
      } finally {
        setLoading(false)
      }
    }

    if (id) fetchProfileAndPortfolio()
  }, [id, user])

  if (error) {
    return (
      <Box className='flex flex-col items-center justify-center py-12'>
        <Typography variant='body1' color='error'>
          {error}
        </Typography>
      </Box>
    )
  }

  if (loading || !profileData) {
    return (
      <Box className='flex flex-col items-center justify-center py-12'>
        <Typography variant='body1'>Loading provider profile...</Typography>
      </Box>
    )
  }

  return (
    <Box className='profile-details-container'>
      <ProfileHeader profile={profileData} />
      <ProfileTabs profile={profileData} user={user} providerUserId={profileData.providerUserId} />
      <RelatedProfiles
        currentProfileId={profileData.id}
        currentSkillDomain={profileData.skillDomain}
        currentSkills={profileData.skills.map(skill => skill.name)}
      />
    </Box>
  )
}

export default ProfileDetails
