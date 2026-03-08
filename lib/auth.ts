import { createClient as createBrowserClient } from '@/lib/supabase/client'
import { createClient as createServerClient } from '@/lib/supabase/server'

/**
 * Initiates Google OAuth login flow.
 * Note: Must be called from a Client Component or browser context.
 */
export async function loginWithGoogle() {
    const supabase = createBrowserClient()

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${window.location.origin}/auth/callback`,
        },
    })

    if (error) {
        console.error('Error logging in with Google:', error.message)
        throw error
    }

    return data
}

/**
 * Logs out the current user.
 * Note: Must be called from a Client Component or browser context.
 */
export async function logout() {
    const supabase = createBrowserClient()

    const { error } = await supabase.auth.signOut()

    if (error) {
        console.error('Error logging out:', error.message)
        throw error
    }
}

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
