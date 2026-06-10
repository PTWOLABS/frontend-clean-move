"use client";

import Link from "next/link";
import { Bell, ChevronsUpDown, LogOut, Settings, UserRound } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarFooter as SidebarPrimitiveFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useLogout } from "@/features/auth/hooks/use-logout";
import { useCurrentUser } from "@/features/user/hooks/use-current-user";
import { ApiError } from "@/shared/api/httpClient";

function LogoutMenuItem() {
  const { mutate, isPending } = useLogout();

  return (
    <DropdownMenuItem
      className="text-destructive focus:text-destructive"
      disabled={isPending}
      onSelect={() => mutate()}
    >
      <LogOut aria-hidden />
      <span>Sair</span>
    </DropdownMenuItem>
  );
}

const fallbackUser = {
  name: "Usuário CleanMove",
  email: "Perfil da conta",
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

export function AppSidebarFooter() {
  const { data, isLoading, isError, error } = useCurrentUser();
  const { isMobile } = useSidebar();
  const user = data ?? fallbackUser;
  const name = isLoading ? "Carregando perfil" : user.name;
  const isUserNotFound = error instanceof ApiError && error.statusCode === 404;
  const email =
    isLoading || isError
      ? isUserNotFound
        ? "Conta não encontrada."
        : fallbackUser.email
      : user.email;
  const initials = getInitials(name).toUpperCase();
  const profileImageUrl = data?.profileImageUrl ?? null;

  return (
    <SidebarPrimitiveFooter className="mt-auto border-t border-sidebar-border p-2">
      <SidebarMenu className="group-data-[collapsible=icon]:items-center">
        <SidebarMenuItem className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:w-full group-data-[collapsible=icon]:justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="h-14 rounded-sidebar-item px-2.5 text-sidebar-foreground transition-colors duration-200 ease-clean hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground group-data-[collapsible=icon]:!size-10 group-data-[collapsible=icon]:!w-10 group-data-[collapsible=icon]:!justify-center group-data-[collapsible=icon]:!p-0"
                aria-label={`Abrir menu da conta de ${name}`}
              >
                <UserAvatar
                  profileImageUrl={profileImageUrl}
                  name={name}
                  initials={initials}
                  className="size-8 shrink-0"
                  fallbackClassName="bg-sidebar-primary text-xs font-semibold text-sidebar-primary-foreground"
                />

                <div className="grid min-w-0 flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                  <span className="truncate font-semibold">{name}</span>
                  <span className="truncate text-xs text-sidebar-foreground/60">{email}</span>
                </div>

                <ChevronsUpDown
                  aria-hidden
                  className="ml-auto size-4 text-sidebar-foreground/60 group-data-[collapsible=icon]:hidden"
                />
              </SidebarMenuButton>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              side={isMobile ? "top" : "right"}
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
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarPrimitiveFooter>
  );
}
