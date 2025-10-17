import supabaseServer from '@/shared/libs/supabase.server'

export async function POST(request: Request) {
  const body = await request.json()
  if (!body.uid) {
    return Response.json({ error: 'UID is required' }, { status: 400 })
  }
  try {
    const { error } = await supabaseServer.auth.admin.deleteUser(body.uid)
    if (error) {
      throw error
    }
    return Response.json({
      message: 'User deleted successfully',
    })
  } catch (error) {
    return Response.json({ error: (error as any).message }, { status: 400 })
  }
}
