'use client'

import { useState, useEffect } from 'react'

import { motion } from 'framer-motion'
import { Search, Bell, Calendar, Sparkles } from 'lucide-react'
import { useTheme } from '@mui/material/styles'

const WelcomeSection = ({ user }) => {
  const [greeting, setGreeting] = useState('')
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  useEffect(() => {
    const hour = new Date().getHours()

    if (hour < 12) setGreeting('Good morning')
    else if (hour < 18) setGreeting('Good afternoon')
    else setGreeting('Good evening')
  }, [])

  const backgroundPattern = {
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23ffffff' fillOpacity='0.4'%3E%3Ccircle cx='7' cy='7' r='1'/%3E%3Ccircle cx='27' cy='7' r='1'/%3E%3Ccircle cx='47' cy='7' r='1'/%3E%3Ccircle cx='7' cy='27' r='1'/%3E%3Ccircle cx='27' cy='27' r='1'/%3E%3Ccircle cx='47' cy='27' r='1'/%3E%3Ccircle cx='7' cy='47' r='1'/%3E%3Ccircle cx='27' cy='47' r='1'/%3E%3Ccircle cx='47' cy='47' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
  }

  // Light Mode Styles
  const lightModeStyles = {
    container:
      'relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white shadow-2xl',
    backgroundPattern: 'absolute inset-0 opacity-10',
    floatingElements: 'absolute top-4 right-4 opacity-20',
    content: 'relative p-8 md:p-12',
    title: 'text-3xl md:text-4xl font-bold mb-4 text-white',
    description: 'text-lg md:text-xl text-white/90 mb-8 max-w-2xl',
    button:
      'flex items-center px-6 py-3 bg-white/20 hover:bg-white/30 text-white border border-white/20 backdrop-blur-sm rounded-lg transition-all duration-300 font-medium'
  }

  // Dark Mode Styles
  const darkModeStyles = {
    container:
      'relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 text-white shadow-2xl border border-slate-600/30',
    backgroundPattern: 'absolute inset-0 opacity-5',
    floatingElements: 'absolute top-4 right-4 opacity-15',
    content: 'relative p-8 md:p-12',
    title: 'text-3xl md:text-4xl font-bold mb-4 text-slate-100',
    description: 'text-lg md:text-xl text-slate-200 mb-8 max-w-2xl',
    button:
      'flex items-center px-6 py-3 bg-slate-700/50 hover:bg-slate-600/50 text-slate-100 border border-slate-500/30 backdrop-blur-sm rounded-lg transition-all duration-300 font-medium'
  }

  const styles = isDark ? darkModeStyles : lightModeStyles

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className='mb-8'
    >
      <div className={styles.container}>
        {/* Background Pattern */}
        <div className={styles.backgroundPattern}>
          <div className='absolute inset-0' style={backgroundPattern}></div>
        </div>

        {/* Floating Elements */}
        <div className={styles.floatingElements}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: 'linear' }}
          >
            <Sparkles className='h-8 w-8' />
          </motion.div>
        </div>

        <div className={styles.content}>
          <div className='max-w-4xl'>
            <motion.h1
              className={styles.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              {greeting}, {user?.name || 'Welcome back'} ! 👋
            </motion.h1>

            <motion.p
              className={styles.description}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              Welcome to your EasyCom dashboard. Here&apos;s what&apos;s happening with your account today.
            </motion.p>

            <motion.div
              className='flex flex-wrap gap-4'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <button className={styles.button}>
                <Search className='mr-2 h-4 w-4' />
                Search Products
              </button>
              <button className={styles.button}>
                <Bell className='mr-2 h-4 w-4' />
                Notifications
              </button>
              <button className={styles.button}>
                <Calendar className='mr-2 h-4 w-4' />
                My Bookings
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default WelcomeSection
