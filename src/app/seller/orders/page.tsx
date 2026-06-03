import { getOrders } from "@/actions/orders";
import { SellerOrdersClient } from "@/components/SellerOrdersClient";

export default async function SellerOrdersPage() {
  const orders = await getOrders();
  return <SellerOrdersClient orders={orders} />;
}
