import { auth0 } from '@/lib/auth0';
import { supabaseAdminA } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }  // ✅ Promise type
) {
  try {
    const session = await auth0.getSession();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;  // ✅ awaited
    const auth0_sub = decodeURIComponent(id);
    const body = await request.json();
    const supabase = supabaseAdminA();

    const { data, error } = await supabase
      .schema('authz')
      .from('memberships')
      .update(body)
      .eq('auth0_sub', auth0_sub)
      .select('*')
      .maybeSingle();  // ✅ won't throw PGRST116 on 0 rows

    if (error) {
      console.error('PATCH error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'Membership not found' }, { status: 404 });  // ✅ explicit 404
    }

    return NextResponse.json({ membership: data });
  } catch (error) {
    console.error('PATCH membership error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}