// app/api/sso/memberships/[id]/route.ts

import { auth0 } from '@/lib/auth0';
import { supabaseAdminA } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';

// PATCH /api/sso/memberships/[id]
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth0.getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { status, role, school_id, member_state_id, grades_csv } = body;

    const supabase = supabaseAdminA();

    const now = new Date().toISOString();
    const updates: Record<string, unknown> = { updated_at: now };

    if (status) updates.status = status;
    if (role) updates.role = role;
    if (school_id !== undefined) updates.school_id = school_id;
    if (member_state_id !== undefined) updates.member_state_id = member_state_id;
    if (grades_csv !== undefined) updates.grades_csv = grades_csv;
    if (status === 'approved') updates.approved_at = now;

    const { data, error } = await supabase
      .schema('authz')
      .from('memberships')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to update membership' }, { status: 500 });
    }

    return NextResponse.json({ membership: data });
  } catch (error) {
    console.error('PATCH membership error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET /api/sso/memberships/[id]
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth0.getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const supabase = supabaseAdminA();

    const { data, error } = await supabase
      .schema('authz')
      .from('memberships')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return NextResponse.json({ error: 'Membership not found' }, { status: 404 });
    }

    return NextResponse.json({ membership: data });
  } catch (error) {
    console.error('GET membership error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}