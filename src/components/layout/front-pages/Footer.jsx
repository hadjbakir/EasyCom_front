'use client'

// React Imports
import { useState } from 'react'

import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import { useTheme } from '@mui/material/styles'

// Third-party Imports
import classnames from 'classnames'
import { motion } from 'framer-motion'

// Component Imports
import Link from '@components/Link'
import Logo from '@components/layout/shared/Logo'
import CustomTextField from '@core/components/mui/TextField'

// Util Imports
import { frontLayoutClasses } from '@layouts/utils/layoutClasses'
import frontCommonStyles from '@views/front-pages/styles.module.css'

const Footer = ({ mode }) => {
  const [email, setEmail] = useState('')
  const [hoveredLink, setHoveredLink] = useState(null)
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'

  const footerLinks = [
    { name: 'Features', href: '/front-pages/landing-page#features', id: 'features' },
    { name: 'Pricing', href: '/front-pages/landing-page#pricing-plans', id: 'pricing-plans' },
    { name: 'Customer Reviews', href: '/front-pages/landing-page#customer-reviews', id: 'customer-reviews' },
    { name: 'Team', href: '/front-pages/landing-page#team', id: 'team' },
    { name: 'FAQ', href: '/front-pages/landing-page#faq', id: 'faq' },
    { name: 'Contact', href: '/front-pages/landing-page#contact-us', id: 'contact-us' }
  ]

  const socialLinks = [
    { icon: 'tabler-brand-github-filled', href: 'https://github.com/pixinvent', label: 'GitHub', color: '#6366f1' },
    {
      icon: 'tabler-brand-facebook-filled',
      href: 'https://www.facebook.com/pixinvents/',
      label: 'Facebook',
      color: '#3b82f6'
    },
    { icon: 'tabler-brand-twitter-filled', href: 'https://x.com/pixinvents', label: 'Twitter', color: '#06b6d4' },
    {
      icon: 'tabler-brand-youtube-filled',
      href: 'https://www.youtube.com/channel/UClOcB3o1goJ293ri_Hxpklg',
      label: 'YouTube',
      color: '#ef4444'
    }
  ]

  const handleScrollTo = (e, id) => {
    e.preventDefault()
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSubscribe = e => {
    e.preventDefault()
    console.log('Subscribe:', email)
    setEmail('')
  }

  return (
    <footer className={frontLayoutClasses.footer}>
      {/* Main Footer with Bento Grid Design */}
      <div
        className='relative py-20 px-6'
        style={{
          background: isDark
            ? 'linear-gradient(135deg, #0c0a1e 0%, #1a1b3a 30%, #2d1b69 60%, #1e1b4b 100%)'
            : 'linear-gradient(135deg, #fef7ff 0%, #f3e8ff 30%, #e0e7ff 60%, #dbeafe 100%)'
        }}
      >
        {/* Geometric Background Pattern */}
        <div className='absolute inset-0 overflow-hidden'>
          <div
            className='absolute inset-0 opacity-5'
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23${isDark ? 'a855f7' : '6366f1'}' fillOpacity='0.2'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}
          />

          {/* Floating Geometric Shapes */}
          <motion.div
            className={`absolute top-20 left-20 w-32 h-32 rounded-3xl ${
              isDark
                ? 'bg-gradient-to-br from-purple-500/20 to-blue-500/20'
                : 'bg-gradient-to-br from-indigo-500/15 to-purple-500/15'
            } backdrop-blur-sm border ${isDark ? 'border-purple-500/30' : 'border-indigo-300/50'}`}
            animate={{
              rotate: [0, 360],
              scale: [1, 1.1, 1]
            }}
            transition={{
              duration: 20,
              repeat: Number.POSITIVE_INFINITY,
              ease: 'linear'
            }}
          />
          <motion.div
            className={`absolute bottom-32 right-32 w-24 h-24 rounded-full ${
              isDark
                ? 'bg-gradient-to-br from-cyan-500/20 to-blue-500/20'
                : 'bg-gradient-to-br from-blue-500/15 to-cyan-500/15'
            } backdrop-blur-sm border ${isDark ? 'border-cyan-500/30' : 'border-blue-300/50'}`}
            animate={{
              y: [-20, 20, -20],
              rotate: [0, -360]
            }}
            transition={{
              duration: 15,
              repeat: Number.POSITIVE_INFINITY,
              ease: 'easeInOut'
            }}
          />
        </div>

        <div className={classnames('relative z-10 max-w-7xl mx-auto', frontCommonStyles.layoutSpacing)}>
          {/* Bento Grid Layout */}
          <div className='grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12'>
            {/* Logo & Description Card */}
            <motion.div
              className='lg:col-span-5'
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div
                className={`h-full p-8 rounded-3xl backdrop-blur-xl border shadow-2xl hover:shadow-3xl transition-all duration-500`}
                style={{
                  background: isDark
                    ? 'linear-gradient(135deg, rgba(30, 27, 75, 0.7) 0%, rgba(45, 27, 105, 0.6) 100%)'
                    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.8) 100%)',
                  borderColor: isDark ? '#6366f1' : '#a855f7',
                  borderWidth: '1px'
                }}
              >
                <Link href='/front-pages/landing-page' className='inline-block mb-6'>
                  <motion.div whileHover={{ scale: 1.05 }} transition={{ type: 'spring', stiffness: 300 }}>
                    <Logo color={isDark ? 'var(--mui-palette-common-white)' : 'var(--mui-palette-common-black)'} />
                  </motion.div>
                </Link>

                <Typography className={`text-lg leading-relaxed mb-8 ${isDark ? 'text-purple-100' : 'text-slate-700'}`}>
                  The all-in-one platform to launch, manage, and grow your e-commerce business in Algeria and beyond.
                </Typography>

                {/* Stats or Features */}
                <div className='grid grid-cols-2 gap-4'>
                  <div
                    className='text-center p-4 rounded-2xl border'
                    style={{
                      background: isDark
                        ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.1) 100%)'
                        : 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%)',
                      borderColor: isDark ? '#6366f1' : '#a855f7'
                    }}
                  >
                    <Typography
                      variant='h4'
                      className='font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600'
                    >
                      10K+
                    </Typography>
                    <Typography variant='body2' className={isDark ? 'text-purple-200' : 'text-slate-600'}>
                      Active Users
                    </Typography>
                  </div>
                  <div
                    className='text-center p-4 rounded-2xl border'
                    style={{
                      background: isDark
                        ? 'linear-gradient(135deg, rgba(139, 92, 246, 0.2) 0%, rgba(168, 85, 247, 0.1) 100%)'
                        : 'linear-gradient(135deg, rgba(139, 92, 246, 0.1) 0%, rgba(168, 85, 247, 0.05) 100%)',
                      borderColor: isDark ? '#8b5cf6' : '#6366f1'
                    }}
                  >
                    <Typography
                      variant='h4'
                      className='font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-600'
                    >
                      99%
                    </Typography>
                    <Typography variant='body2' className={isDark ? 'text-purple-200' : 'text-slate-600'}>
                      Uptime
                    </Typography>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Navigation Links Card */}
            <motion.div
              className='lg:col-span-3'
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <div
                className='h-full p-8 rounded-3xl backdrop-blur-xl border shadow-2xl hover:shadow-3xl transition-all duration-500'
                style={{
                  background: isDark
                    ? 'linear-gradient(135deg, rgba(30, 27, 75, 0.7) 0%, rgba(45, 27, 105, 0.6) 100%)'
                    : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.8) 100%)',
                  borderColor: isDark ? '#8b5cf6' : '#6366f1',
                  borderWidth: '1px'
                }}
              >
                <Typography variant='h6' className={`font-bold mb-6 ${isDark ? 'text-purple-100' : 'text-slate-800'}`}>
                  Quick Links
                </Typography>

                <div className='space-y-3'>
                  {footerLinks.map((link, index) => (
                    <motion.div
                      key={link.name}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                      viewport={{ once: true }}
                    >
                      <Link
                        href={link.href}
                        onClick={e => handleScrollTo(e, link.id)}
                        onMouseEnter={() => setHoveredLink(link.name)}
                        onMouseLeave={() => setHoveredLink(null)}
                        className={`block p-3 rounded-xl transition-all duration-300 group border ${
                          isDark
                            ? 'hover:bg-gradient-to-r hover:from-purple-600/20 hover:to-indigo-600/20 text-purple-200 hover:text-white border-transparent hover:border-purple-500/50'
                            : 'hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 text-slate-600 hover:text-slate-900 border-transparent hover:border-indigo-200'
                        }`}
                      >
                        <div className='flex items-center justify-between'>
                          <Typography variant='body2' className='font-medium'>
                            {link.name}
                          </Typography>
                          <motion.div
                            animate={{
                              x: hoveredLink === link.name ? 5 : 0,
                              opacity: hoveredLink === link.name ? 1 : 0.5
                            }}
                            transition={{ type: 'spring', stiffness: 300 }}
                            className={
                              hoveredLink === link.name ? (isDark ? 'text-purple-400' : 'text-indigo-600') : ''
                            }
                          >
                            <i className='tabler-arrow-right text-sm' />
                          </motion.div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Newsletter Card */}
            <motion.div
              className='lg:col-span-4'
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div
                className='h-full p-8 rounded-3xl backdrop-blur-xl border shadow-2xl hover:shadow-3xl transition-all duration-500'
                style={{
                  background: isDark
                    ? 'linear-gradient(135deg, rgba(99, 102, 241, 0.3) 0%, rgba(139, 92, 246, 0.2) 50%, rgba(168, 85, 247, 0.3) 100%)'
                    : 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.08) 50%, rgba(168, 85, 247, 0.1) 100%)',
                  borderColor: isDark ? '#a855f7' : '#8b5cf6',
                  borderWidth: '1px'
                }}
              >
                <div className='text-center mb-6'>
                  <Typography variant='h5' className={`font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-800'}`}>
                    Stay in the Loop 🚀
                  </Typography>
                  <Typography variant='body2' className={isDark ? 'text-purple-200' : 'text-slate-600'}>
                    Get the latest updates and exclusive offers
                  </Typography>
                </div>

                <form onSubmit={handleSubscribe} className='space-y-4'>
                  <CustomTextField
                    fullWidth
                    size='medium'
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder='Enter your email'
                    sx={{
                      '& .MuiInputBase-root': {
                        borderRadius: '16px',
                        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.9)',
                        backdropFilter: 'blur(10px)',
                        border: `1px solid ${isDark ? 'rgba(168, 85, 247, 0.3)' : 'rgba(139, 92, 246, 0.2)'}`,
                        '&:hover': {
                          backgroundColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 1)',
                          borderColor: isDark ? '#a855f7' : '#8b5cf6'
                        },
                        '&.Mui-focused': {
                          borderColor: isDark ? '#c084fc' : '#a855f7',
                          boxShadow: `0 0 0 3px ${isDark ? 'rgba(168, 85, 247, 0.2)' : 'rgba(139, 92, 246, 0.1)'}`
                        }
                      },
                      '& .MuiInputBase-input': {
                        color: isDark ? 'white' : 'black',
                        padding: '16px 20px'
                      }
                    }}
                  />

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      type='submit'
                      fullWidth
                      variant='contained'
                      size='large'
                      sx={{
                        borderRadius: '16px',
                        padding: '16px',
                        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #5b21b6 0%, #7c3aed 50%, #9333ea 100%)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 20px 40px rgba(139, 92, 246, 0.4)'
                        },
                        transition: 'all 0.3s ease',
                        fontWeight: 600
                      }}
                    >
                      Subscribe Now
                    </Button>
                  </motion.div>
                </form>
              </div>
            </motion.div>
          </div>

          {/* App Downloads & Social Section */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div
              className='p-8 rounded-3xl backdrop-blur-xl border w-full shadow-2xl hover:shadow-3xl transition-all duration-500 flex flex-col items-center justify-center text-center'
              style={{
                background: isDark
                  ? 'linear-gradient(135deg, rgba(30, 27, 75, 0.7) 0%, rgba(45, 27, 105, 0.6) 100%)'
                  : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.8) 100%)',
                borderColor: isDark ? '#06b6d4' : '#3b82f6',
                borderWidth: '1px'
              }}
            >
              <Typography
                variant='h6'
                className={`font-bold mb-6 ${isDark ? 'text-cyan-100' : 'text-slate-800'} text-center`}
              >
                Connect With Us 🌐
              </Typography>
              <div className='flex flex-wrap gap-3 mb-8 justify-center items-center'>
                {socialLinks.map((social, index) => (
                  <motion.div
                    key={social.label}
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ scale: 1.1, y: -3 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <IconButton
                      component={Link}
                      href={social.href}
                      target='_blank'
                      sx={{
                        width: 56,
                        height: 56,
                        borderRadius: '16px',
                        backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.8)',
                        border: `2px solid ${isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'}`,
                        color: social.color,
                        '&:hover': {
                          backgroundColor: `${social.color}20`,
                          borderColor: social.color,
                          transform: 'translateY(-3px)',
                          boxShadow: `0 10px 30px ${social.color}40`
                        },
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <i className={`${social.icon} text-xl`} />
                    </IconButton>
                  </motion.div>
                ))}
              </div>
              <div className='text-center w-full'>
                <Typography
                  variant='body2'
                  className={`${isDark ? 'text-cyan-200' : 'text-slate-600'} leading-relaxed text-center`}
                >
                  <span>{`© ${new Date().getFullYear()}, Made with `}</span>
                  <motion.span
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
                    className='inline-block text-red-500'
                  >
                    ❤️
                  </motion.span>
                  <span>{` by EasyCom team`}</span>
                </Typography>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
