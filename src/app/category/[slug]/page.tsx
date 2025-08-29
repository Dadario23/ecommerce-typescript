import CategoryClient from "@/components/category/CategoryClient";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function CategoryPage({ params }: Props) {
  // Esperar a que los parámetros se resuelvan
  const { slug } = await params;

  return <CategoryClient slug={slug} />;
}
