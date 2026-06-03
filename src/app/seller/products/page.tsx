import { getProducts, getCategories } from "@/actions/products";
import { AdminProductsClient } from "@/components/AdminProductsClient";

export default async function SellerProductsPage() {
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ]);

  return (
    <div>
      <AdminProductsClient products={products} categories={categories} />
    </div>
  );
}
