import Link from "next/link";
import LogoutButton from "./LogoutButton";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-slateline px-6 py-4 flex items-center justify-between">
        <Link href="/admin" className="font-display text-xl">
          Alana Sofia · Admin
        </Link>
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
