"use client";

import { useSession, signOut } from "next-auth/react";

export default function UserMenu() {
  const { data: session } = useSession();

  if (!session?.user) return null;

  return (
    <div className="border-t border-ink-800 pt-4 mt-auto">
      <p className="truncate text-xs text-paper-200/70">{session.user.email}</p>
      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="mt-1 text-xs text-paper-200/50 hover:text-paper-50 transition-colors"
      >
        Sair
      </button>
    </div>
  );
}
