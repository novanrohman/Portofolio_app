"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function TopLoader() {
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => setLoading(false), 250);
    return () => clearTimeout(timeout);
  }, [pathname]);

  return (
    <div className={`fixed inset-x-0 top-0 z-50 h-1 bg-blue-600 transition-all duration-300 ${loading ? "scale-x-100" : "scale-x-0 origin-left"}`} />
  );
}
