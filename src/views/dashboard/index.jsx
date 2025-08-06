'use client'

import { useState, useEffect } from 'react'

import { useRouter, useParams } from 'next/navigation'

import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { Store, ShoppingBag, Briefcase, Building2 } from 'lucide-react'
import { useTheme } from '@mui/material/styles'

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  PieChart as RechartsPieChart,
  Pie,
  Cell
} from 'recharts'
import { Card, CardContent, Typography, Grid } from '@mui/material'

import apiClient from '@/libs/api'

import WelcomeSection from './WelcomeSection'
import StatisticsSection from './StatisticsSection'
import NavigationCard from './NavigationCard'

const Dashboard = () => {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const locale = params?.lang || 'en'
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)

        // Appels API pour stats générales
        const [
          productsRes,
          skillsRes,
          workspacesStudioRes,
          workspacesCoworkingRes,
          suppliersRes,
          serviceProvidersRes,
          categoriesRes,
          domainsRes
        ] = await Promise.all([
          apiClient.get('/products'),
          apiClient.get('/skills'),
          apiClient.get('/workspaces/type/studio'),
          apiClient.get('/workspaces/type/coworking'),
          apiClient.get('/suppliers'),
          apiClient.get('/service-providers'),
          apiClient.get('/categories'),
          apiClient.get('/domains')
        ])

        const statsGeneral = {
          totalProducts: productsRes.data?.data?.length || 0,
          totalSkills: skillsRes.data?.data?.length || 0,
          totalWorkspaces:
            (workspacesStudioRes.data?.data?.length || 0) + (workspacesCoworkingRes.data?.data?.length || 0),
          totalStudios: workspacesStudioRes.data?.data?.length || 0,
          totalCoworkings: workspacesCoworkingRes.data?.data?.length || 0,
          totalSuppliers: suppliersRes.data?.data?.length || 0,
          totalServiceProviders: serviceProvidersRes.data?.data?.length || 0,
          totalCategories: categoriesRes.data?.data?.length || 0,
          totalDomains: domainsRes.data?.data?.length || 0
        }

        setStats(statsGeneral)
        setLoading(false)
      } catch (err) {
        console.error('Error fetching dashboard data:', err)
        setError('Failed to load platform statistics. Please try again later.')
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  // Light Mode Styles
  const lightModeStyles = {
    errorContainer: 'border border-red-200 bg-red-50 rounded-lg p-4',
    errorText: 'text-red-800',
    title: 'text-2xl font-bold text-gray-900',
    divider: 'h-1 flex-1 bg-gradient-to-r from-blue-200 to-transparent ml-6 rounded-full',
    skeletonElements: 'bg-gray-200 animate-pulse'
  }

  // Dark Mode Styles
  const darkModeStyles = {
    errorContainer: 'border border-red-500/30 bg-red-500/10 rounded-lg p-4 backdrop-blur-sm',
    errorText: 'text-red-400',
    title: 'text-2xl font-bold text-slate-100',
    divider: 'h-1 flex-1 bg-gradient-to-r from-slate-600 to-transparent ml-6 rounded-full',
    skeletonElements: 'bg-slate-700 animate-pulse'
  }

  const styles = isDark ? darkModeStyles : lightModeStyles

  if (status === 'loading') {
    return (
      <div className='space-y-6'>
        <div className={`h-48 w-full rounded-xl ${styles.skeletonElements}`}></div>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className={`h-32 rounded-xl ${styles.skeletonElements}`}></div>
          ))}
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className={`h-64 rounded-xl ${styles.skeletonElements}`}></div>
          ))}
        </div>
        <div className={`h-96 w-full rounded-xl ${styles.skeletonElements}`}></div>
      </div>
    )
  }

  // Section charts dynamique
  const chartData = [
    {
      name: 'Platform',
      Products: stats?.totalProducts || 0,
      Skills: stats?.totalSkills || 0,
      Workspaces: stats?.totalWorkspaces || 0,
      Studios: stats?.totalStudios || 0,
      Suppliers: stats?.totalSuppliers || 0,
      ServiceProviders: stats?.totalServiceProviders || 0,
      Categories: stats?.totalCategories || 0,
      Domains: stats?.totalDomains || 0
    }
  ]

  const pieData = [
    { name: 'Products', value: stats?.totalProducts || 0, color: '#10B981' },
    { name: 'Skills', value: stats?.totalSkills || 0, color: '#8B5CF6' },
    { name: 'Workspaces', value: stats?.totalWorkspaces || 0, color: '#3B82F6' },
    { name: 'Studios', value: stats?.totalStudios || 0, color: '#0ea5e9' },
    { name: 'Suppliers', value: stats?.totalSuppliers || 0, color: '#F59E0B' },
    { name: 'Service Providers', value: stats?.totalServiceProviders || 0, color: '#6366f1' },
    { name: 'Categories', value: stats?.totalCategories || 0, color: '#f59e0b' },
    { name: 'Domains', value: stats?.totalDomains || 0, color: '#14b8a6' }
  ].filter(item => item.value > 0)

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      {error && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className='p-6'>
          <div className={styles.errorContainer}>
            <p className={styles.errorText}>{error}</p>
          </div>
        </motion.div>
      )}

      <WelcomeSection user={session?.user} />

      <StatisticsSection stats={stats} loading={loading} />

      <div className='space-y-6 mb-8'>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className='flex items-center justify-between'
        >
          <h2 className={styles.title}>Quick Access</h2>
          <div className={styles.divider}></div>
        </motion.div>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <NavigationCard
              title='Become Business'
              description='Register your business and start selling products or services'
              icon={<Briefcase className='h-6 w-6' />}
              linkText='Get Started'
              linkHref={`/${locale}/apps/becomebuisness`}
              color='#10B981'
              loading={loading}
              imageSrc='/images/dashboard/business.jpg'
              clickable
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <NavigationCard
              title='Explore Products'
              description='Discover and shop for products from various stores'
              icon={<ShoppingBag className='h-6 w-6' />}
              linkText='Shop Now'
              linkHref={`/${locale}/apps/explore/products-and-stores`}
              color='#3B82F6'
              loading={loading}
              imageSrc='/images/dashboard/products.jpg'
              clickable
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <NavigationCard
              title='Explore Skills'
              description='Find skilled professionals for your projects'
              icon={<Store className='h-6 w-6' />}
              linkText='Find Skills'
              linkHref={`/${locale}/apps/explore/skills`}
              color='#F59E0B'
              loading={loading}
              imageSrc='/images/dashboard/skills.jpg'
              clickable
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <NavigationCard
              title='Explore Workspaces'
              description='Book coworking spaces and studios for your work'
              icon={<Building2 className='h-6 w-6' />}
              linkText='Find Spaces'
              linkHref={`/${locale}/apps/explore/spaces`}
              color='#8B5CF6'
              loading={loading}
              imageSrc='/images/dashboard/workspaces.jpg'
              clickable
            />
          </motion.div>
        </div>
      </div>

      {/* Charts Section */}
      <div className='space-y-6 mb-8'>
        <div className='flex items-center justify-between'>
          <h2 className={styles.title}>Platform Overview</h2>
          <div className={styles.divider}></div>
        </div>
        <Grid container spacing={3}>
          {/* Bar Chart */}
          <Grid item xs={12} lg={8}>
            <Card
              sx={{
                borderRadius: '20px',
                backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                backdropFilter: 'blur(10px)',
                border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
                boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.3)' : '0 8px 32px rgba(0,0,0,0.1)'
              }}
            >
              <CardContent className='p-6'>
                <Typography variant='h6' className='font-bold mb-6'>
                  Platform Resources Distribution
                </Typography>
                <ResponsiveContainer width='100%' height={350}>
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid
                      strokeDasharray='3 3'
                      stroke={isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}
                    />
                    <XAxis dataKey='name' stroke={isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)'} />
                    <YAxis stroke={isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)'} />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.8)',
                        border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
                        borderRadius: '12px',
                        backdropFilter: 'blur(10px)'
                      }}
                    />
                    <Legend />
                    <Bar dataKey='Products' fill='#10B981' radius={[4, 4, 0, 0]} />
                    <Bar dataKey='Skills' fill='#8B5CF6' radius={[4, 4, 0, 0]} />
                    <Bar dataKey='Workspaces' fill='#3B82F6' radius={[4, 4, 0, 0]} />
                    <Bar dataKey='Studios' fill='#0ea5e9' radius={[4, 4, 0, 0]} />
                    <Bar dataKey='Suppliers' fill='#F59E0B' radius={[4, 4, 0, 0]} />
                    <Bar dataKey='ServiceProviders' fill='#6366f1' radius={[4, 4, 0, 0]} />
                    <Bar dataKey='Categories' fill='#f59e0b' radius={[4, 4, 0, 0]} />
                    <Bar dataKey='Domains' fill='#14b8a6' radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
          {/* Pie Chart */}
          <Grid item xs={12} lg={4}>
            <Card
              sx={{
                borderRadius: '20px',
                backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                backdropFilter: 'blur(10px)',
                border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
                boxShadow: isDark ? '0 8px 32px rgba(0,0,0,0.3)' : '0 8px 32px rgba(0,0,0,0.1)'
              }}
            >
              <CardContent className='p-6'>
                <Typography variant='h6' className='font-bold mb-6'>
                  Data Distribution
                </Typography>
                <ResponsiveContainer width='100%' height={350}>
                  <RechartsPieChart>
                    <Pie
                      data={pieData}
                      cx='50%'
                      cy='50%'
                      outerRadius={100}
                      innerRadius={40}
                      paddingAngle={5}
                      dataKey='value'
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.8)',
                        border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
                        borderRadius: '12px',
                        backdropFilter: 'blur(10px)'
                      }}
                    />
                    <Legend />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </div>
    </motion.div>
  )
}

export default Dashboard
