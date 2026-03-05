// app/sso-control/page.tsx

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardHeader } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { DataTable } from '@/components/DataTable';

interface Membership {
  id: string;
  auth0_sub: string;
  email: string;
  full_name: string;
  role: 'student' | 'teacher' | 'admin';
  status: 'pending' | 'approved' | 'denied' | 'suspended';
  school_id: string;
  member_state_id: string;
  grades_csv: string;
  created_at: string;
}

type Tab = 'approved' | 'pending';

const roleColors: Record<string, 'info' | 'success' | 'warning'> = {
  student: 'info',
  teacher: 'success',
  admin: 'warning',
};

export default function SSOControlPage() {
  const [activeTab, setActiveTab] = useState<Tab>('approved');
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchMemberships = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/sso/memberships?status=${activeTab === 'approved' ? 'approved' : 'pending'}`);
      if (!res.ok) throw new Error('Failed to fetch memberships');
      const data = await res.json();
      setMemberships(data.memberships ?? []);
    } catch (e) {
      setError('Failed to load memberships.');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchMemberships();
  }, [fetchMemberships]);


  const handleAction = async (id: string, status: 'approved' | 'denied', role?: string) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/sso/memberships/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, ...(role ? { role } : {}) }),
      });
      if (!res.ok) throw new Error('Action failed');
      await fetchMemberships();
    } catch {
      setError('Failed to update membership.');
    } finally {
      setActionLoading(null);
    }
  };

  const approvedColumns = [
    { key: 'full_name', header: 'Name' },
    { key: 'email', header: 'Email' },
    {
      key: 'role',
      header: 'Role',
      render: (item: Membership) => (
        <Badge variant={roleColors[item.role] ?? 'default'}>{item.role}</Badge>
      ),
    },
    { key: 'school_id', header: 'School' },
    { key: 'member_state_id', header: 'State' },
    { key: 'grades_csv', header: 'Grades' },
    {
      key: 'created_at',
      header: 'Approved',
      render: (item: Membership) => new Date(item.created_at).toLocaleDateString(),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: Membership) => (
        <div className="flex gap-2">
          <Button
            variant="danger"
            size="sm"
            disabled={actionLoading === item.auth0_sub}
            onClick={() => handleAction(item.auth0_sub, 'suspended')}
          >
            Suspend
          </Button>
        </div>
      ),
    },
  ];

  const pendingColumns = [
    { key: 'full_name', header: 'Name' },
    { key: 'email', header: 'Email' },
    {
      key: 'created_at',
      header: 'Requested',
      render: (item: Membership) => new Date(item.created_at).toLocaleDateString(),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: Membership) => (
        <div className="flex gap-2">
          <ApproveWithRole
            id={item.auth0_sub}
            loading={actionLoading === item.auth0_sub}
            onApprove={(role) => handleAction(item.auth0_sub, 'approved', role)}
          />
          <Button
            variant="danger"
            size="sm"
            disabled={actionLoading === item.auth0_sub}
            onClick={() => handleAction(item.auth0_sub, 'denied')}
          >
            Deny
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-[calc(100vh-4rem)] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800 mb-1">SSO Control</h1>
          <p className="text-slate-600">Manage user memberships and access requests</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-slate-100 rounded-lg p-1 w-fit">
          {(['approved', 'pending'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors capitalize ${
                activeTab === tab
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              {tab === 'approved' ? 'Approved Users' : 'Pending Requests'}
            </button>
          ))}
        </div>

        {/* Content */}
        <Card padding="none">
          <CardHeader
            title={activeTab === 'approved' ? 'Approved Users' : 'Pending Requests'}
            subtitle={
              activeTab === 'approved'
                ? 'All users with approved access'
                : 'Users awaiting access approval'
            }
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            }
          />

          {error && (
            <div className="mx-6 mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-16 text-slate-500">
              <svg className="animate-spin w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Loading...
            </div>
          ) : (
            <DataTable<Membership>
              data={memberships}
              columns={activeTab === 'approved' ? approvedColumns : pendingColumns}
              emptyMessage={
                activeTab === 'approved' ? 'No approved users yet' : 'No pending requests'
              }
            />
          )}
        </Card>
      </div>
    </div>
  );
}

// Sub-component for approving with role selection
function ApproveWithRole({
  id,
  loading,
  onApprove,
}: {
  id: string;
  loading: boolean;
  onApprove: (role: string) => void;
}) {
  const [role, setRole] = useState('student');

  return (
    <div className="flex gap-1">
      <select
        value={role}
        onChange={(e) => setRole(e.target.value)}
        disabled={loading}
        className="text-xs border border-slate-300 rounded px-2 py-1 text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="student">Student</option>
        <option value="teacher">Teacher</option>
        <option value="admin">Admin</option>
      </select>
      <Button
        variant="primary"
        size="sm"
        disabled={loading}
        onClick={() => onApprove(role)}
      >
        Approve
      </Button>
    </div>
  );
}