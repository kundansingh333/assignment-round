import { getProducts, getCategories } from "@/actions/products";
import { ShopProductsClient } from "@/components/ShopProductsClient";

export default async function ShopPage() {
  const [products, categories] = await Promise.all([
    getProducts({ isActive: true }),
    getCategories(),
  ]);

  return <ShopProductsClient products={products} categories={categories} />;
}
