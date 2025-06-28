const navigationMenuData = [
  {
    isSection: true,
    title: 'Main'
  },
  {
    title: 'Dashboard',
    icon: 'tabler-smart-home',
    href: '/dashboard'
  },
  {
    isSection: true,
    title: 'Explore'
  },
  {
    title: 'Products & Stores',
    icon: 'tabler-building-store',
    href: '/apps/explore/products-and-stores'
  },
  {
    title: 'Clearance Products',
    icon: 'tabler-tag',
    href: '/apps/explore/clearance-products',
    isClearance: true
  },
  {
    title: 'Skills',
    icon: 'tabler-user-star',
    href: '/apps/explore/skills'
  },
  {
    title: 'Rent Spaces',
    icon: 'tabler-building-warehouse',
    href: '/apps/explore/spaces'
  },
  {
    isSection: true,
    title: 'Business'
  },
  {
    title: 'Become a Business',
    icon: 'tabler-briefcase',
    href: '/apps/becomebuisness'
  },
  {
    title: 'My Businesses',
    icon: 'tabler-building',
    href: '/apps/mybuisnesses'
  },
  {
    isSection: true,
    title: 'Others'
  },
  {
    title: 'Account Settings',
    icon: 'tabler-settings',
    href: '/pages/account-settings'
  },
  {
    title: 'Landing Page',
    icon: 'tabler-smart-home',
    href: '/front-pages/landing-page',
    excludeLang: true
  }
]

export default navigationMenuData 