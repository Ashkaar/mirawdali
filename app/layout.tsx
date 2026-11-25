import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mirawdali | میراودەلی",
  description: "Explore the Mirawdali family tree, photo archive, and family stories.",
};

const themeScript = "try{const e=document.documentElement;e.dataset.theme=localStorage.getItem('mir-theme')||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');if(localStorage.getItem('mir-lang')==='ckb'){e.lang='ckb';e.dir='rtl'}}catch{}";

export default function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{ __html: themeScript }} /></head><body>{children}</body></html>;
}
