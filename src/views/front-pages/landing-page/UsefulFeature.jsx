// React Imports
import { useEffect, useRef } from 'react'

// MUI Imports
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid2'
import Chip from '@mui/material/Chip'

// Third-party Imports
import classnames from 'classnames'

// Hook Imports
import { Search, Briefcase, ShieldCheck, Store, Tag, Headset } from 'lucide-react'

import { useIntersection } from '@/hooks/useIntersection'

// SVG Imports

// Data
const features = [
  {
    icon: <Search color='var(--mui-palette-primary-main)' size={40} />, // Smart Product Search by Image
    title: 'Smart Product Search by Image',
    description: 'Instantly find suppliers or similar products by uploading a photo — powered by AI.'
  },
  {
    icon: <Briefcase color='var(--mui-palette-primary-main)' size={40} />, // Centralized Service Marketplace
    title: 'Centralized Service Marketplace',
    description:
      'Access trusted freelancers and agencies for design, content, voice-over, media buying, packaging, and more.'
  },
  {
    icon: <ShieldCheck color='var(--mui-palette-primary-main)' size={40} />, // Verified Supplier Network
    title: 'Verified Supplier Network',
    description: 'Discover local wholesalers, importers, and production workshops with reviews and transparent pricing.'
  },
  {
    icon: <Store color='var(--mui-palette-primary-main)' size={40} />, // Multi-Store Management
    title: 'Multi-Store Management',
    description: 'Create dedicated stores for each product line or brand, all managed in one place.'
  },
  {
    icon: <Tag color='var(--mui-palette-primary-main)' size={40} />, // Stock Clearance Marketplace
    title: 'Stock Clearance Marketplace',
    description: 'Sell your unsold inventory through a dedicated section for discounted lots and quick recovery.'
  },
  {
    icon: <Headset color='var(--mui-palette-primary-main)' size={40} />, // Professional Support
    title: 'Professional Support',
    description: 'Get the help you need to run your business smoothly, from technical setup to service coordination.'
  }
]

import frontCommonStyles from '@views/front-pages/styles.module.css'

const UsefulFeature = () => {
  // Refs
  const skipIntersection = useRef(true)
  const ref = useRef(null)

  // Hooks
  const { updateIntersections } = useIntersection()

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (skipIntersection.current) {
          skipIntersection.current = false

          return
        }

        updateIntersections({ [entry.target.id]: entry.isIntersecting })
      },
      { threshold: 0.35 }
    )

    ref.current && observer.observe(ref.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <section id='features' ref={ref} className='bg-backgroundPaper mbs-20'>
      <div className={classnames('flex flex-col gap-12 pbs-12 pbe-[100px]', frontCommonStyles.layoutSpacing)}>
        <div className='flex flex-col gap-y-4 items-center justify-center'>
          <Chip size='small' variant='tonal' color='primary' label='The services that make the difference' />
          <div className='flex flex-col items-center gap-y-1 justify-center flex-wrap'>
            <div className='flex items-center gap-x-2'>
              <Typography color='text.primary' variant='h4' className='text-center'>
                <span className='relative z-[1] font-extrabold'>
                  Every service you need
                  <img
                    src='/images/front-pages/landing-page/bg-shape.png'
                    alt='bg-shape'
                    className='absolute block-end-0 z-[1] bs-[40%] is-[125%] sm:is-[132%] -inline-start-[13%] sm:inline-start-[-19%] block-start-[17px]'
                  />
                </span>{' '}
                to grow your business
              </Typography>
            </div>
            <Typography className='text-center'>
              EasyCom brings together innovation, network, and support to boost your business.
            </Typography>
          </div>
        </div>
        <div>
          <Grid container spacing={6} justifyContent='center'>
            {features.map((item, index) => (
              <Grid key={index} xs={12} sm={6} lg={4}>
                <div className='flex flex-col gap-2 justify-center items-center'>
                  {item.icon}
                  <Typography className='mbs-2' variant='h5'>
                    {item.title}
                  </Typography>
                  <Typography className='max-is-[364px] text-center'>{item.description}</Typography>
                </div>
              </Grid>
            ))}
          </Grid>
        </div>
      </div>
    </section>
  )
}

export default UsefulFeature
