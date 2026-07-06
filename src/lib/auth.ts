import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import type { Role } from "@prisma/client";

declare module "next-auth" {
  interface User {
    username?: string;
    roles?: Role[];
  }
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      username: string;
      avatarUrl?: string | null;
      roles: Role[];
    };
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    username?: string;
    roles?: Role[];
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase().trim() },
          include: { roles: true },
        });
        if (!user?.passwordHash) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          username: user.username,
          image: user.avatarUrl,
          roles: user.roles.map(r => r.role),
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.username = user.username;
        token.roles = user.roles ?? [];
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.username = (token.username as string) ?? "";
        session.user.roles = (token.roles as Role[]) ?? [];
      }
      return session;
    },
  },
});

export async function requireAuth() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  return session;
}

export async function requireAdmin() {
  const session = await requireAuth();
  if (!session.user.roles.includes("admin")) throw new Error("Forbidden");
  return session;
}

export function hasRole(roles: Role[], role: Role) {
  return roles.includes(role);
}
