'use client';

import { Navbar } from './Navbar';

interface NavbarClientProps {
  isAuthenticated: boolean;
  user?: {
    name?: string;
    email?: string;
    picture?: string;
  } | null;
}

export function NavbarClient({ isAuthenticated, user }: NavbarClientProps) {
  return <Navbar isAuthenticated={isAuthenticated} user={user} />;
}