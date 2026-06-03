import { getCategories } from "@/actions/products";
import { AdminCategoriesClient } from "@/components/AdminCategoriesClient";

export default async function AdminCategoriesPage() {
  const categories = await getCategories();
  return <AdminCategoriesClient categories={categories} />;
}
