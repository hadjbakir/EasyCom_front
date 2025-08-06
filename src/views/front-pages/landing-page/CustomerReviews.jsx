// MUI Imports
import { useRef, useEffect } from 'react'

import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Rating from '@mui/material/Rating'
import Divider from '@mui/material/Divider'

// Third-party Imports
import { useKeenSlider } from 'keen-slider/react'
import classnames from 'classnames'

import { useIntersection } from '@/hooks/useIntersection'

// Component Imports
import CustomIconButton from '@core/components/mui/IconButton'
import CustomAvatar from '@core/components/mui/Avatar'

// Styled Component Imports
import AppKeenSlider from '@/libs/styles/AppKeenSlider'

// SVG Imports
import HubSpot from '@assets/svg/front-pages/landing-page/HubSpot'
import Pinterest from '@assets/svg/front-pages/landing-page/Pinterest'
import Dribbble from '@assets/svg/front-pages/landing-page/Dribbble'
import Airbnb from '@assets/svg/front-pages/landing-page/Airbnb'
import Coinbase from '@assets/svg/front-pages/landing-page/Coinbase'
import Netflix from '@assets/svg/front-pages/landing-page/Netflix'

// Styles Imports
import frontCommonStyles from '@views/front-pages/styles.module.css'
import styles from './styles.module.css'

// Data
const data = [
  {
    desc: 'EasyCom made launching my online store effortless. The multi-store feature is a game changer!',
    rating: 5,
    name: 'Sarah Alami',
    position: 'Fashion Entrepreneur',
    avatarSrc: '/images/avatars/2.png'
  },
  {
    desc: 'I found reliable suppliers in minutes using the image search. Highly recommended!',
    rating: 5,
    name: 'Ahmed Ben Youssef',
    position: 'Electronics Retailer',
    avatarSrc: '/images/avatars/1.png'
  },
  {
    desc: 'The support team is always available and solved my issues quickly. Great service!',
    rating: 5,
    name: 'Leila Mansouri',
    position: 'Home Decor Store Owner',
    avatarSrc: '/images/avatars/4.png'
  },
  {
    desc: "EasyCom's service marketplace helped me find a designer for my packaging in one day.",
    rating: 4,
    name: 'Youssef El Idrissi',
    position: 'Food Brand Founder',
    avatarSrc: '/images/avatars/3.png'
  },
  {
    desc: 'Managing multiple brands from one dashboard saves me hours every week.',
    rating: 5,
    name: 'Fatima Zahra Amrani',
    position: 'Beauty Products Distributor',
    avatarSrc: '/images/avatars/6.png'
  },
  {
    desc: 'The stock clearance section helped me sell unsold inventory fast. Very useful!',
    rating: 4,
    name: 'Samir Bouzid',
    position: 'Toy Store Manager',
    avatarSrc: '/images/avatars/5.png'
  },
  {
    desc: 'Transparent supplier reviews gave me confidence to try new partners.',
    rating: 5,
    name: 'Mariam El Fassi',
    position: 'Boutique Owner',
    avatarSrc: '/images/avatars/8.png'
  },
  {
    desc: 'I love how easy it is to customize my store and track analytics in real time.',
    rating: 5,
    name: 'Karim Othmani',
    position: 'Sports Equipment Seller',
    avatarSrc: '/images/avatars/7.png'
  },
  {
    desc: 'The platform is intuitive and the onboarding was super smooth.',
    rating: 5,
    name: 'Amira Khaled',
    position: 'Jewelry Designer',
    avatarSrc: '/images/avatars/10.png'
  },
  {
    desc: 'EasyCom connects me with trusted freelancers for content and marketing. All-in-one solution!',
    rating: 5,
    name: 'Rachid Bensalem',
    position: 'Bookstore Owner',
    avatarSrc: '/images/avatars/9.png'
  }
]

const CustomerReviews = () => {
  // Hooks
  const [sliderRef, instanceRef] = useKeenSlider(
    {
      loop: true,
      slides: {
        perView: 3,
        origin: 'auto'
      },
      breakpoints: {
        '(max-width: 1200px)': {
          slides: {
            perView: 2,
            spacing: 10,
            origin: 'auto'
          }
        },
        '(max-width: 900px)': {
          slides: {
            perView: 2,
            spacing: 10
          }
        },
        '(max-width: 600px)': {
          slides: {
            perView: 1,
            spacing: 10,
            origin: 'center'
          }
        }
      }
    },
    [
      slider => {
        let timeout
        const mouseOver = false

        function clearNextTimeout() {
          clearTimeout(timeout)
        }

        function nextTimeout() {
          clearTimeout(timeout)
          if (mouseOver) return
          timeout = setTimeout(() => {
            slider.next()
          }, 2000)
        }

        slider.on('created', nextTimeout)
        slider.on('dragStarted', clearNextTimeout)
        slider.on('animationEnded', nextTimeout)
        slider.on('updated', nextTimeout)
      }
    ]
  )

  // Intersection logic
  const skipIntersection = useRef(true)
  const ref = useRef(null)
  const { updateIntersections } = useIntersection()

  useEffect(() => {
    const observer = new window.IntersectionObserver(
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
    <section
      id='customer-reviews'
      ref={ref}
      className={classnames('flex flex-col gap-8 plb-[100px] bg-backgroundDefault', styles.sectionStartRadius)}
    >
      <div
        className={classnames('flex max-md:flex-col max-sm:flex-wrap is-full gap-6', frontCommonStyles.layoutSpacing)}
      >
        <div className='flex flex-col gap-1 bs-full justify-center items-center lg:items-start is-full md:is-[30%] mlb-auto sm:pbs-2'>
          <Chip label='Customer Reviews' variant='tonal' color='primary' size='small' className='mbe-3' />
          <div className='flex flex-col gap-y-1 flex-wrap max-lg:text-center '>
            <Typography color='text.primary' variant='h4'>
              <span className='relative z-[1] font-extrabold'>
                What our users say
                <img
                  src='/images/front-pages/landing-page/bg-shape.png'
                  alt='bg-shape'
                  className='absolute block-end-0 z-[1] bs-[40%] is-[132%] inline-start-[-8%] block-start-[17px]'
                />
              </span>
            </Typography>
            <Typography>Discover how EasyCom helps entrepreneurs and businesses grow.</Typography>
          </div>
          <div className='flex gap-x-4 mbs-11'>
            <CustomIconButton color='primary' variant='tonal' onClick={() => instanceRef.current?.prev()}>
              <i className='tabler-chevron-left' />
            </CustomIconButton>
            <CustomIconButton color='primary' variant='tonal' onClick={() => instanceRef.current?.next()}>
              <i className='tabler-chevron-right' />
            </CustomIconButton>
          </div>
        </div>
        <div className='is-full md:is-[70%]'>
          <AppKeenSlider>
            <div ref={sliderRef} className='keen-slider mbe-6'>
              {data.map((item, index) => (
                <div key={index} className='keen-slider__slide flex p-4 sm:p-3'>
                  <Card elevation={8} className='flex items-start'>
                    <CardContent className='p-8 items-center mlb-auto'>
                      <div className='flex flex-col gap-4 items-start'>
                        <Typography>{item.desc}</Typography>
                        <Rating value={item.rating} readOnly />
                        <div className='flex items-center gap-x-3'>
                          <CustomAvatar size={32} src={item.avatarSrc} alt={item.name} />
                          <div className='flex flex-col items-start'>
                            <Typography color='text.primary' className='font-medium'>
                              {item.name}
                            </Typography>
                            <Typography variant='body2' color='text.disabled'>
                              {item.position}
                            </Typography>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </AppKeenSlider>
        </div>
      </div>
      <Divider />
    </section>
  )
}

export default CustomerReviews
