// app/page.tsx

import { auth0 } from '@/lib/auth0';
import { redirect } from 'next/navigation';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { checkSSOAccess } from '@/lib/sso-check';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Home() {
  const session = await auth0.getSession();
  const isAuthenticated = !!session?.user;
  const user = session?.user;

  if (isAuthenticated && user) {
    // Run SSO check — no token needed, uses service role key server-side
    const result = await checkSSOAccess(
      user.sub,
      user.email ?? '',
      user.name ?? user.email ?? ''
    );

    // Redirect based on SSO status
    if (result.status === 'approved') {
      redirect('/dashboard');
    } else {
      redirect('/request-access');
    }
  }

  // Not authenticated — show login landing page
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <Card className="text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>

          <h1 className="text-2xl font-bold text-slate-800 mb-2">SSO Demo</h1>
          <p className="text-slate-600 mb-8">Auth0 + Multi Supabase Projects</p>

          <Button href="/auth/login" variant="primary" size="lg" className="w-full mb-6">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            Login with SSO
          </Button>

          <div className="space-y-3 pt-6 border-t border-slate-200">
            {['Secure Authentication', 'Roster-based Access', 'Multi-tenant Data Isolation'].map((feature) => (
              <div key={feature} className="flex items-center justify-center gap-2 text-sm text-slate-600">
                <svg className="w-4 h-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </Card>

        <p className="text-center text-sm text-slate-500 mt-6">Powered by Auth0 & Supabase</p>
      </div>
    </div>
  );
}