import { auth0 } from '@/lib/auth0';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const session = await auth0.getSession();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const userId = session.user.sub;
    
    // Get the current token_version from user metadata
    // Default to 1 if not set
    const currentVersion = (session.user.token_version as number) || 1;
    const newVersion = currentVersion + 1;
    
    // Get access token for Auth0 Management API
    const token = await auth0.getAccessToken();
    
    // Call Auth0 Management API to update user_metadata
    const domain = process.env.AUTH0_DOMAIN!;
    const response = await fetch(`https://${domain}/api/v2/users/${userId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user_metadata: {
          token_version: newVersion
        }
      })
    });
    
    if (!response.ok) {
      const error = await response.text();
      console.error('Auth0 API error:', error);
      throw new Error('Failed to update user metadata');
    }
    
    return NextResponse.json({
      success: true,
      message: 'Password reset processed. Please log in again.',
      newVersion
    });
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { error: 'Failed to process password reset' },
      { status: 500 }
    );
  }
}
