import { type DefaultSession, type DefaultUser } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string | null; 
    } & DefaultSession['user'];
  }

  interface User extends DefaultUser {
    role?: string | null; 
  }
}

