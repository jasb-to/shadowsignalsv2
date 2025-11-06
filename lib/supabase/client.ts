import { createBrowserClient } from "@supabase/ssr"
import type { SupabaseClient } from "@supabase/supabase-js"

declare global {
  var supabaseBrowserClient: SupabaseClient | undefined
}

export function getSupabaseBrowserClient() {
  if (globalThis.supabaseBrowserClient) {
    return globalThis.supabaseBrowserClient
  }

  const client = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

  globalThis.supabaseBrowserClient = client

  return client
}
