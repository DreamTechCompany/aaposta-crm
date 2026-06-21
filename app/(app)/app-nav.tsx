"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

const links = [
  { href: "/eventos", label: "Eventos" },
  { href: "/expositores", label: "Clientes" },
];

// Nav principal com indicador da seção ativa que desliza entre os itens
// (layoutId compartilhado). Client component só pra ter o pathname.
export function AppNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1">
      <Link
        href="/eventos"
        className="mr-3 font-semibold tracking-tight text-slate-900"
      >
        AAposta CRM
      </Link>
      {links.map((link) => {
        const active =
          pathname === link.href || pathname.startsWith(link.href + "/");
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`relative rounded-md px-3 py-1.5 text-sm transition-colors ${
              active
                ? "text-slate-900"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            {active && (
              <motion.span
                layoutId="nav-active"
                className="absolute inset-0 rounded-md bg-slate-100"
                transition={{ type: "spring", stiffness: 480, damping: 38 }}
              />
            )}
            <span className="relative">{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
