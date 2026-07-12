"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type NavItem = { href: string; label: string; icon: ReactNode };

// Contact sits in the middle so it can be the raised, floating action button.
const navLinks: NavItem[] = [
  {
    href: "/",
    label: "Home",
    icon: <path d="M3 10.5 12 3l9 7.5M5 9.5V21h5v-6h4v6h5V9.5" />,
  },
  {
    href: "/about",
    label: "About",
    icon: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21c0-4 3.5-7 8-7s8 3 8 7" />
      </>
    ),
  },
  {
    href: "/contact",
    label: "Contact",
    icon: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 7 9 6 9-6" />
      </>
    ),
  },
  {
    href: "/skills",
    label: "Skills",
    icon: <path d="m12 3 2.5 5.5L20 11l-5.5 2.5L12 19l-2.5-5.5L4 11l5.5-2.5L12 3Z" />,
  },
  {
    href: "/porto",
    label: "Portfolio",
    icon: (
      <>
        <rect x="3" y="7" width="18" height="13" rx="2" />
        <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      </>
    ),
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed inset-x-0 bottom-0 z-50 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2">
      <div className="bottom-nav-shell mx-auto max-w-md rounded-3xl px-1.5 py-2">
        {/* grid-cols-5 = repeat(5, minmax(0,1fr)) — each tab is exactly 1/5, never overflows */}
        <ul className="grid grid-cols-5 items-end">
          {navLinks.map((link) => {
            const active =
              link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            const isCenter = link.href === "/contact";

            if (isCenter) {
              return (
                <li key={link.href} className="min-w-0 flex justify-center">
                  <Link
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className="relative flex flex-col items-center"
                  >
                    <span
                      className={`absolute -top-9 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-emerald-400 text-white shadow-lg shadow-indigo-500/30 ring-4 ring-[#0d1426] transition-transform ${
                        active ? "scale-105" : ""
                      }`}
                    >
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        {link.icon}
                      </svg>
                    </span>
                    <span className={`mt-8 text-[10px] font-medium ${active ? "text-white" : "text-white/70"}`}>
                      {link.label}
                    </span>
                  </Link>
                </li>
              );
            }

            return (
              <li key={link.href} className="min-w-0">
                <Link
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex flex-col items-center gap-1 rounded-2xl px-0.5 py-1.5 text-[10px] font-medium transition-colors ${
                    active ? "text-white bg-white/10" : "text-white/60 hover:text-white"
                  }`}
                >
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.9"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="shrink-0"
                  >
                    {link.icon}
                  </svg>
                  <span className="w-full truncate text-center">{link.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
