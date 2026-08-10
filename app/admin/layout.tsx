import Link from "next/link";
import LogoutButton from "./LogoutButton";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-slateline px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-6">
          <Link href="/admin" className="font-display text-xl whitespace-nowrap">
            Alana Sofia · Admin
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/admin" className="text-steel hover:text-platinum">
              Presentes
            </Link>
            <Link href="/admin/mensagens" className="text-steel hover:text-platinum">
              Mensagens
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/" className="text-sm text-steel hover:text-platinum">
            Ver site
          </Link>
          <LogoutButton />
        </div>
      </header>
      <div className="px-6 py-8">{children}</div>
    </div>
  );
}
