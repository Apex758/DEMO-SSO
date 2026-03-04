// app/request-access/page.tsx

import { auth0 } from '@/lib/auth0';
import { redirect } from 'next/navigation';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import { checkSSOAccess } from '@/lib/sso-check';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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

  // If somehow approved, redirect to dashboard
  if (result.status === 'approved') {
    redirect('/dashboard');
  }

  const statusConfig = {
    pending: {
      badge: 'warning' as const,
      label: 'Pending Review',
      icon: (
        <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      iconBg: 'bg-amber-100',
      title: 'Access Request Pending',
      message: "Your account isn't on the approved roster yet. An administrator will review your request.",
    },
    denied: {
      badge: 'danger' as const,
      label: 'Access Denied',
      icon: (
        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
        </svg>
      ),
      iconBg: 'bg-red-100',
      title: 'Access Denied',
      message: 'Your access request has been denied. Please contact your administrator for assistance.',
    },
    suspended: {
      badge: 'danger' as const,
      label: 'Suspended',
      icon: (
        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
      iconBg: 'bg-red-100',
      title: 'Account Suspended',
      message: 'Your account has been suspended. Please contact your administrator.',
    },
    not_found: {
      badge: 'warning' as const,
      label: 'Not Found',
      icon: (
        <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      iconBg: 'bg-amber-100',
      title: 'Access Required',
      message: 'We could not determine your access status. Please contact your administrator.',
    },
  };

  const config = statusConfig[result.status as keyof typeof statusConfig] ?? statusConfig.not_found;
  const membership = result.status !== 'not_found' ? result.membership : null;

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <Card className="text-center">
          {/* Status Icon */}
          <div className={`w-16 h-16 ${config.iconBg} rounded-full flex items-center justify-center mx-auto mb-4`}>
            {config.icon}
          </div>

          {/* Badge */}
          <div className="flex justify-center mb-4">
            <Badge variant={config.badge}>{config.label}</Badge>
          </div>

          {/* Title & Message */}
          <h1 className="text-xl font-bold text-slate-800 mb-2">{config.title}</h1>
          <p className="text-slate-600 mb-6">{config.message}</p>

          {/* User Info */}
          <div className="bg-slate-50 rounded-lg p-4 text-left mb-6">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Your Account</p>
            <p className="text-sm font-medium text-slate-800">{membership?.full_name || user.name}</p>
            <p className="text-sm text-slate-600">{user.email}</p>
            {membership && membership.requested_at && (
              <p className="text-xs text-slate-400 mt-2">
                Requested {new Date(membership.requested_at).toLocaleDateString()}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            {result.status === 'pending' && (
              <p className="text-xs text-slate-500">
                Check back later or contact your school administrator to expedite your request.
              </p>
            )}
            <Button href="/auth/logout" variant="outline" size="sm">
              Logout
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}