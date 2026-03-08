import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
    const { searchParams, origin, href } = new URL(request.url)

    // LOG EVERYTHING FOR DEBUGGING
    console.log('[Auth Callback] Full Request URL:', href)
    console.log('[Auth Callback] Search Params keys:', Array.from(searchParams.keys()))

    const code = searchParams.get('code')
    const errorParam = searchParams.get('error')
    const errorDescription = searchParams.get('error_description')
    const next = searchParams.get('next') ?? '/dashboard'

    if (errorParam) {
        console.error('[Auth Callback] OAuth Error:', errorParam, errorDescription)
    }

    if (code) {
        const supabase = await createClient()
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

        if (!exchangeError) {
            console.log('[Auth Callback] Success! Redirecting to:', next)
            const forwardedHost = request.headers.get('x-forwarded-host')
            const isLocalEnv = process.env.NODE_ENV === 'development'

            if (isLocalEnv) {
                return NextResponse.redirect(`${origin}${next}`)
            } else if (forwardedHost) {
                return NextResponse.redirect(`https://${forwardedHost}${next}`)
            } else {
                return NextResponse.redirect(`${origin}${next}`)
            }
        } else {
            console.error('[Auth Callback] Exchange Failure:', exchangeError.message)
        }
    } else {
        console.error('[Auth Callback] Missing "code" parameter in the URL.')
    }

    // Redirect to error page if we reach here
    console.warn('[Auth Callback] Failure state reached. Redirecting to error page.')
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
