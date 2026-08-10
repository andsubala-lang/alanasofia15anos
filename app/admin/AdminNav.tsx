"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const itens = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <rect x="3" y="3" width="7" height="9" rx="1.5" />
        <rect x="14" y="3" width="7" height="5" rx="1.5" />
        <rect x="14" y="12" width="7" height="9" rx="1.5" />
        <rect x="3" y="16" width="7" height="5" rx="1.5" />
      </svg>
    ),
  },
  {
    href: "/admin/presentes",
    label: "Presentes",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <rect x="3" y="9" width="18" height="4" rx="1" />
        <rect x="5" y="13" width="14" height="8" rx="1" />
        <path d="M12 9v12" />
        <path d="M12 9c-1.5-3-5-4-5-1.5S9 9 12 9Z" />
        <path d="M12 9c1.5-3 5-4 5-1.5S15 9 12 9Z" />
      </svg>
    ),
  },
  {
    href: "/admin/mensagens",
    label: "Mensagens",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
        <path d="M20 12.5a7.5 7.5 0 1 1-3.4-6.3" />
        <path d="M21 3l-9 9" />
        <path d="M14 3h7v7" />
      </svg>
    ),
  },
];

export default function AdminNav({
  variant = "sidebar",
}: {
  variant?: "sidebar" | "mobile";
}) {
  const pathname = usePathname();

  const ehAtivo = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  if (variant === "mobile") {
    return (
      <nav className="flex items-center gap-2 overflow-x-auto">
        {itens.map((item) => {
          const ativo = ehAtivo(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-sm whitespace-nowrap border transition-colors ${
                ativo
                  ? "bg-silver text-onyx border-silver"
                  : "border-slateline text-steel hover:text-platinum"
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <nav className="flex flex-col gap-1">
      {itens.map((item) => {
        const ativo = ehAtivo(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
              ativo
                ? "bg-onyx text-platinum border border-slateline"
                : "text-steel hover:text-platinum"
            }`}
          >
            {item.icon}
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
