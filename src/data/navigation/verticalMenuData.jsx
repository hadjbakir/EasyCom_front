const verticalMenuData = dictionary => [
  {
    label: dictionary['navigation'].rolesPermissions,
    icon: 'tabler-lock',
    children: [
      {
        label: dictionary['navigation'].roles,
        icon: 'tabler-circle',
        href: '/apps/roles'
      },
      {
        label: dictionary['navigation'].permissions,
        icon: 'tabler-circle',
        href: '/apps/permissionss'
      }
    ]
  }
]

export default verticalMenuData
