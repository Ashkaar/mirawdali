import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Mirawdali | میراودەلی",
    short_name: "Mirawdali",
    description: "The Mirawdali family tree, photo archive and family stories.",
    start_url: "/",
    display: "standalone",
    background_color: "#f5f2f0",
    theme_color: "#5c3a20",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
