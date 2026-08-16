import { createBrowserClient } from '@supabase/ssr'

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://dummy-project.supabase.co'

const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? 'dummy-anon-key'

export const IS_MOCK_MODE = !process.env.NEXT_PUBLIC_SUPABASE_URL

export function createClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_KEY)
}

