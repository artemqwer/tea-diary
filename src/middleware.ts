import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

export default NextAuth(authConfig).auth;

export const config = {
  // Цей рядок каже: перевіряй все, КРІМ статичних файлів (картинки, фавіконки) та API
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};