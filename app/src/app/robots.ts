// © 2025 운빨(unbbal). All rights reserved.

import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/"],
    },
    sitemap: "https://unbbal.gg/sitemap.xml",
  };
}
