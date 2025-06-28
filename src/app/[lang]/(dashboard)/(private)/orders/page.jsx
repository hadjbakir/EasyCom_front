// Next Imports
import dynamic from "next/dynamic"

// Component Imports
const ClientOrders = dynamic(() => import("@/views/apps/explore/orders/ClientOrders"), {

  loading: () => <p>Loading...</p>,
})

const OrdersPage = () => {
  return <ClientOrders />
}

export default OrdersPage
