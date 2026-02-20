import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  trustHost: true,
  pages: {
    signIn: '/login', // Вказуємо, де наша сторінка входу
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname === '/';
      const isOnLogin = nextUrl.pathname.startsWith('/login');

      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // Якщо не залогінений -> перекине на /login
      } else if (isOnLogin) {
        if (isLoggedIn) {
          // Якщо вже залогінений і лізе на логін -> на головну
          return Response.redirect(new URL('/', nextUrl));
        }
        return true;
      }
      return true;
    },
  },
  providers: [], // Тут має бути порожньо (це важливо для Middleware)
} satisfies NextAuthConfig;