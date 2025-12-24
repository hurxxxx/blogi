const baseUrl = process.env.SITE_URL || "http://localhost:3000";

export default async function sitemap() {
  const staticRoutes = ["/", "/community", "/search"];

  return [
    ...staticRoutes.map((route) => ({
      url: `${baseUrl}${route}`,
      lastModified: new Date(),
    })),
  ];
}
