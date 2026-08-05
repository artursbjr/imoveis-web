import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

// Retorna o id do Usuario (= tenant) da sessão atual, ou null se não autenticado.
export async function requireUsuarioId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  return (session.user as any).id as string;
}
