"use client"

import { useEffect, useState, useMemo } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Box, Typography, Card, CardContent, Grid, IconButton, Skeleton, useTheme } from "@mui/material"
import {
  People,
  Store,
  LocationOn,
  Timeline,
  Refresh,
  DataUsage,
  Work,
  Category,
  Language,
  TrendingUp,
  Shield,
  Settings,
  Analytics,
} from "@mui/icons-material"
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"
import apiClient from "@/libs/api"

const AdminWelcomeSection = ({ user }) => {
  const [greeting, setGreeting] = useState("")
  const theme = useTheme()
  const isDark = theme.palette.mode === "dark"

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour < 12) setGreeting("Good morning")
    else if (hour < 18) setGreeting("Good afternoon")
    else setGreeting("Good evening")
  }, [])

  const backgroundPattern = {
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='0.4'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3Ccircle cx='27' cy='7' r='1'/%3E%3Ccircle cx='47' cy='7' r='1'/%3E%3Ccircle cx='7' cy='27' r='1'/%3E%3Ccircle cx='27' cy='27' r='1'/%3E%3Ccircle cx='47' cy='27' r='1'/%3E%3Ccircle cx='7' cy='47' r='1'/%3E%3Ccircle cx='27' cy='47' r='1'/%3E%3Ccircle cx='47' cy='47' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
  }

  const styles = isDark
    ? {
        container:
          "relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 text-white shadow-2xl border border-slate-600/30",
        backgroundPattern: "absolute inset-0 opacity-5",
        content: "relative p-8 md:p-12",
        title: "text-3xl md:text-4xl font-bold mb-4 text-slate-100",
        description: "text-lg md:text-xl text-slate-200 mb-8 max-w-2xl",
        button:
          "flex items-center px-6 py-3 bg-slate-700/50 hover:bg-slate-600/50 text-slate-100 border border-slate-500/30 backdrop-blur-sm rounded-lg transition-all duration-300 font-medium",
      }
    : {
        container:
          "relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-600 via-blue-600 to-purple-700 text-white shadow-2xl",
        backgroundPattern: "absolute inset-0 opacity-10",
        content: "relative p-8 md:p-12",
        title: "text-3xl md:text-4xl font-bold mb-4 text-white",
        description: "text-lg md:text-xl text-white/90 mb-8 max-w-2xl",
        button:
          "flex items-center px-6 py-3 bg-white/20 hover:bg-white/30 text-white border border-white/20 backdrop-blur-sm rounded-lg transition-all duration-300 font-medium",
      }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mb-8"
    >
      <div className={styles.container}>
        <div className={styles.backgroundPattern}>
          <div className="absolute inset-0" style={backgroundPattern}></div>
        </div>

        <div className="absolute top-4 right-4 opacity-20">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          >
            <Shield className="h-8 w-8" />
          </motion.div>
        </div>

        <div className={styles.content}>
          <div className="max-w-4xl">
            <motion.h1
              className={styles.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              {greeting}, Admin {user?.name || "Administrator"} ! 👋
            </motion.h1>

            <motion.p
              className={styles.description}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              Welcome to your administrative control center. Monitor platform performance, manage resources, and oversee
              system operations.
            </motion.p>

            <motion.div
              className="flex flex-wrap gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <button className={styles.button}>
                <Analytics className="mr-2 h-4 w-4" />
                View Reports
              </button>
              <button className={styles.button}>
                <Settings className="mr-2 h-4 w-4" />
                System Settings
              </button>
              <button className={styles.button}>
                <People className="mr-2 h-4 w-4" />
                User Management
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

const AdminStatCard = ({ title, value, icon, color, loading, index }) => {
  const theme = useTheme()
  const isDark = theme.palette.mode === "dark"

  const styles = isDark
    ? {
        container:
          "h-full border border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-slate-800/80 to-slate-900/80 group rounded-2xl backdrop-blur-sm",
        title: "text-sm font-medium text-slate-300 group-hover:text-slate-200 transition-colors",
        value: "text-3xl font-bold transition-all duration-300 text-slate-100",
        iconWrapper: "p-3 rounded-full transition-all duration-300 group-hover:scale-110 border border-slate-600/30",
      }
    : {
        container:
          "h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-gray-50/50 group rounded-2xl",
        title: "text-sm font-medium text-gray-600 group-hover:text-gray-700 transition-colors",
        value: "text-3xl font-bold transition-all duration-300",
        iconWrapper: "p-3 rounded-full transition-all duration-300 group-hover:scale-110",
      }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className="p-6">
          <div className="flex items-center space-x-4">
            <Skeleton variant="circular" width={48} height={48} />
            <div className="space-y-2 flex-1">
              <Skeleton variant="text" width="80%" height={20} />
              <Skeleton variant="text" width="40%" height={30} />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="h-full"
    >
      <div className={styles.container}>
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2 flex-1">
              <p className={styles.title}>{title}</p>
              <div className="flex items-center space-x-2">
                <p className={styles.value} style={{ color }}>
                  {value.toLocaleString()}
                </p>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 + 0.3, type: "spring" }}
                >
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </motion.div>
              </div>
            </div>
            <motion.div
              className={styles.iconWrapper}
              style={{ backgroundColor: `${color}15` }}
              whileHover={{ rotate: 5 }}
            >
              <div style={{ color }}>{icon}</div>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

const UltraModernAdminDashboard = () => {
  const { data: session } = useSession()
  const user = session?.user
  const router = useRouter()
  const theme = useTheme()
  const isDark = theme.palette.mode === "dark"

  // States
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("30d")
  const [refreshing, setRefreshing] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())

  // Dashboard data state
  const [dashboardData, setDashboardData] = useState({
    overview: {
      totalUsers: 0,
      activeStores: 0,
      totalProducts: 0,
      totalSkills: 0,
      totalWorkspaces: 0,
      totalCategories: 0,
      totalDomains: 0,
      totalServiceProviders: 0,
    },
  })

  // Auth check
  useEffect(() => {
    if (user && user.role?.toLowerCase() !== "admin") {
      router.replace("/")
    }
  }, [user, router])

  // Update current time
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Fetch dynamic data
  useEffect(() => {
    const fetchData = async () => {
      if (user?.role?.toLowerCase() === "admin") {
        setLoading(true)
        try {
          const [
            suppliersRes,
            productsRes,
            skillsRes,
            workspacesStudioRes,
            workspacesCoworkingRes,
            categoriesRes,
            domainsRes,
            serviceProvidersRes,
          ] = await Promise.all([
            apiClient.get("/suppliers"),
            apiClient.get("/products"),
            apiClient.get("/skills"),
            apiClient.get("/workspaces/type/studio"),
            apiClient.get("/workspaces/type/coworking"),
            apiClient.get("/categories"),
            apiClient.get("/domains"),
            apiClient.get("/service-providers"),
          ])

          const suppliers = suppliersRes.data
          const products = productsRes.data
          const skills = skillsRes.data
          const workspacesStudio = workspacesStudioRes.data
          const workspacesCoworking = workspacesCoworkingRes.data
          const categories = categoriesRes.data
          const domains = domainsRes.data
          const serviceProviders = serviceProvidersRes.data

          const usersCount = (serviceProviders?.data?.length || 0) + (suppliers?.data?.length || 0)
          setDashboardData((prev) => ({
            ...prev,
            overview: {
              ...prev.overview,
              totalUsers: usersCount,
              activeStores: suppliers?.data?.length || 0,
              totalProducts: products?.data?.length || 0,
              totalSkills: skills?.data?.length || 0,
              totalWorkspaces: (workspacesStudio?.data?.length || 0) + (workspacesCoworking?.data?.length || 0),
              totalCategories: categories?.data?.length || 0,
              totalDomains: domains?.data?.length || 0,
              totalServiceProviders: serviceProviders?.data?.length || 0,
            },
          }))
        } catch (err) {
          console.error("Error loading admin stats:", err)
        } finally {
          setLoading(false)
        }
      }
    }
    fetchData()
  }, [user])

  const handleRefresh = async () => {
    setRefreshing(true)
    if (user?.role?.toLowerCase() === "admin") {
      try {
        const [
          suppliersRes,
          productsRes,
          skillsRes,
          workspacesStudioRes,
          workspacesCoworkingRes,
          categoriesRes,
          domainsRes,
          serviceProvidersRes,
        ] = await Promise.all([
          apiClient.get("/suppliers"),
          apiClient.get("/products"),
          apiClient.get("/skills"),
          apiClient.get("/workspaces/type/studio"),
          apiClient.get("/workspaces/type/coworking"),
          apiClient.get("/categories"),
          apiClient.get("/domains"),
          apiClient.get("/service-providers"),
        ])

        const suppliers = suppliersRes.data
        const products = productsRes.data
        const skills = skillsRes.data
        const workspacesStudio = workspacesStudioRes.data
        const workspacesCoworking = workspacesCoworkingRes.data
        const categories = categoriesRes.data
        const domains = domainsRes.data
        const serviceProviders = serviceProvidersRes.data

        const usersCount = (serviceProviders?.data?.length || 0) + (suppliers?.data?.length || 0)
        setDashboardData((prev) => ({
          ...prev,
          overview: {
            ...prev.overview,
            totalUsers: usersCount,
            activeStores: suppliers?.data?.length || 0,
            totalProducts: products?.data?.length || 0,
            totalSkills: skills?.data?.length || 0,
            totalWorkspaces: (workspacesStudio?.data?.length || 0) + (workspacesCoworking?.data?.length || 0),
            totalCategories: categories?.data?.length || 0,
            totalDomains: domains?.data?.length || 0,
            totalServiceProviders: serviceProvidersRes.data?.length || 0,
          },
        }))
      } catch (err) {
        console.error("Error refreshing admin stats:", err)
      }
    }
    setRefreshing(false)
  }

  // Admin statistics cards
  const adminStats = useMemo(
    () => [
      {
        title: "Total Suppliers",
        value: dashboardData.overview.activeStores,
        icon: <Store className="h-6 w-6" />,
        color: "#ec4899",
      },
      {
        title: "Total Products",
        value: dashboardData.overview.totalProducts,
        icon: <DataUsage className="h-6 w-6" />,
        color: "#06b6d4",
      },
      {
        title: "Skills Available",
        value: dashboardData.overview.totalSkills,
        icon: <Timeline className="h-6 w-6" />,
        color: "#8b5cf6",
      },
      {
        title: "Workspaces",
        value: dashboardData.overview.totalWorkspaces,
        icon: <LocationOn className="h-6 w-6" />,
        color: "#10b981",
      },
      {
        title: "Categories",
        value: dashboardData.overview.totalCategories,
        icon: <Category className="h-6 w-6" />,
        color: "#f59e0b",
      },
      {
        title: "Domains",
        value: dashboardData.overview.totalDomains,
        icon: <Language className="h-6 w-6" />,
        color: "#6366f1",
      },
      {
        title: "Service Providers",
        value: dashboardData.overview.totalServiceProviders,
        icon: <Work className="h-6 w-6" />,
        color: "#14b8a6",
      },
      {
        title: "Total Users",
        value: dashboardData.overview.totalUsers,
        icon: <People className="h-6 w-6" />,
        color: "#8b5cf6",
      },
    ],
    [dashboardData],
  )

  // Chart data for pie chart
  const pieChartData = useMemo(() => {
    const data = [
      { name: "Suppliers", value: dashboardData.overview.activeStores, color: "#ec4899" },
      { name: "Service Providers", value: dashboardData.overview.totalServiceProviders, color: "#14b8a6" },
      { name: "Products", value: dashboardData.overview.totalProducts, color: "#06b6d4" },
      { name: "Skills", value: dashboardData.overview.totalSkills, color: "#8b5cf6" },
      { name: "Workspaces", value: dashboardData.overview.totalWorkspaces, color: "#10b981" },
      { name: "Categories", value: dashboardData.overview.totalCategories, color: "#f59e0b" },
      { name: "Domains", value: dashboardData.overview.totalDomains, color: "#6366f1" },
    ]
    return data.filter((item) => item.value > 0)
  }, [dashboardData])

  // Bar chart data
  const barData = useMemo(
    () => [
      {
        name: "Platform Resources",
        suppliers: dashboardData.overview.activeStores,
        providers: dashboardData.overview.totalServiceProviders,
        products: dashboardData.overview.totalProducts,
        skills: dashboardData.overview.totalSkills,
      },
    ],
    [dashboardData],
  )

  const titleStyles = isDark ? "text-2xl font-bold text-slate-100" : "text-2xl font-bold text-gray-900"
  const dividerStyles = isDark
    ? "h-1 flex-1 bg-gradient-to-r from-slate-600 to-transparent ml-6 rounded-full"
    : "h-1 flex-1 bg-gradient-to-r from-blue-200 to-transparent ml-6 rounded-full"

  if (!user || user.role?.toLowerCase() !== "admin") return null

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <Box className="min-h-screen p-4 md:p-6" sx={{ backgroundColor: "transparent" }}>
        {/* Admin Welcome Section */}
        <AdminWelcomeSection user={user} />

        {/* Statistics Section */}
        <div className="mb-8">
          <motion.h2
            className={titleStyles}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            Platform Statistics
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
            {adminStats.map((stat, index) => (
              <AdminStatCard
                key={stat.title}
                title={stat.title}
                value={stat.value}
                icon={stat.icon}
                color={stat.color}
                loading={loading}
                index={index}
              />
            ))}
          </div>
        </div>

        {/* Charts Section */}
        <div className="space-y-6 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-between"
          >
            <h2 className={titleStyles}>Analytics Overview</h2>
            <div className={dividerStyles}></div>
          </motion.div>

          <Grid container spacing={3}>
            {/* Bar Chart */}
            <Grid item xs={12} lg={8}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
              >
                <Card
                  sx={{
                    borderRadius: "20px",
                    backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
                    backdropFilter: "blur(10px)",
                    border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.1)",
                    boxShadow: isDark ? "0 8px 32px rgba(0,0,0,0.3)" : "0 8px 32px rgba(0,0,0,0.1)",
                  }}
                >
                  <CardContent className="p-6">
                    <Typography variant="h6" className="font-bold mb-6">
                      Platform Resources Distribution
                    </Typography>
                    <ResponsiveContainer width="100%" height={350}>
                      <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke={isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}
                        />
                        <XAxis dataKey="name" stroke={isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)"} />
                        <YAxis stroke={isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)"} />
                        <RechartsTooltip
                          contentStyle={{
                            backgroundColor: isDark ? "rgba(0,0,0,0.8)" : "rgba(255,255,255,0.8)",
                            border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.1)",
                            borderRadius: "12px",
                            backdropFilter: "blur(10px)",
                          }}
                        />
                        <Legend />
                        <Bar dataKey="suppliers" fill="#ec4899" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="providers" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="products" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="skills" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>

            {/* Pie Chart */}
            <Grid item xs={12} lg={4}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <Card
                  sx={{
                    borderRadius: "20px",
                    backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
                    backdropFilter: "blur(10px)",
                    border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.1)",
                    boxShadow: isDark ? "0 8px 32px rgba(0,0,0,0.3)" : "0 8px 32px rgba(0,0,0,0.1)",
                  }}
                >
                  <CardContent className="p-6">
                    <Typography variant="h6" className="font-bold mb-6">
                      Data Distribution
                    </Typography>
                    <ResponsiveContainer width="100%" height={350}>
                      <RechartsPieChart>
                        <Pie
                          data={pieChartData}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          innerRadius={40}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {pieChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip
                          contentStyle={{
                            backgroundColor: isDark ? "rgba(0,0,0,0.8)" : "rgba(255,255,255,0.8)",
                            border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.1)",
                            borderRadius: "12px",
                            backdropFilter: "blur(10px)",
                          }}
                        />
                        <Legend />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          </Grid>
        </div>

        {/* Admin Controls Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Card
            sx={{
              borderRadius: "20px",
              backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
              backdropFilter: "blur(10px)",
              border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid rgba(0,0,0,0.1)",
              boxShadow: isDark ? "0 8px 32px rgba(0,0,0,0.3)" : "0 8px 32px rgba(0,0,0,0.1)",
            }}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <Typography variant="h6" className="font-bold">
                  Platform Summary
                </Typography>
                <IconButton
                  onClick={handleRefresh}
                  disabled={refreshing}
                  sx={{
                    backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
                    "&:hover": {
                      backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
                    },
                  }}
                >
                  <Refresh className={refreshing ? "animate-spin" : ""} />
                </IconButton>
              </div>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="body1" color="text.secondary" className="mb-2">
                    <strong>Total active resources:</strong>{" "}
                    {(
                      dashboardData.overview.activeStores +
                      dashboardData.overview.totalServiceProviders +
                      dashboardData.overview.totalProducts +
                      dashboardData.overview.totalSkills
                    ).toLocaleString()}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" className="mb-2">
                    <strong>Platform users:</strong> {dashboardData.overview.totalUsers.toLocaleString()}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body1" color="text.secondary" className="mb-2">
                    <strong>Spaces and categories:</strong>{" "}
                    {(
                      dashboardData.overview.totalWorkspaces +
                      dashboardData.overview.totalCategories +
                      dashboardData.overview.totalDomains
                    ).toLocaleString()}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    <strong>Last updated:</strong> {currentTime.toLocaleString()}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </motion.div>
      </Box>
    </motion.div>
  )
}

export default UltraModernAdminDashboard
