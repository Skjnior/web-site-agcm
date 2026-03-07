// types/next-auth.d.ts

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      memberId: string | null;
    }
  }

  interface User {
    id: string;
    email: string;
    name: string;
    role: string;
    memberId: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string;
    memberId: string | null;
  }
}