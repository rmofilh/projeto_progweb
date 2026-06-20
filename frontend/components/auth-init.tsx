'use client';

import { useEffect } from 'react';
import { authCubit } from '@/src/application/auth/AuthCubit';

export function AuthInit() {
  useEffect(() => {
    authCubit.restoreSession();
  }, []);
  return null;
}
