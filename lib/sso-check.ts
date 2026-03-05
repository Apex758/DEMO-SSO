// lib/sso-check.ts

import { supabaseAdminA } from './supabaseAdmin';

export interface Membership {
  id: string;
  auth0_sub: string;
  email: string;
  full_name: string;
  role: 'student' | 'teacher' | 'admin';
  status: 'pending' | 'approved' | 'denied' | 'suspended';
  school_id: string | null;
  member_state_id: string | null;
  grades_csv: string | null;
  created_at: string;
}

export interface RosterEntry {
  id: string;
  email: string;
  full_name: string;
  role_expected: 'student' | 'teacher';
  school_id: string;
  member_state_id: string;
  grades_csv: string;
  active: boolean;
  created_at: string;
}

export type SSOCheckResult =
  | { status: 'approved'; membership: Membership }
  | { status: 'pending'; membership: Membership }
  | { status: 'denied'; membership: Membership }
  | { status: 'suspended'; membership: Membership }
  | { status: 'not_found' };

export async function checkSSOAccess(
  auth0Sub: string,
  email: string,
  name: string
): Promise<SSOCheckResult> {
  const supabase = supabaseAdminA();

  // Step 1: Check existing membership by auth0_sub
  const { data: existing } = await supabase
    .schema('authz')
    .from('memberships')
    .select('*')
    .eq('auth0_sub', auth0Sub)
    .single();

  if (existing) {
    return { status: existing.status, membership: existing };
  }

  // Step 2: Check roster for auto-approval
  const { data: rosterEntry } = await supabase
    .schema('authz')
    .from('roster_entries')
    .select('*')
    .eq('email', email)
    .eq('active', true)
    .single();

  if (rosterEntry) {
    const { data: newMembership, error } = await supabase
      .schema('authz')
      .from('memberships')
      .insert({
        auth0_sub: auth0Sub,
        email,
        full_name: name,
        role: rosterEntry.role_expected,
        status: 'approved',
        school_id: rosterEntry.school_id,
        member_state_id: rosterEntry.member_state_id,
        grades_csv: rosterEntry.grades_csv ?? null,
      })
      .select('*')
      .single();

    if (error || !newMembership) {
      console.error('Failed to create auto-approved membership:', error);
      return { status: 'not_found' };
    }

    return { status: 'approved', membership: newMembership };
  }

  // Step 3: No roster match — return not_found so page can prompt user to request
  return { status: 'not_found' };
}

// Separate function to explicitly create a pending membership request
export async function createPendingMembership(
  auth0Sub: string,
  email: string,
  name: string
): Promise<Membership | null> {
  const supabase = supabaseAdminA();

  const { data, error } = await supabase
    .schema('authz')
    .from('memberships')
    .insert({
      auth0_sub: auth0Sub,
      email,
      full_name: name,
      role: 'student',
      status: 'pending',
      school_id: null,
      member_state_id: null,
      grades_csv: null,
    })
    .select('*')
    .single();

  if (error || !data) {
    console.error('Failed to create pending membership:', error);
    return null;
  }

  return data;
}