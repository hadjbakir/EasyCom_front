"use client";
import dynamic from "next/dynamic";

const ProductSupplierOrders = dynamic(() => import("@/views/apps/mybuisnesses/store/ProductSupplierOrders"), { ssr: false });

const SupplierOrdersPage = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <ProductSupplierOrders />
    </div>
  );
};

export default SupplierOrdersPage;
