"use client";

import { ProductCard } from "./product-card";
import { Pagination } from "@/components/ui/pagination";

interface Product {
  id: string;
  title: string;
  imageUrl: string | null;
  price: string | null;
  createdAt: Date;
  categoryRef?: { slug: string; name: string } | null;
}

interface ProductCardSectionProps {
  products: Product[];
  categorySlug: string;
  categoryName: string;
  currentPage?: number;
  totalPages?: number;
  showPagination?: boolean;
  label?: string | null;
}

export const ProductCardSection = ({
  products,
  categorySlug,
  categoryName,
  currentPage = 1,
  totalPages = 1,
  showPagination = false,
  label,
}: ProductCardSectionProps) => {
  if (products.length === 0) return null;

  return (
    <div>
      {label && (
        <h2 className="font-display text-xl md:text-2xl mb-4">{label}</h2>
      )}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            title={product.title}
            categorySlug={product.categoryRef?.slug ?? categorySlug}
            categoryLabel={product.categoryRef?.name ?? categoryName}
            imageUrl={product.imageUrl}
            price={product.price}
            createdAt={product.createdAt}
          />
        ))}
      </div>
      {showPagination && totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          baseHref={`/products/${categorySlug}`}
          queryKey="cardPage"
        />
      )}
    </div>
  );
};
