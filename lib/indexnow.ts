import { buildContentHref } from "@/lib/contents";

const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";

type IndexNowConfig = {
  baseUrl: string;
  key: string;
  keyLocation?: string;
};

const getIndexNowConfig = (): IndexNowConfig | null => {
  const baseUrl = process.env.SITE_URL;
  const key = process.env.INDEXNOW_KEY;
  if (!baseUrl || !key) return null;
  const keyLocation = process.env.INDEXNOW_KEY_LOCATION || `${baseUrl}/${key}.txt`;
  return { baseUrl, key, keyLocation };
};

const normalizeUrl = (baseUrl: string, path: string) => {
  if (!path.startsWith("/")) return `${baseUrl}/${path}`;
  return `${baseUrl}${path}`;
};

export const buildContentIndexUrl = (categorySlug: string, id: string) =>
  buildContentHref(categorySlug, id);

export const submitIndexNow = async (paths: string[]) => {
  const config = getIndexNowConfig();
  if (!config || paths.length === 0) return;

  const urls = paths.map((path) => normalizeUrl(config.baseUrl, path));

  try {
    await fetch(INDEXNOW_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host: config.baseUrl.replace(/^https?:\/\//, ""),
        key: config.key,
        keyLocation: config.keyLocation,
        urlList: urls,
      }),
    });
  } catch {
    // IndexNow is a best-effort optimization; do not block core flows.
  }
};

export const isPublicIndexable = (params: {
  isVisible?: boolean;
  isDeleted?: boolean;
  categoryRequiresAuth?: boolean;
  categoryIsVisible?: boolean;
}) => {
  const {
    isVisible = true,
    isDeleted = false,
    categoryRequiresAuth = false,
    categoryIsVisible = true,
  } = params;
  return isVisible && !isDeleted && !categoryRequiresAuth && categoryIsVisible;
};
