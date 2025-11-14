import { createServerClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(cookieStore)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    console.log('[v0] Grant Admin: Making user admin:', user.email)

    // Update or insert user as admin
    const { error: upsertError } = await supabase
      .from('users')
      .upsert(
        {
          id: user.id,
          email: user.email,
          is_admin: true,
          subscription_tier: 'free',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      )

    if (upsertError) {
      console.error('[v0] Grant Admin: Error:', upsertError)
      return NextResponse.json({ error: upsertError.message }, { status: 500 })
    }

    console.log('[v0] Grant Admin: Success!')
    return NextResponse.json({ success: true, message: 'Admin access granted' })
  } catch (error: any) {
    console.error('[v0] Grant Admin: Exception:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
