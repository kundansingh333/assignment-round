import { getOrders } from "@/actions/orders";
import { AdminOrdersClient } from "@/components/AdminOrdersClient";

export default async function SellerOrdersPage() {
  const orders = await getOrders();
  return <AdminOrdersClient orders={orders} />;
}
