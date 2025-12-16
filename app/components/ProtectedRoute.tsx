// components/ProtectedRoute.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: ('owner' | 'tenant')[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      // 1. If not logged in, go to Login
      if (!user) {
        router.replace('/');
        return;
      }

      // 2. If logged in but wrong role, redirect to THEIR dashboard
      if (!allowedRoles.includes(user.role)) {
        if (user.role === 'owner') {
            router.replace('/dashboard/owner');
        } else {
            router.replace('/dashboard/tenant');
        }
      }
    }
  }, [user, loading, router, allowedRoles]);

  // Show loading spinner while checking
  if (loading || !user || !allowedRoles.includes(user.role)) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400">Verifying Access...</div>;
  }

  // Render the protected page
  return <>{children}</>;
}