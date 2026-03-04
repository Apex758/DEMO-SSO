// Force dynamic rendering to check session on every request
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import { auth0 } from "@/lib/auth0";
import { supabaseAWithToken } from "@/lib/supabaseA";
import { supabaseBWithToken } from "@/lib/supabaseB";
import { Card, CardHeader } from "@/components/Card";
import { DataTable } from "@/components/DataTable";
import { Badge } from "@/components/Badge";
import Link from "next/link";
import { Button } from "@/components/Button";

interface Lesson {
  id: number;
  member_state_id: string;
  grade_level: number;
  title: string;
}

interface Progress {
  id: number;
  user_sub: string;
  member_state_id: string;
  lesson_id: number;
  status: string;
  updated_at: string;
}

export default async function Dashboard() {
  // Get session server-side
  const session = await auth0.getSession();

  if (!session) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6">
        <Card className="text-center max-w-md">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-slate-800 mb-2">
            Access Required
          </h1>
          <p className="text-slate-600 mb-6">
            Please login first to access the dashboard.
          </p>
          <Button href="/auth/login" variant="primary">
            Login
          </Button>
        </Card>
      </div>
    );
  }

  const user = session.user;

  // Get access token server-side
  const { token: accessToken } = await auth0.getAccessToken();

  // Call Supabase A directly
  const supabaseA = supabaseAWithToken(accessToken);
  const { data: lessons } = await supabaseA
    .from("lessons")
    .select("id, member_state_id, grade_level, title")
    .order("id", { ascending: true });

  // Call Supabase B directly
  const supabaseB = supabaseBWithToken(accessToken);
  const { data: progress } = await supabaseB
    .from("progress")
    .select("id, user_sub, member_state_id, lesson_id, status, updated_at")
    .order("updated_at", { ascending: false });

  // Define columns for lessons table
  const lessonColumns = [
    {
      key: "id",
      header: "ID",
      className: "w-16",
    },
    {
      key: "member_state_id",
      header: "Member State",
    },
    {
      key: "grade_level",
      header: "Grade",
    },
    {
      key: "title",
      header: "Title",
    },
    {
      key: "actions",
      header: "Actions",
      className: "w-24",
      render: (item: Lesson) => (
        <Button variant="outline" size="sm">
          View
        </Button>
      ),
    },
  ];

  // Define columns for progress table
  const progressColumns = [
    {
      key: "id",
      header: "ID",
      className: "w-16",
    },
    {
      key: "user_sub",
      header: "User",
      render: (item: Progress) => (
        <span className="font-mono text-xs">
          {item.user_sub.substring(0, 8)}...
        </span>
      ),
    },
    {
      key: "member_state_id",
      header: "Member State",
    },
    {
      key: "lesson_id",
      header: "Lesson",
    },
    {
      key: "status",
      header: "Status",
      render: (item: Progress) => {
        const variant = item.status === "completed" ? "success" : "warning";
        return <Badge variant={variant}>{item.status}</Badge>;
      },
    },
    {
      key: "updated_at",
      header: "Updated",
      render: (item: Progress) => {
        const date = new Date(item.updated_at);
        return date.toLocaleDateString();
      },
    },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Dashboard</h1>
          <p className="text-slate-600">
            Welcome back, {user.name || user.email?.split('@')[0] || 'User'}
          </p>
        </div>

        {/* Project A: Lessons */}
        <Card className="mb-6">
          <CardHeader
            title="Project A: Lessons"
            subtitle="Lessons data from Supabase Project A"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            }
          />
          <DataTable<Lesson>
            data={lessons || []}
            columns={lessonColumns}
            emptyMessage="No lessons found"
          />
        </Card>

        {/* Project B: Progress */}
        <Card>
          <CardHeader
            title="Project B: Progress"
            subtitle="User progress data from Supabase Project B"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            }
          />
          <DataTable<Progress>
            data={progress || []}
            columns={progressColumns}
            emptyMessage="No progress data found"
          />
        </Card>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-slate-600 hover:text-slate-800">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
