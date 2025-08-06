'use client'

import { useState, useEffect } from 'react'

import NextLink from 'next/link'

import { useParams } from 'next/navigation'

import { Box, Typography, Grid, Card, CardContent, Avatar, Rating, Chip, Button } from '@mui/material'

import { ArrowRight } from 'lucide-react'

import OptionMenu from '@core/components/option-menu'
import apiClient from '@/libs/api'

const STORAGE_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'

const RelatedProfiles = ({ currentProfileId, currentSkillDomain, currentSkills }) => {
  const { lang: locale } = useParams()
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchRelatedProfiles = async () => {
      setLoading(true)
      setError(null)

      try {
        const response = await apiClient.get('/service-providers')
        const providers = response.data.data || []

        console.log('Fetched providers:', providers)

        const scoredProfiles = providers
          .filter(provider => provider.id !== parseInt(currentProfileId))
          .map(provider => {
            let score = 0

            // Match skills
            const providerSkills = provider.skills?.map(skill => skill.name) || []
            const matchedSkills = providerSkills.filter(skill => currentSkills.includes(skill))

            score += matchedSkills.length * 5

            // Match skill domain (only if skills match, to prioritize skill commonality)
            if (matchedSkills.length > 0 && provider.skill_domain?.name === currentSkillDomain) {
              score += 10
            }

            return {
              provider,
              score,
              matchedSkills
            }
          })
          .filter(({ score }) => score > 0) // Only include profiles with skill matches
          .sort((a, b) => b.score - a.score) // Sort by score descending
          .slice(0, 3) // Take top 3
          .map(({ provider, matchedSkills }) => {
            // Calculate average rating and count from reviews array
            const reviews = provider.reviews || []
            const reviewCount = reviews.length

            const averageRating =
              reviewCount > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount : 0

            return {
              id: provider.id.toString(),
              name: provider.user?.full_name || `Provider ${provider.id}`,
              avatar:
                provider.pictures?.length > 0
                  ? `${STORAGE_BASE_URL}${provider.pictures[0].picture}`
                  : '/images/avatars/1.png',
              designation: provider.skill_domain?.name
                ? `${provider.skill_domain.name.replace(' Development', ' Developer')}`
                : 'Unknown',
              rating: averageRating,
              reviewCount: reviewCount,
              skills: (matchedSkills.length > 0 ? matchedSkills : provider.skills?.map(skill => skill.name).slice(0, 2))
                .slice(0, 2)
                .map(skill => ({
                  title: skill,
                  color: 'info'
                }))
            }
          })

        setProfiles(scoredProfiles)
        console.log('Related profiles:', scoredProfiles)
      } catch (error) {
        console.error('Fetch error:', error)
        setError(error.response?.data?.message || 'Failed to load related profiles')
      } finally {
        setLoading(false)
      }
    }

    if (currentSkills?.length > 0) {
      fetchRelatedProfiles()
    }
  }, [currentProfileId, currentSkillDomain, currentSkills])

  if (error) {
    return (
      <Box className='mb-6'>
        <Typography variant='h6' className='font-medium mb-4'>
          You might also like
        </Typography>
        <Typography variant='body1' color='error'>
          {error}
        </Typography>
      </Box>
    )
  }

  if (loading) {
    return (
      <Box className='mb-6'>
        <Typography variant='h6' className='font-medium mb-4'>
          You might also like
        </Typography>
        <Typography variant='body1'>Loading related profiles...</Typography>
      </Box>
    )
  }

  return (
    <Box className='mb-6'>
      <Box className='flex justify-between items-center mb-4'>
        <Typography variant='h6' className='font-medium'>
          You might also like
        </Typography>
        <Button variant='text' color='primary' endIcon={<ArrowRight size={18} />} className='text-sm'>
          View all
        </Button>
      </Box>

      <Grid container spacing={3}>
        {profiles.length > 0 ? (
          profiles.map(profile => (
            <Grid item xs={12} sm={6} md={4} key={profile.id}>
              <NextLink href={`/${locale}/apps/explore/skills/${profile.id}`} passHref>
                <Card
                  sx={{ cursor: 'pointer' }}
                  className='transition-all duration-300 hover:shadow-md hover:-translate-y-1'
                  onClick={e => {
                    const target = e.target.closest(
                      'button, a, [role="menuitem"], [role="button"], [role="menu"], .MuiMenu-root, .MuiIconButton-root, .option-menu-container'
                    )

                    if (target) {
                      e.stopPropagation()
                      console.log('Blocked navigation for:', target)
                    }
                  }}
                >
                  <CardContent className='text-center'>
                    <OptionMenu
                      iconClassName='text-textDisabled'
                      options={[
                        {
                          text: 'View Profile',
                          icon: 'tabler-user',
                          onClick: () => console.log(`View profile for ${profile.id}`)
                        },
                        {
                          text: 'Share Profile',
                          icon: 'tabler-share',
                          onClick: () => console.log(`Share profile for ${profile.id}`)
                        },
                        { divider: true },
                        {
                          text: 'Report',
                          icon: 'tabler-flag',
                          menuItemProps: {
                            className: 'text-error hover:bg-[var(--mui-palette-error-lightOpacity)]',
                            onClick: () => console.log(`Report profile for ${profile.id}`)
                          }
                        }
                      ]}
                      iconButtonProps={{
                        className: 'absolute top-4 end-4 text-textDisabled z-10 option-menu-container',
                        onClick: e => {
                          console.log('OptionMenu button clicked')
                        }
                      }}
                    />
                    <Avatar
                      src={profile.avatar}
                      alt={profile.name}
                      className='mx-auto mb-3 w-20 h-20 border-4 border-solid border-background'
                      sx={{ width: 80, height: 80 }}
                    />
                    <Typography variant='h6' className='font-medium'>
                      {profile.name}
                    </Typography>
                    <Typography variant='body2' className='text-textSecondary mb-2'>
                      {profile.designation}
                    </Typography>
                    <Box className='flex items-center justify-center gap-1 mb-3'>
                      <Rating value={profile.rating} precision={0.1} size='small' readOnly />
                      <Typography variant='body2' className='text-textSecondary'>
                        ({profile.reviewCount})
                      </Typography>
                    </Box>
                    <Box className='flex flex-wrap gap-2 justify-center mb-4'>
                      {profile.skills.map((skill, index) => (
                        <Chip key={index} label={skill.title} color={skill.color} size='small' variant='outlined' />
                      ))}
                    </Box>
                    <Button variant='outlined' color='primary' fullWidth>
                      View Profile
                    </Button>
                  </CardContent>
                </Card>
              </NextLink>
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Typography variant='body1' className='text-textSecondary'>
              No related profiles found.
            </Typography>
          </Grid>
        )}
      </Grid>
    </Box>
  )
}

export default RelatedProfiles
