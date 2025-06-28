// Next Imports
import Link from 'next/link'
import { useParams } from 'next/navigation'

// Third-party Imports
import classnames from 'classnames'

// Data Imports
import navigationMenuData from '@/data/navigationMenuData'

// Util Imports
import { getLocalizedUrl } from '@/utils/i18n'

// Dynamically create default suggestions from navigation data
const defaultSuggestions = navigationMenuData.reduce((acc, item) => {
  if (item.isSection) {
    // Start a new section
    acc.push({
      sectionLabel: item.title,
      items: []
    })
  } else if (acc.length) {
    // Add item to the last section
    acc[acc.length - 1].items.push({
      label: item.title,
      href: item.href,
      icon: item.icon,
      excludeLang: item.excludeLang
    })
  }

  return acc
}, [])

const DefaultSuggestions = ({ setOpen }) => {
  // Hooks
  const { lang: locale } = useParams()

  return (
    <div className='flex grow flex-wrap gap-x-[48px] gap-y-8 plb-14 pli-16 overflow-y-auto overflow-x-hidden bs-full'>
      {defaultSuggestions.map((section, index) => (
        <div
          key={index}
          className='flex flex-col justify-center overflow-x-hidden gap-4 basis-full sm:basis-[calc((100%-3rem)/2)]'
        >
          <p className='text-xs leading-[1.16667] uppercase text-textDisabled tracking-[0.8px]'>
            {section.sectionLabel}
          </p>
          <ul className='flex flex-col gap-4'>
            {section.items.map((item, i) => (
              <li key={i} className='flex'>
                <Link
                  href={item.excludeLang ? item.href : getLocalizedUrl(item.href, locale)}
                  className='flex items-center overflow-x-hidden cursor-pointer gap-2 hover:text-primary focus-visible:text-primary focus-visible:outline-0'
                  onClick={() => setOpen(false)}
                >
                  {item.icon && <i className={classnames(item.icon, 'flex text-xl')} />}
                  <p className='text-[15px] leading-[1.4667] truncate'>{item.label}</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

export default DefaultSuggestions
