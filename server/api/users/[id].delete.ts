import { createClient } from '@supabase/supabase-js'
import type { Database } from '../../../app/types/database'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const config = useRuntimeConfig()

  if (!config.supabaseServiceKey) {
    console.error('NUXT_SUPABASE_SERVICE_KEY is not set')
    throw createError({
      statusCode: 500,
      statusMessage: 'Server configuration error',
    })
  }

  // Initialize Supabase Admin Client
  const supabase = createClient<Database>(
    config.public.supabaseUrl,
    config.supabaseServiceKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )

  // 1. Verify the requester is authenticated
  const authHeader = getRequestHeader(event, 'Authorization')
  if (!authHeader) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const token = authHeader.replace('Bearer ', '')
  const { data: { user }, error: userError } = await supabase.auth.getUser(token)

  if (userError || !user) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid token' })
  }

  // 2. Verify the requester is an admin
  const { data: profileData, error: profileError } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const profile = profileData as any

  if (profileError || !profile || profile.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden: Admin access required' })
  }

  // 3. Perform the deletion
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'User ID is required' })
  }

  // Delete profile first (using service key bypasses RLS)
  const { error: deleteProfileError } = await supabase
    .from('user_profiles')
    .delete()
    .eq('id', id)

  if (deleteProfileError) {
    console.error('Error deleting profile:', deleteProfileError)
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to delete profile: ${deleteProfileError.message}`,
    })
  }

  // Delete from auth
  const { error: deleteError } = await supabase.auth.admin.deleteUser(id)

  if (deleteError) {
    throw createError({
      statusCode: 500,
      statusMessage: deleteError.message,
    })
  }

  return { success: true }
})
