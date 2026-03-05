// app/dashboard/page.tsx

export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { auth0 } from '@/lib/auth0';
import { redirect } from 'next/navigation';
import { supabaseAdminA, supabaseAdminB, supabaseAdminC } from '@/lib/supabaseAdmin';
import { Card, CardHeader } from '@/components/Card';
import { DataTable } from '@/components/DataTable';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import Link from 'next/link';
import type { Membership } from '@/lib/sso-check';

interface ResourceItem {
  id: number;
  title: string;
  resource_type: string;
  grade: string;
  school_id: string;
  member_state_id: string;
  created_at: string;
}

interface CourseItem {
  id: number;
  title: string;
  grade: string;
  school_id: string;
  member_state_id: string;
  created_at: string;
}

export default async function Dashboard() {
  const session = await auth0.getSession();

  if (!session?.user) {
    redirect('/auth/login');
  }

  const user = session.user;

  // Get membership from Supabase A using service role key
  const supabaseAdmin = supabaseAdminA();
  const { data: membership } = await supabaseAdmin
    .schema('authz')
    .from('memberships')
    .select('*')
    .eq('auth0_sub', user.sub)
    .single<Membership>();

  // If no approved membership, redirect to request access
  if (!membership || membership.status !== 'approved') {
    redirect('/request-access');
  }

  const isTeacher = membership.role === 'teacher' || membership.role === 'admin';

  // Fetch role-appropriate data using service role keys — bypasses RLS/JWT issues
  let resources: ResourceItem[] = [];
  let curriculum: CourseItem[] = [];

  if (isTeacher) {
    // Supabase C — curriculum.courses, filtered by school
    const supabaseC = supabaseAdminC();
    const { data, error } = await supabaseC
      .schema('curriculum')
      .from('courses')
      .select('id, title, grade, school_id, member_state_id, created_at')
      .order('id', { ascending: true });

    if (error) console.error('Supabase C error:', error);
    curriculum = data ?? [];
} else {
  const supabaseB = supabaseAdminB();
  const { data, error } = await supabaseB
    .schema('resources')           
    .from('items')
    .select('id, title, resource_type, grade, school_id, member_state_id, created_at')
    .order('id', { ascending: true });

  if (error) console.error('Supabase B error:', error);
  resources = data ?? [];
}

  const resourceColumns = [
    { key: 'id', header: 'ID', className: 'w-16' },
    { key: 'title', header: 'Title' },
    { key: 'resource_type', header: 'Type' },
    { key: 'grade', header: 'Grade' },
    { key: 'school_id', header: 'School' },
    { key: 'member_state_id', header: 'State' },
    {
      key: 'created_at',
      header: 'Added',
      render: (item: ResourceItem) => new Date(item.created_at).toLocaleDateString(),
    },
  ];

  const curriculumColumns = [
    { key: 'id', header: 'ID', className: 'w-16' },
    { key: 'title', header: 'Course' },
    { key: 'grade', header: 'Grade' },
    { key: 'school_id', header: 'School' },
    { key: 'member_state_id', header: 'State' },
    {
      key: 'created_at',
      header: 'Added',
      render: (item: CourseItem) => new Date(item.created_at).toLocaleDateString(),
    },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 mb-1">Dashboard</h1>
            <p className="text-slate-600">
              Welcome back, {user.name || user.email?.split('@')[0] || 'User'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={isTeacher ? 'success' : 'info'} className="text-sm px-3 py-1">
              {membership.role.charAt(0).toUpperCase() + membership.role.slice(1)}
            </Badge>
            {membership.member_state_id && (
              <Badge variant="default">{membership.member_state_id}</Badge>
            )}
          </div>
        </div>

        {/* Role-based content */}
        <Card className="mb-6">
          <CardHeader
            title={isTeacher ? 'Curriculum' : 'Resources'}
            subtitle={
              isTeacher
                ? 'Lesson plans and curriculum from Supabase C'
                : 'Learning resources from Supabase B'
            }
            icon={
              isTeacher ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              )
            }
          />
          {isTeacher ? (
            <DataTable<CourseItem>
              data={curriculum}
              columns={curriculumColumns}
              emptyMessage="No curriculum courses found"
            />
          ) : (
            <DataTable<ResourceItem>
              data={resources}
              columns={resourceColumns}
              emptyMessage="No resources found"
            />
          )}
        </Card>

        {/* Admin link */}
        {membership.role === 'admin' && (
          <div className="mb-6">
            <Link href="/sso-control">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer border border-blue-100">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">SSO Control Panel</h3>
                    <p className="text-sm text-slate-500">Manage user memberships and access requests</p>
                  </div>
                </div>
              </Card>
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}