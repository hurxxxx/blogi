"use client";

import { ProductListItem } from "./product-list-item";
import { Pagination } from "@/components/ui/pagination";

interface Product {
  id: string;
  title: string;
  imageUrl: string | null;
  createdAt: Date;
}

interface ProductListSectionProps {
  products: Product[];
  categorySlug: string;
  currentPage?: number;
  totalPages?: number;
  showPagination?: boolean;
  label?: string | null;
}

export const ProductListSection = ({
  products,
  categorySlug,
  currentPage = 1,
  totalPages = 1,
  showPagination = false,
  label,
}: ProductListSectionProps) => {
  if (products.length === 0) return null;

  return (
    <div>
      {label && (
        <h2 className="font-display text-xl md:text-2xl mb-4">{label}</h2>
      )}
      <div className="rounded-xl border border-black/5 bg-white overflow-hidden">
        {products.map((product) => (
          <ProductListItem
            key={product.id}
            id={product.id}
            title={product.title}
            categorySlug={categorySlug}
            imageUrl={product.imageUrl}
            createdAt={product.createdAt}
          />
        ))}
      </div>
      {showPagination && totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          baseHref={`/products/${categorySlug}`}
          queryKey="listPage"
        />
      )}
    </div>
  );
};
