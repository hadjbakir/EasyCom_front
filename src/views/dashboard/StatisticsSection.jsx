"use client"

import { motion } from "framer-motion"
import { ShoppingCart, Bookmark, Calendar, Award, TrendingUp } from "lucide-react"
import { useTheme } from "@mui/material/styles"

const StatCard = ({ title, value, icon, color, loading, index }) => {
  const theme = useTheme()
  const isDark = theme.palette.mode === "dark"

  // Light Mode Styles
  const lightModeStyles = {
    container:
      "h-full border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-white to-gray-50/50 group rounded-2xl",
    title: "text-sm font-medium text-gray-600 group-hover:text-gray-700 transition-colors",
    value: "text-3xl font-bold transition-all duration-300",
    iconWrapper: "p-3 rounded-full transition-all duration-300 group-hover:scale-110",
    skeleton: "h-full border-0 shadow-lg rounded-2xl bg-white",
    skeletonElements: "bg-gray-200 animate-pulse",
  }

  // Dark Mode Styles
  const darkModeStyles = {
    container:
      "h-full border border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-slate-800/80 to-slate-900/80 group rounded-2xl backdrop-blur-sm",
    title: "text-sm font-medium text-slate-300 group-hover:text-slate-200 transition-colors",
    value: "text-3xl font-bold transition-all duration-300 text-slate-100",
    iconWrapper: "p-3 rounded-full transition-all duration-300 group-hover:scale-110 border border-slate-600/30",
    skeleton: "h-full border border-slate-700/50 shadow-lg rounded-2xl bg-slate-800/80 backdrop-blur-sm",
    skeletonElements: "bg-slate-700 animate-pulse",
  }

  const styles = isDark ? darkModeStyles : lightModeStyles

  if (loading) {
    return (
      <div className={styles.skeleton}>
        <div className="p-6">
          <div className="flex items-center space-x-4">
            <div className={`h-12 w-12 rounded-full ${styles.skeletonElements}`}></div>
            <div className="space-y-2 flex-1">
              <div className={`h-4 w-20 rounded ${styles.skeletonElements}`}></div>
              <div className={`h-8 w-16 rounded ${styles.skeletonElements}`}></div>
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

const StatisticsSection = ({ stats, loading }) => {
  const theme = useTheme()
  const isDark = theme.palette.mode === "dark"

  const titleStyles = isDark ? "text-2xl font-bold mb-6 text-slate-100" : "text-2xl font-bold mb-6 text-gray-900"

  const statCards = [
    {
      title: "Total Products",
      value: stats?.totalProducts || 0,
      icon: <ShoppingCart className="h-6 w-6" />,
      color: "#10B981",
    },
    {
      title: "Total Skills",
      value: stats?.totalSkills || 0,
      icon: <Award className="h-6 w-6" />,
      color: "#8B5CF6",
    },
    {
      title: "Total Workspaces",
      value: stats?.totalWorkspaces || 0,
      icon: <Bookmark className="h-6 w-6" />,
      color: "#3B82F6",
    },
    {
      title: "Total Suppliers",
      value: stats?.totalSuppliers || 0,
      icon: <TrendingUp className="h-6 w-6" />,
      color: "#F59E0B",
    },
    {
      title: "Total Service Providers",
      value: stats?.totalServiceProviders || 0,
      icon: <Calendar className="h-6 w-6" />,
      color: "#6366f1",
    },
    {
      title: "Total Categories",
      value: stats?.totalCategories || 0,
      icon: <Bookmark className="h-6 w-6" />,
      color: "#f59e0b",
    },
    {
      title: "Total Domains",
      value: stats?.totalDomains || 0,
      icon: <Award className="h-6 w-6" />,
      color: "#14b8a6",
    },
    {
      title: "Total Studios",
      value: stats?.totalStudios || 0,
      icon: <Calendar className="h-6 w-6" />,
      color: "#0ea5e9",
    },
  ]

  return (
    <div className="mb-8">
      <motion.h2
        className={titleStyles}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        Your Activity
      </motion.h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <StatCard
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
  )
}

export default StatisticsSection
