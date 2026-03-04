import { auth0 } from './auth0';

/**
 * Validates if the current session's token_version matches the stored version in Auth0.
 * This is used to invalidate sessions when password is reset or compromise is detected.
 *
 * Note: This function should be called from a context where getSession works (API routes, Server Components)
 * For middleware, use validateTokenVersionFromRequest instead
 *
 * @returns {Promise<{valid: boolean, tokenVersion?: number, storedVersion?: number}>}
 */
export async function validateTokenVersion(): Promise<{
  valid: boolean;
  tokenVersion?: number;
  storedVersion?: number;
}> {
  try {
    const session = await auth0.getSession();
    
    if (!session?.user) {
      return { valid: false };
    }
    
    // Get token_version from the JWT claims (session)
    const tokenVersion = (session.user.token_version as number) || 1;
    
    // Get the user's current metadata from Auth0
    const userId = session.user.sub;
    const token = await auth0.getAccessToken();
    const domain = process.env.AUTH0_DOMAIN!;
    
    const response = await fetch(`https://${domain}/api/v2/users/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.error('Failed to fetch user from Auth0');
      return { valid: false };
    }
    
    const userData = await response.json();
    const storedVersion = (userData.user_metadata?.token_version as number) || 1;
    
    // Compare versions
    const isValid = tokenVersion === storedVersion;
    
    return {
      valid: isValid,
      tokenVersion,
      storedVersion
    };
  } catch (error) {
    console.error('Token version validation error:', error);
    return { valid: false };
  }
}

/**
 * Gets the current token_version from the session
 */
export async function getCurrentTokenVersion(): Promise<number> {
  try {
    const session = await auth0.getSession();
    return (session?.user?.token_version as number) || 1;
  } catch {
    return 1;
  }
}
