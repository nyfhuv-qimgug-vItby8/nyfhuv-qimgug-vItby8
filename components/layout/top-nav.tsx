import Link from "next/link";

const links = [
  { href: "/log", label: "Log" },
  { href: "/reflections", label: "Reflections" },
  { href: "/dashboard", label: "Dashboard" }
];

export function TopNav() {
  return (
    <nav className="mb-10 flex items-center justify-between">
      <Link href="/" className="text-sm tracking-[0.2em] text-muted">SECOND BRAIN</Link>
      <div className="flex gap-3">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="rounded-xl border border-border px-3 py-2 text-sm text-muted hover:text-white">
            {link.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
