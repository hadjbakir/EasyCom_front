"use client";
import dynamic from "next/dynamic";

const ProductClientOrders = dynamic(() => import("@/views/apps/explore/orders/ProductClientOrders"), { ssr: false });

const ProductOrdersPage = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <ProductClientOrders />
    </div>
  );
};

export default ProductOrdersPage;
