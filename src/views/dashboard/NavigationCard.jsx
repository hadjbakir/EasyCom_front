'use client'

import { useState } from 'react'

import Link from 'next/link'
import Image from 'next/image'

import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import { useTheme } from '@mui/material/styles'

const NavigationCard = ({ title, description, icon, linkText, linkHref, color, loading, imageSrc, clickable }) => {
  const [isHovered, setIsHovered] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  // Light Mode Styles
  const lightModeStyles = {
    container:
      'h-full border-0 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden group rounded-2xl',
    gradientOverlay: `linear-gradient(to bottom, ${color}00 0%, ${color}20 30%, ${color}60 70%, ${color}CC 100%)`,
    hoverOverlay: 'absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-300',
    iconWrapper: 'inline-flex p-3 rounded-full bg-white/25 backdrop-blur-sm mb-4 shadow-lg border border-white/20',
    title: 'text-xl font-bold mb-3 text-white drop-shadow-lg group-hover:text-white transition-colors',
    description: 'text-white/95 text-sm leading-relaxed mb-6 drop-shadow-md group-hover:text-white transition-colors',
    button:
      'flex items-center px-4 py-2 bg-white/25 hover:bg-white/35 text-white border border-white/30 backdrop-blur-sm transition-all duration-300 group-hover:bg-white/30 rounded-lg font-medium shadow-lg',
    skeleton: 'h-full border-0 shadow-lg rounded-2xl bg-white',
    skeletonElements: 'bg-gray-200 animate-pulse'
  }

  // Dark Mode Styles
  const darkModeStyles = {
    container:
      'h-full border border-slate-700/30 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden group rounded-2xl backdrop-blur-sm',
    gradientOverlay: `linear-gradient(to bottom, ${color}00 0%, ${color}30 30%, ${color}70 70%, ${color}DD 100%)`,
    hoverOverlay: 'absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/20 transition-all duration-300',
    iconWrapper:
      'inline-flex p-3 rounded-full bg-slate-800/60 backdrop-blur-sm mb-4 shadow-lg border border-slate-600/40',
    title: 'text-xl font-bold mb-3 text-slate-100 drop-shadow-lg group-hover:text-white transition-colors',
    description:
      'text-slate-200 text-sm leading-relaxed mb-6 drop-shadow-md group-hover:text-slate-100 transition-colors',
    button:
      'flex items-center px-4 py-2 bg-slate-800/50 hover:bg-slate-700/60 text-slate-100 border border-slate-600/40 backdrop-blur-sm transition-all duration-300 group-hover:bg-slate-700/50 rounded-lg font-medium shadow-lg',
    skeleton: 'h-full border border-slate-700/30 shadow-lg rounded-2xl bg-slate-800/80 backdrop-blur-sm',
    skeletonElements: 'bg-slate-700 animate-pulse'
  }

  const styles = isDark ? darkModeStyles : lightModeStyles

  if (loading) {
    return (
      <div className={styles.skeleton}>
        <div className='p-6'>
          <div className={`h-12 w-12 rounded-full ${styles.skeletonElements} mb-4`}></div>
          <div className={`h-6 w-3/4 ${styles.skeletonElements} rounded mb-2`}></div>
          <div className={`h-4 w-full ${styles.skeletonElements} rounded mb-2`}></div>
          <div className={`h-4 w-2/3 ${styles.skeletonElements} rounded mb-4`}></div>
          <div className={`h-10 w-24 ${styles.skeletonElements} rounded`}></div>
        </div>
      </div>
    )
  }

  const CardContent = (
    <div className={styles.container}>
      <div className='relative h-full'>
        {/* Background Image */}
        {imageSrc && !imageError ? (
          <div className='absolute inset-0'>
            <Image
              src={imageSrc || '/placeholder.svg'}
              alt={title}
              fill
              className={`object-cover transition-all duration-700 group-hover:scale-110 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              priority
            />
          </div>
        ) : (

          <div
            className='absolute inset-0 bg-gradient-to-br transition-transform duration-700 group-hover:scale-110'
            style={{
              background: `linear-gradient(135deg, ${color}40, ${color}80)`
            }}
          />
        )}

        {/* Gradient Overlay for better text readability */}
        <div
          className='absolute inset-0 transition-opacity duration-300'
          style={{
            background: styles.gradientOverlay
          }}
        />

        {/* Additional overlay for hover effect */}
        <div className={styles.hoverOverlay} />

        {/* Animated Background Elements */}
        <div className='absolute inset-0 opacity-5'>
          <motion.div
            className='absolute top-4 right-4 w-20 h-20 rounded-full border-2 border-white'
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: 'linear' }}
          />
          <motion.div
            className='absolute bottom-4 left-4 w-12 h-12 rounded-full border border-white'
            animate={{ rotate: -360 }}
            transition={{ duration: 15, repeat: Number.POSITIVE_INFINITY, ease: 'linear' }}
          />
        </div>

        <div className='relative z-10 p-6 text-white h-full flex flex-col'>
          <div className='flex-1'>
            <motion.div
              className={styles.iconWrapper}
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              {icon}
            </motion.div>

            <h3 className={styles.title}>{title}</h3>
            <p className={styles.description}>{description}</p>
          </div>

          <button className={styles.button}>
            {linkText}
            <motion.div animate={{ x: isHovered ? 4 : 0 }} transition={{ type: 'spring', stiffness: 300 }}>
              <ChevronRight className='ml-2 h-4 w-4' />
            </motion.div>
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className='h-full'
    >
      {clickable ? (
        <Link href={linkHref} className='block h-full w-full focus:outline-none'>
          {CardContent}
        </Link>
      ) : (
        CardContent
      )}
    </motion.div>
  )
}

export default NavigationCard
