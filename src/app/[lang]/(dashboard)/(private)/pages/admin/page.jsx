import dynamic from 'next/dynamic'

const StoresAdmin = dynamic(() => import('@/views/pages/admin'))

const StoresAdminPage = () => <StoresAdmin />

export default StoresAdminPage
