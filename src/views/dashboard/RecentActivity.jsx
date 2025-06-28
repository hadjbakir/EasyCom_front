"use client"

import { motion } from "framer-motion"
import { ShoppingBag, User, Package, Building, Clock, ArrowRight, Award, Calendar } from "lucide-react"
import { useTheme } from "@mui/material/styles"

const getActivityIcon = (type) => {
  switch (type) {
    case "order":
      return <ShoppingBag className="h-4 w-4" />
    case "user":
      return <User className="h-4 w-4" />
    case "product":
      return <Package className="h-4 w-4" />
    case "space":
      return <Building className="h-4 w-4" />
    case "booking":
      return <Calendar className="h-4 w-4" />
    case "skill":
      return <Award className="h-4 w-4" />
    default:
      return <Clock className="h-4 w-4" />
  }
}

const getActivityColor = (type, isDark) => {
  const lightColors = {
    order: "bg-green-100 text-green-600 border-green-200",
    user: "bg-blue-100 text-blue-600 border-blue-200",
    product: "bg-orange-100 text-orange-600 border-orange-200",
    space: "bg-purple-100 text-purple-600 border-purple-200",
    booking: "bg-amber-100 text-amber-600 border-amber-200",
    skill: "bg-indigo-100 text-indigo-600 border-indigo-200",
    default: "bg-gray-100 text-gray-600 border-gray-200",
  }

  const darkColors = {
    order: "bg-green-900/30 text-green-400 border-green-700/50",
    user: "bg-blue-900/30 text-blue-400 border-blue-700/50",
    product: "bg-orange-900/30 text-orange-400 border-orange-700/50",
    space: "bg-purple-900/30 text-purple-400 border-purple-700/50",
    booking: "bg-amber-900/30 text-amber-400 border-amber-700/50",
    skill: "bg-indigo-900/30 text-indigo-400 border-indigo-700/50",
    default: "bg-slate-800/30 text-slate-400 border-slate-700/50",
  }

  const colors = isDark ? darkColors : lightColors
  return colors[type] || colors.default
}

const RecentActivity = ({ activities, loading }) => {
  const theme = useTheme()
  const isDark = theme.palette.mode === "dark"

  // Light Mode Styles
  const lightModeStyles = {
    container: "border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl bg-white",
    header: "flex flex-row items-center justify-between p-6 pb-4 border-b border-gray-200/50",
    title: "text-xl font-bold text-gray-900",
    viewAllButton:
      "flex items-center text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors",
    activityItem:
      "flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-all duration-200 cursor-pointer group",
    activityTitle: "text-sm font-medium text-gray-900 truncate group-hover:text-gray-700 transition-colors",
    activityTime: "text-xs text-gray-500 group-hover:text-gray-600 transition-colors",
    emptyIcon: "h-12 w-12 text-gray-400 mx-auto mb-4",
    emptyText: "text-gray-500 text-sm",
    skeleton: "border-0 shadow-lg rounded-2xl bg-white",
    skeletonElements: "bg-gray-200 animate-pulse",
  }

  // Dark Mode Styles
  const darkModeStyles = {
    container:
      "border border-slate-700/50 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl bg-slate-800/80 backdrop-blur-sm",
    header: "flex flex-row items-center justify-between p-6 pb-4 border-b border-slate-700/50",
    title: "text-xl font-bold text-slate-100",
    viewAllButton:
      "flex items-center text-blue-400 hover:text-blue-300 hover:bg-slate-700/50 px-3 py-2 rounded-lg transition-colors",
    activityItem:
      "flex items-center space-x-4 p-3 rounded-lg hover:bg-slate-700/30 transition-all duration-200 cursor-pointer group",
    activityTitle: "text-sm font-medium text-slate-100 truncate group-hover:text-slate-50 transition-colors",
    activityTime: "text-xs text-slate-400 group-hover:text-slate-300 transition-colors",
    emptyIcon: "h-12 w-12 text-slate-500 mx-auto mb-4",
    emptyText: "text-slate-400 text-sm",
    skeleton: "border border-slate-700/50 shadow-lg rounded-2xl bg-slate-800/80 backdrop-blur-sm",
    skeletonElements: "bg-slate-700 animate-pulse",
  }

  const styles = isDark ? darkModeStyles : lightModeStyles

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className={styles.skeleton}>
          <div className="p-6 border-b border-slate-700/50">
            <h3 className={isDark ? "text-xl font-bold text-slate-100" : "text-xl font-bold text-gray-900"}>
              Recent Activity
            </h3>
          </div>
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="flex items-center space-x-4 p-3">
                <div className={`h-10 w-10 rounded-full ${styles.skeletonElements}`}></div>
                <div className="space-y-2 flex-1">
                  <div className={`h-4 w-3/4 ${styles.skeletonElements} rounded`}></div>
                  <div className={`h-3 w-1/2 ${styles.skeletonElements} rounded`}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className={styles.container}>
        <div className={styles.header}>
          <h3 className={styles.title}>Recent Activity</h3>
          <button className={styles.viewAllButton}>
            View All
            <ArrowRight className="ml-2 h-4 w-4" />
          </button>
        </div>

        <div className="p-6 pt-0">
          {activities && activities.length > 0 ? (
            <div className="space-y-2">
              {activities.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                  whileHover={{ x: 4 }}
                  className={styles.activityItem}
                >
                  <div
                    className={`h-10 w-10 border-2 rounded-full flex items-center justify-center ${getActivityColor(activity.type, isDark)} transition-all duration-200 group-hover:scale-110`}
                  >
                    {getActivityIcon(activity.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className={styles.activityTitle}>{activity.title}</p>
                    <p className={styles.activityTime}>{activity.time}</p>
                  </div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ArrowRight className={`h-4 w-4 ${isDark ? "text-slate-500" : "text-gray-400"}`} />
                  </motion.div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.2 }}>
                <Clock className={styles.emptyIcon} />
              </motion.div>
              <p className={styles.emptyText}>No recent activity to display</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default RecentActivity
