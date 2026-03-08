import { createClient as createServerClient } from '@/lib/supabase/server'

/**
 * Retrieves the currently authenticated user context (Server-side).
 * Ideal for Server Components and Route Handlers.
 */
export async function getCurrentUser() {
    const supabase = await createServerClient()
    const { data, error } = await supabase.auth.getUser()

    if (error || !data?.user) {
        return null
    }

    return data.user
}
