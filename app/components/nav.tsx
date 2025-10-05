"use client";

import Link from 'next/link'
import { usePathname } from "next/navigation";


export function Navbar() {

  const pathname = usePathname();

  const links = [
    { href: "/", label: "Home" },
    { href: "/dr-info", label: "DR Info" },
    { href: "/predict", label: "Predict" },
  ];
  
  return (
    <>
<header className="fixed w-full glass-effect backdrop-blur z-20 shadow-lg">
  <nav className="max-w-7xl mx-auto flex items-center justify-between p-4">
    <Link href="/" className="text-xl font-bold text-teal-600 hover:text-teal-700 transition">
      <span className="text-2xl">🔬</span> DR-Check AI
    </Link>
    <div className="flex items-center space-x-4">
      {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`transition font-medium text-sm ${
                  isActive
                    ? "bg-teal-600 text-white px-3 py-1.5 rounded-full hover:bg-teal-700"
                    : "hover:text-teal-600"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
    </div>
  </nav>
</header>

    </>
  )
}
