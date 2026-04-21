'use server';

import { auth, signIn, signOut } from '@/auth';
import { AuthError } from 'next-auth';
import { redirect } from 'next/navigation';

export async function login(formData: FormData) {
  let redirectTo = '/dashboard';
  
  let errorToRedirect = null;

  try {
    await signIn('credentials', {
      email: formData.get('email'),
      password: formData.get('password'),
      redirect: false,
    });
    
    const session = await auth();
    if (session?.user) {
      const role = (session.user as any).role;
      redirectTo = role === 'super_admin' ? '/admin' : '/dashboard';
    }
  } catch (error: any) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          errorToRedirect = 'Credenciales inválidas';
          break;
        default:
          errorToRedirect = 'Algo salió mal';
      }
    } else {
      errorToRedirect = 'Error de conexión';
    }
  }

  if (errorToRedirect) {
    redirect(`/login?error=${encodeURIComponent(errorToRedirect)}`);
  }

  redirect(redirectTo);
}

export async function logout() {
  await signOut({ redirect: false });
  redirect('/login');
}

