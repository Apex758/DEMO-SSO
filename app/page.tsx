import { auth0 } from '@/lib/auth0';
import Link from 'next/link';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';

// Force dynamic rendering to check session on every request
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home() {
  const session = await auth0.getSession();
  const isAuthenticated = !!session?.user;
  const user = session?.user;

  // If authenticated, show welcome page with quick stats and actions
  if (isAuthenticated && user) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          {/* Welcome Card */}
          <Card className="mb-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                {user.picture ? (
                  <img 
                    src={user.picture} 
                    alt={user.name || 'User'} 
                    className="w-16 h-16 rounded-full"
                  />
                ) : (
                  <span className="text-2xl font-bold text-blue-600">
                    {user.name?.charAt(0) || user.email?.charAt(0) || 'U'}
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-bold text-slate-800 mb-2">
                Welcome back, {user.name || user.email?.split('@')[0] || 'User'}!
              </h1>
              <p className="text-slate-600 mb-6">
                {user.email}
              </p>
              <div className="flex items-4-center justify-center gap">
                <Button href="/dashboard" variant="primary">
                  Go to Dashboard
                </Button>
              </div>
            </div>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="text-center hover:shadow-lg transition-shadow cursor-pointer">
              <Link href="/dashboard">
                <div className="text-blue-600 mb-2">
                  <svg className="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-slate-800">SSO Control</h3>
                <p className="text-sm text-slate-500">Manage SSO settings</p>
              </Link>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // If not authenticated, show login page
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <Card className="text-center">
          {/* Logo */}
          <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          
          {/* Heading */}
          <h1 className="text-2xl font-bold text-slate-800 mb-2">
            SSO Demo
          </h1>
          <p className="text-slate-600 mb-8">
            Auth0 + Multi Supabase Projects
          </p>
          
          {/* Login Button */}
          <Button href="/auth/login" variant="primary" size="lg" className="w-full mb-6">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            Login with SSO
          </Button>
          
          {/* Features */}
          <div className="space-y-3 pt-6 border-t border-slate-200">
            <div className="flex items-center justify-center gap-2 text-sm text-slate-600">
              <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Secure Authentication</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-slate-600">
              <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Roster-based Access</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-sm text-slate-600">
              <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Multi-tenant Data Isolation</span>
            </div>
          </div>
        </Card>
        
        {/* Footer */}
        <p className="text-center text-sm text-slate-500 mt-6">
          Powered by Auth0 & Supabase
        </p>
      </div>
    </div>
  );
}