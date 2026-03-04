// app/api/sso/memberships/route.ts

import { auth0 } from '@/lib/auth0';
import { supabaseAdminA } from '@/lib/supabaseAdmin';
import { NextResponse } from 'next/server';

// GET /api/sso/memberships?status=approved|pending|denied|suspended
export async function GET(request: Request) {
  try {
    const session = await auth0.getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const supabase = supabaseAdminA();

    let query = supabase
      .schema('authz')
      .from('memberships')
      .select('*')
      .order('requested_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to fetch memberships' }, { status: 500 });
    }

    return NextResponse.json({ memberships: data });
  } catch (error) {
    console.error('GET memberships error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/sso/memberships
export async function POST(request: Request) {
  try {
    const session = await auth0.getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const supabase = supabaseAdminA();

    const now = new Date().toISOString();
    const { data, error } = await supabase
      .schema('authz')
      .from('memberships')
      .insert({ ...body, requested_at: now, updated_at: now })
      .select('*')
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to create membership' }, { status: 500 });
    }

    return NextResponse.json({ membership: data }, { status: 201 });
  } catch (error) {
    console.error('POST membership error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}