import { getProducts } from "@/actions/products";
import { SellerProductsClient } from "@/components/SellerProductsClient";

export default async function SellerProductsPage() {
  const products = await getProducts();

  return (
    <div>
      <SellerProductsClient products={products} />
    </div>
  );
}
