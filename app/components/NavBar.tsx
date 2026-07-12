"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import LangToggle from "@/app/components/LangToggle";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/skills", label: "Skills" },
  { href: "/porto", label: "Portfolio" },
  { href: "/contact", label: "Contact" },
  // { href: "/admin", label: "Admin" },
];

export default function NavBar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll(); // set correct state on mount (e.g. reload mid-page)
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav className="sticky top-4 z-50 mx-4">
      <div className={`nav-shell rounded-3xl px-4 py-3 ${scrolled ? "scrolled" : "1"}`}>
        <div className="mx-auto flex max-w-12xl items-center justify-between">
          <Link href="/" className="text-lg font-semibold text-white">
            Novan Rohman
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex flex-wrap items-center gap-3 text-sm">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-full px-4 py-2 text-white/90 hover:text-white transition-all duration-300 font-bold hover:bg-white/10"
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <LangToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}
