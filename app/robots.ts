import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://studentexpress.ge";
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/restaurants", "/grocery", "/pickup", "/parcel"],
        disallow: ["/dashboard/", "/api/", "/cart", "/checkout", "/admin"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
