import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import { Breadcrumb } from "@/components/breadcrumb";
import { ProductGallery } from "@/components/product-gallery";
import { ProductInfo } from "@/components/product-info";
import { ProductCard } from "@/components/product-card";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params;

  try {
    const product = await api.products.getBySlug(slug);
    return {
      title: `${product.name} | Encanto Florería`,
      description: product.description || `Compra ${product.name} en Encanto Florería.`,
    };
  } catch {
    return {
      title: "Producto no encontrado | Encanto Florería",
    };
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;

  let product;
  try {
    product = await api.products.getBySlug(slug);
    console.log("[ProductDetail] raw:", JSON.stringify(product, null, 2));
  } catch {
    notFound();
  }

  // Fetch related products and add-ons in parallel
  const [relatedData, addOnCategories, addOns] = await Promise.all([
    product.categoryId
      ? api.products.byCategory(product.categoryId, { limit: 4 })
      : Promise.resolve({ result: [] as typeof product[] }),
    api.addOnCategories.active(),
    api.addOns.list(),
  ]);
  console.log("[ProductDetail:related] raw:", JSON.stringify(relatedData.result, null, 2));
  console.log("[ProductDetail:addOnCategories] raw:", JSON.stringify(addOnCategories, null, 2));
  console.log("[ProductDetail:addOns] raw:", JSON.stringify(addOns, null, 2));

  const relatedProducts = relatedData.result
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  const breadcrumbItems = [
    { label: "Productos", href: "/productos" },
    ...(product.category
      ? [{ label: product.category.name, href: `/categorias/${product.category.slug}` }]
      : []),
    { label: product.name },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Breadcrumb items={breadcrumbItems} />

      {/* Product Detail */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Gallery */}
          <ProductGallery images={product.images} productName={product.name} />

          {/* Product Info */}
          <ProductInfo product={product} addOnCategories={addOnCategories} addOns={addOns} />
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="bg-background-alt py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-serif mb-6">Productos Relacionados</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
