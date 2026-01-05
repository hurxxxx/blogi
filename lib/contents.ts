import { slugify } from "@/lib/slug";

export const buildContentSlug = (title: string) => slugify(title || "");

export const buildContentIdParam = (id: string, title?: string | null) => {
  const slug = title ? buildContentSlug(title) : "";
  return slug ? `${id}-${slug}` : id;
};

export const buildContentHref = (
  categorySlug: string,
  id: string,
  title?: string | null
) => `/contents/${categorySlug}/${buildContentIdParam(id, title)}`;

export const extractContentId = (idParam: string) => idParam.split("-")[0];
