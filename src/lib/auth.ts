import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { uniqueUsername } from "@/lib/oauth";
import type { Role } from "@prisma/client";

declare module "next-auth" {
  interface User {
    username?: string;
    avatarUrl?: string | null;
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
    avatarUrl?: string | null;
    roles?: Role[];
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
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
          avatarUrl: user.avatarUrl,
          roles: user.roles.map(r => r.role),
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ account, profile }) {
      if (account?.provider !== "google") return true;

      const email = profile?.email?.toLowerCase().trim();
      if (!email) return false;

      try {
        let dbUser = await prisma.user.findUnique({
          where: { email },
          include: { accounts: true },
        });

        if (!dbUser) {
          const username = await uniqueUsername(email);
          const picture = (profile as { picture?: string } | undefined)?.picture ?? null;
          const displayName = profile?.name ?? username;
          dbUser = await prisma.user.create({
            data: {
              email,
              name: displayName,
              username,
              avatarUrl: picture,
              emailVerified: new Date(),
              passwordHash: null,
              roles: { create: [{ role: "user" as Role }] },
            },
            include: { accounts: true },
          });
        }

        await prisma.account.upsert({
          where: {
            provider_providerAccountId: {
              provider: "google",
              providerAccountId: account.providerAccountId,
            },
          },
          create: {
            userId: dbUser.id,
            type: account.type,
            provider: account.provider,
            providerAccountId: account.providerAccountId,
            access_token: account.access_token ?? null,
            refresh_token: account.refresh_token ?? null,
            expires_at: account.expires_at ?? null,
            token_type: account.token_type ?? null,
            scope: account.scope ?? null,
            id_token: account.id_token ?? null,
          },
          update: {
            access_token: account.access_token ?? null,
            refresh_token: account.refresh_token ?? null,
            expires_at: account.expires_at ?? null,
            id_token: account.id_token ?? null,
          },
        });

        return true;
      } catch {
        return false;
      }
    },

    async jwt({ token, user, account }) {
      if (account?.provider === "google" && token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email.toLowerCase().trim() },
          include: { roles: true },
        });
        if (dbUser) {
          token.sub = dbUser.id;
          token.username = dbUser.username;
          token.avatarUrl = dbUser.avatarUrl ?? null;
          token.roles = dbUser.roles.map(r => r.role);
        }
      } else if (user) {
        token.sub = user.id;
        token.username = user.username;
        token.avatarUrl = user.avatarUrl ?? null;
        token.roles = user.roles ?? [];
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.username = (token.username as string) ?? "";
        session.user.avatarUrl = (token.avatarUrl as string | null) ?? null;
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
