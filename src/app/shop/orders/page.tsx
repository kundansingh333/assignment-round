import { getMyOrders } from "@/actions/orders";
import { ShopOrdersClient } from "@/components/ShopOrdersClient";

export default async function ShopOrdersPage() {
  const orders = await getMyOrders();
  return <ShopOrdersClient orders={orders} />;
}
