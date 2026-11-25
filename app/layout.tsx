import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mirawdali | میراودەلی",
  description: "Explore the Mirawdali family tree, photo archive, and family stories.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbf5f4" },
    { media: "(prefers-color-scheme: dark)", color: "#211920" },
  ],
};

const themeScript = "try{const e=document.documentElement;e.dataset.theme=localStorage.getItem('mir-theme')||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');if(localStorage.getItem('mir-lang')==='ckb'){e.lang='ckb';e.dir='rtl'}}catch{}";

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head><body>{children}</body></html>;
}
