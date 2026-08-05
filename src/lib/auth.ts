import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

/**
 * Configuração do NextAuth (Auth.js v4).
 *
 * Estratégia: login por e-mail/senha (Credentials Provider) com sessão JWT
 * (não usamos adapter de banco para sessões — o token fica no cookie do navegador).
 *
 * Cada Usuario é um tenant independente (proprietário com sua própria carteira
 * de imóveis) — cadastro aberto via /registrar (ver
 * src/app/api/auth/registrar/route.ts).
 */
export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    CredentialsProvider({
      name: "Credenciais",
      credentials: {
        email: { label: "E-mail", type: "email" },
        senha: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.senha) return null;

        const usuario = await prisma.usuario.findUnique({
          where: { email: credentials.email },
        });
        if (!usuario) return null;

        const valido = await bcrypt.compare(credentials.senha, usuario.senhaHash);
        if (!valido) return null;

        return { id: usuario.id, email: usuario.email, name: usuario.nome };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = (user as any).id;
      return token;
    },
    async session({ session, token }) {
      if (session.user) (session.user as any).id = token.id;
      return session;
    },
  },
};
