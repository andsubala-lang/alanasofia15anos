"use client";

import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <button
      onClick={handleLogout}
      className="text-sm text-steel hover:text-platinum border border-slateline rounded-lg px-3 py-1.5 transition-colors"
    >
      Sair
    </button>
  );
}
