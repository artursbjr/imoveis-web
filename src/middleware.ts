// Middleware global de autenticação.
//
// Protege TODAS as rotas do app (páginas e API routes) exigindo sessão válida
// do NextAuth, exceto as listadas no "matcher" abaixo:
//   - /login e /registrar: precisam ficar acessíveis sem sessão (é onde ela é criada)
//   - /api/auth/*: rotas internas do NextAuth (login, callback, etc.)
//   - /api/cron/*: chamadas pelo Vercel Cron, autenticadas por CRON_SECRET (não por cookie)
//   - assets estáticos do Next.js
export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/((?!login|registrar|api/auth|api/cron|_next/static|_next/image|favicon.ico).*)"],
};
