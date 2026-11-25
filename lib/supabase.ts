import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export const backendReady = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);

export async function database() {
  const jar = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => jar.getAll(),
        setAll: (changes) => {
          try {
            for (const { name, value, options } of changes) jar.set(name, value, options);
          } catch {
            // The request proxy handles refresh writes for Server Components.
          }
        },
      },
    },
  );
}
