import { slugify } from "@/lib/slug";

export const normalizeCategorySlug = (value: string) => slugify(value);

export const isVipCategorySlug = (value: string) =>
  normalizeCategorySlug(value) === "vip-trip";
