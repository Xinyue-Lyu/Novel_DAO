"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/contest", label: "Contest" },
  { href: "/treasury", label: "Treasury" },
  { href: "/admin", label: "Admin" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav
      style={{
        borderBottom: "1px solid #e5e7eb",
        backgroundColor: "#ffffff",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
          padding: "16px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        <div style={{ fontSize: "22px", fontWeight: 700 }}>Novel DAO</div>

        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          {links.map((link) => {
            const active = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  textDecoration: "none",
                  padding: "10px 14px",
                  borderRadius: "10px",
                  fontSize: "15px",
                  fontWeight: 500,
                  color: active ? "#ffffff" : "#111827",
                  backgroundColor: active ? "#2563eb" : "#f3f4f6",
                  border: active ? "1px solid #2563eb" : "1px solid #e5e7eb",
                }}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}