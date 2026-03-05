// app/request-access/page.tsx
export const dynamic = 'force-dynamic';

import { auth0 } from '@/lib/auth0';
import { redirect } from 'next/navigation';
import { checkSSOAccess } from '@/lib/sso-check';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import RequestAccessButton from './RequestAccessButton';

export default async function RequestAccessPage() {
  const session = await auth0.getSession();

  if (!session?.user) {
    redirect('/auth/login');
  }

  const user = session.user;

  const result = await checkSSOAccess(
    user.sub,
    user.email ?? '',
    user.name ?? user.email ?? ''
  );

  // If approved, redirect to dashboard
  if (result.status === 'approved') {
    redirect('/dashboard');
  }

  const statusConfig = {
    pending: {
      icon: '⏳',
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      badge: 'bg-amber-100 text-amber-700',
      title: 'Request Pending',
      message: 'Your access request has been submitted and is awaiting admin approval.',
    },
    denied: {
      icon: '✗',
      color: 'text-red-600',
      bg: 'bg-red-50',
      border: 'border-red-200',
      badge: 'bg-red-100 text-red-700',
      title: 'Access Denied',
      message: 'Your access request has been denied. Please contact your administrator.',
    },
    suspended: {
      icon: '⊘',
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      badge: 'bg-orange-100 text-orange-700',
      title: 'Account Suspended',
      message: 'Your account has been suspended. Please contact your administrator.',
    },
    not_found: {
      icon: '?',
      color: 'text-slate-600',
      bg: 'bg-slate-50',
      border: 'border-slate-200',
      badge: 'bg-slate-100 text-slate-700',
      title: 'No Access Found',
      message: 'You are not registered in this system. Click below to request access.',
    },
  };

  const config = statusConfig[result.status];
  const membership = result.status !== 'not_found' ? result.membership : null;

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <Card className="text-center">
          {/* Status Icon */}
          <div className={`w-16 h-16 ${config.bg} border-2 ${config.border} rounded-full flex items-center justify-center mx-auto mb-4`}>
            <span className={`text-2xl ${config.color}`}>{config.icon}</span>
          </div>

          {/* Status Badge */}
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide mb-3 ${config.badge}`}>
            {result.status.replace('_', ' ')}
          </span>

          <h1 className="text-xl font-bold text-slate-800 mb-2">{config.title}</h1>
          <p className="text-slate-600 mb-6 text-sm">{config.message}</p>

          {/* Account Info */}
          <div className="bg-slate-50 rounded-lg p-4 mb-6 text-left border border-slate-200">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Your Account</p>
            <p className="font-medium text-slate-800">{user.name || 'Unknown'}</p>
            <p className="text-sm text-slate-500">{user.email}</p>
            {membership && (
              <p className="text-xs text-slate-400 mt-1">
                Requested: {new Date(membership.created_at).toLocaleDateString()}
              </p>
            )}
          </div>

          {/* Action buttons */}
          <div className="space-y-3">
            {result.status === 'not_found' && (
              <RequestAccessButton
                auth0Sub={user.sub}
                email={user.email ?? ''}
                name={user.name ?? user.email ?? ''}
              />
            )}

            {result.status === 'pending' && (
              <div className={`text-sm ${config.bg} border ${config.border} rounded-lg p-3 text-amber-700`}>
                Your request is in the queue. An admin will review it shortly.
              </div>
            )}

            <Button
              href="/auth/logout"
              variant="outline"
              size="sm"
              className="w-full"
            >
              Logout
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}