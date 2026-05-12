import Link from "next/link";

export default function Home() {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold tracking-tight">
        Frontend de exemplo - arquitetura por features
      </h2>
      <p className="text-muted-foreground">
        Use os links abaixo para navegar pelos domínios principais.
      </p>
      <nav className="flex flex-wrap gap-3">
        <Link
          href="/login"
          className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
        >
          Domínio Auth / Login
        </Link>
        <Link
          href="/user"
          className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
        >
          Domínio User
        </Link>
        <Link
          href="/servicos"
          className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
        >
          Domínio Serviços
        </Link>
      </nav>
    </div>
  );
}
