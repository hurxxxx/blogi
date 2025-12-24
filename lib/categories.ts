const CATEGORY_SLUG_MAP: Record<string, string> = {
  CASINO: "casino",
  NIGHTLIFE: "nightlife",
  PROMOTION: "promotion",
  VIP_TRIP: "vip-trip",
  TIP: "tip",
  HOTEL_VILLA: "hotel-villa",
  GOLF: "golf",
};

const SLUG_CATEGORY_MAP = Object.fromEntries(
  Object.entries(CATEGORY_SLUG_MAP).map(([key, value]) => [value, key])
);

export const categoryToSlug = (category: string) => {
  const normalized = category.toUpperCase();
  return CATEGORY_SLUG_MAP[normalized] ?? normalized.toLowerCase().replace(/_/g, "-");
};

export const slugToCategory = (slug: string) => {
  const normalized = slug.toLowerCase();
  return SLUG_CATEGORY_MAP[normalized] ?? normalized.toUpperCase().replace(/-/g, "_");
};
