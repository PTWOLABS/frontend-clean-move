"use client";

import Link from "next/link";
import { Bell, Check, ChevronDown, LogOut, Search, Settings, UserRound, X } from "lucide-react";
import { SyntheticEvent, useId, useState } from "react";

import { AppSidebarMobileTrigger } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useCurrentUser } from "@/features/user/hooks/use-current-user";
import { cn } from "@/shared/utils/cn";
import { useLogout } from "@/features/auth/hooks/use-logout";
import { useSidebar } from "../ui/sidebar";

const searchCategories = [
  { value: "services", label: "Serviços" },
  { value: "customers", label: "Clientes" },
  { value: "appointments", label: "Agendamentos" },
];

const fallbackUser = {
  name: "Clean Move Detail",
  email: "Administrador",
};

function getInitials(name: string) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("");

  return initials || "CM";
}

function LogoutMenuItem() {
  const { mutate, isPending } = useLogout();

  return (
    <DropdownMenuItem
      className="text-destructive focus:text-destructive hover:bg-destructive/10!"
      disabled={isPending}
      onSelect={() => mutate()}
    >
      <LogOut aria-hidden />
      <span>Sair</span>
    </DropdownMenuItem>
  );
}

function UserAvatar({
  profileImageUrl,
  name,
  initials,
  className,
  fallbackClassName,
}: {
  profileImageUrl: string | null;
  name: string;
  initials: string;
  className?: string;
  fallbackClassName?: string;
}) {
  return (
    <Avatar className={className}>
      {profileImageUrl ? (
        <AvatarImage src={profileImageUrl} alt={`Foto de perfil de ${name}`} />
      ) : null}
      <AvatarFallback className={fallbackClassName}>{initials}</AvatarFallback>
    </Avatar>
  );
}

function AppHeaderSearch({ className }: { className?: string }) {
  const searchInputId = useId();
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(searchCategories[0]);

  function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
  }

  return (
    <form
      role="search"
      aria-label="Buscar no sistema"
      onSubmit={handleSubmit}
      className={cn(
        "flex h-11 min-w-0 items-center rounded-xl border border-border bg-card px-2 transition-colors duration-200 ease-clean focus-within:border-primary/45 focus-within:ring-2 focus-within:ring-primary/15 shadow-xs",
        className,
      )}
    >
      <label htmlFor={searchInputId} className="sr-only">
        Buscar
      </label>

      <Search aria-hidden className="ml-1 size-4 shrink-0 text-muted-foreground" />

      <Input
        id={searchInputId}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Buscar..."
        className="h-9 min-w-0 flex-1 border-0 bg-transparent px-3 text-sm shadow-none outline-none placeholder:text-muted-foreground focus-visible:ring-0"
      />

      {query ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Limpar busca"
          onClick={() => setQuery("")}
          className="size-7 shrink-0 rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        >
          <X aria-hidden className="size-4" />
        </Button>
      ) : null}

      <div className="mx-2 hidden h-6 w-px shrink-0 bg-border sm:block" aria-hidden />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            className="hidden h-8 shrink-0 gap-1.5 rounded-lg px-2 text-sm font-medium text-foreground hover:bg-muted hover:text-accent-foreground sm:inline-flex"
          >
            <span className="max-w-28 truncate">{selectedCategory.label}</span>
            <ChevronDown aria-hidden className="size-4 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Buscar em</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {searchCategories.map((category) => (
            <DropdownMenuItem
              key={category.value}
              onSelect={() => setSelectedCategory(category)}
              className="justify-between"
            >
              <span>{category.label}</span>
              {selectedCategory.value === category.value ? (
                <Check aria-hidden className="size-4 text-primary" />
              ) : null}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        type="submit"
        size="icon"
        aria-label="Executar busca"
        className="size-8 shrink-0 rounded-full"
      >
        <Search aria-hidden className="size-4" />
      </Button>
    </form>
  );
}

function AccountMenu() {
  const { data, isLoading, isError } = useCurrentUser();
  const user = data ?? fallbackUser;
  const name = isLoading ? "Carregando perfil" : user.name;
  const email = isLoading || isError ? fallbackUser.email : user.email;
  const profileImageUrl = data?.profileImageUrl ?? null;
  const initials = getInitials(name).toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          className="h-10 min-w-0 gap-2 rounded-xl px-2 text-left hover:text-accent-foreground"
          aria-label={`Abrir menu da conta de ${name}`}
        >
          <Avatar className="size-8 shrink-0">
            {profileImageUrl ? (
              <AvatarImage src={profileImageUrl} alt={`Foto de perfil de ${name}`} />
            ) : null}
            <AvatarFallback className="bg-primary text-xs font-semibold text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>

          <span className="hidden min-w-0 flex-col leading-tight lg:flex">
            <span className="max-w-40 truncate text-sm font-semibold text-foreground">{name}</span>
            <span className="max-w-40 truncate text-xs text-muted-foreground">{email}</span>
          </span>

          <ChevronDown
            aria-hidden
            className="hidden size-4 shrink-0 text-muted-foreground lg:block"
          />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        side="bottom"
        align="end"
        sideOffset={8}
        collisionPadding={12}
        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg border-sidebar-border bg-popover text-popover-foreground"
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-3 px-2 py-2">
            <UserAvatar
              profileImageUrl={profileImageUrl}
              name={name}
              initials={initials}
              className="size-9"
              fallbackClassName="bg-sidebar-primary text-xs font-semibold text-sidebar-primary-foreground"
            />
            <div className="grid min-w-0 flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">{name}</span>
              <span className="truncate text-xs text-muted-foreground">{email}</span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/user">
            <UserRound aria-hidden />
            <span>Conta</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Bell aria-hidden />
          <span>Notificações</span>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings">
            <Settings aria-hidden />
            <span>Configurações</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <LogoutMenuItem />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AppHeader() {
  const { state } = useSidebar();
  return (
    <header
      className={cn(
        "sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 ",
        state === "expanded" ? "md:h-17.75" : "",
      )}
    >
      <div className="flex min-h-16 flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:px-8">
        <div className="flex w-full min-w-0 items-center gap-3">
          <div className="md:hidden">
            <AppSidebarMobileTrigger />
          </div>

          <AppHeaderSearch className="hidden max-w-2xl flex-1 md:flex" />

          <div className="ml-auto flex shrink-0 items-center gap-1.5">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Abrir notificações"
              className="size-9 rounded-lg bg-background text-muted-foreground hover:text-accent-foreground"
            >
              <Bell aria-hidden className="size-4" />
            </Button>

            <ThemeToggle className="size-9 rounded-lg  bg-background text-muted-foreground hover:text-accent-foreground" />

            <AccountMenu />
          </div>
        </div>

        <AppHeaderSearch className="md:hidden" />
      </div>
    </header>
  );
}
