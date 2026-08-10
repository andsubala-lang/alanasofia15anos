import Link from "next/link";
import AdminNav from "./AdminNav";
import LogoutButton from "./LogoutButton";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="md:flex min-h-screen">
      {/* Sidebar — desktop */}
      <aside className="hidden md:flex md:flex-col md:w-64 md:shrink-0 border-r border-slateline p-6 md:sticky md:top-0 md:h-screen">
        <div className="mb-8">
          <div className="w-10 h-10 rounded-full border border-slateline flex items-center justify-center mb-3">
            <span className="font-display text-shimmer text-lg">AS</span>
          </div>
          <p className="font-display text-lg leading-tight">Alana Sofia</p>
          <p className="text-steel text-xs uppercase tracking-wide">
            Painel administrativo
          </p>
        </div>

        <AdminNav variant="sidebar" />

        <div className="mt-auto pt-6 space-y-2">
          <Link
            href="/"
            className="block text-sm text-steel hover:text-platinum px-3 py-2"
          >
            Ver site
          </Link>
          <LogoutButton />
        </div>
      </aside>

      {/* Topo — mobile, mesmo padrão visual da sidebar */}
      <div className="md:hidden border-b border-slateline">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full border border-slateline flex items-center justify-center shrink-0">
              <span className="font-display text-shimmer text-base">AS</span>
            </div>
            <div>
              <p className="font-display text-base leading-tight">Alana Sofia</p>
              <p className="text-steel text-[10px] uppercase tracking-wide">
                Painel administrativo
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/" className="text-sm text-steel hover:text-platinum">
              Ver site
            </Link>
            <LogoutButton />
          </div>
        </div>
        <div className="px-6 pb-4">
          <AdminNav variant="mobile" />
        </div>
      </div>

      {/* Conteúdo */}
      <div className="flex-1 min-w-0">
        <div className="px-6 py-8">{children}</div>
      </div>
    </div>
  );
}
