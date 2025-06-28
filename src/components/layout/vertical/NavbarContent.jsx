"use client"

// Third-party Imports
import dynamic from 'next/dynamic'

import classnames from "classnames"
import IconButton from '@mui/material/IconButton'
import PhotoCamera from '@mui/icons-material/PhotoCamera'


// Component Imports
import NavSearch from "@components/layout/shared/search"
import LanguageDropdown from "@components/layout/shared/LanguageDropdown"
import NotificationsDropdown from "@components/layout/shared/NotificationsDropdown"
import SavedDropdown from "@components/layout/shared/SavedDropdown"
import CartDropdown from "@components/layout/shared/CartDropdown"
import NavToggle from "./NavToggle"
import UserDropdown from "@components/layout/shared/UserDropdown"
import OpenDialogOnElementClick from '@components/dialogs/OpenDialogOnElementClick'
import ImageSearchDialog from '@components/dialogs/image-search/ImageSearchDialog'

// Util Imports
import { verticalLayoutClasses } from "@layouts/utils/layoutClasses"

const ModeDropdown = dynamic(() => import('@components/layout/shared/ModeDropdown'), {
  ssr: false
})

const notifications = [
  {
    avatarImage: "/images/avatars/8.png",
    title: "Congratulations Bakir 🎉",
    subtitle: "Won the monthly bestseller gold badge",
    time: "1h ago",
    read: false,
  },
  {
    title: "Cecilia Becker",
    avatarColor: "secondary",
    subtitle: "Accepted your connection",
    time: "12h ago",
    read: false,
  },
  {
    avatarImage: "/images/avatars/3.png",
    title: "Bernard Woods",
    subtitle: "You have new message from Bernard Woods",
    time: "May 18, 8:26 AM",
    read: true,
  },
  {
    avatarIcon: "tabler-chart-bar",
    title: "Monthly report generated",
    subtitle: "July month financial report is generated",
    avatarColor: "info",
    time: "Apr 24, 10:30 AM",
    read: true,
  },
  {
    avatarText: "MG",
    title: "Application has been approved 🚀",
    subtitle: "Your Meta Gadgets project application has been approved.",
    avatarColor: "success",
    time: "Feb 17, 12:17 PM",
    read: true,
  },
  {
    avatarIcon: "tabler-mail",
    title: "New message from Harry",
    subtitle: "You have new message from Harry",
    avatarColor: "error",
    time: "Jan 6, 1:48 PM",
    read: true,
  },
]

const NavbarContent = () => {
  return (
    <div className={classnames(verticalLayoutClasses.navbarContent, "flex items-center justify-between gap-4 is-full")}>
      <div className="flex items-center gap-4">
        <NavToggle />
        <OpenDialogOnElementClick
          element={IconButton}
          dialog={ImageSearchDialog}
          elementProps={{
            color: 'primary',
            size: 'large',
            children: <PhotoCamera />,
            title: 'Recherche par image',
            sx: { mx: 1 }
          }}
          dialogProps={{}}
        />
        <NavSearch />
      </div>
      <div className="flex items-center">
        <LanguageDropdown />
        <ModeDropdown />
        <SavedDropdown />
        <CartDropdown />
        <NotificationsDropdown notifications={notifications} />
        <UserDropdown />
      </div>
    </div>
  )
}

export default NavbarContent
