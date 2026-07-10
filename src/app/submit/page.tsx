import { getCategories } from "@/lib/queries/products";
import SubmitForm from "./submit-form";

export default async function SubmitPage() {
  const categories = await getCategories();
  return <SubmitForm categories={categories} />;
}
