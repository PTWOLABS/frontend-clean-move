"use client";

import * as React from "react";
import { useRouter } from "@bprogress/next";
import {
  Building2,
  CalendarPlus,
  CarFront,
  ImageIcon,
  Search,
  UserRound,
  Wrench,
  type LucideIcon,
} from "lucide-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { cn } from "@/shared/utils/cn";

type CommandHeaderProps = {
  className?: string;
};

type CommandAction = {
  icon: LucideIcon;
  label: string;
  navigateTo: string;
};

const suggestionCommands: CommandAction[] = [
  {
    icon: CalendarPlus,
    label: "Novo agendamento",
    navigateTo: "/appointments?new=true",
  },
  {
    icon: Wrench,
    label: "Novo serviço",
    navigateTo: "/services?new=true",
  },
  {
    icon: UserRound,
    label: "Novo cliente",
    navigateTo: "/customers?new=true",
  },
  {
    icon: CarFront,
    label: "Novo veículo",
    navigateTo: "/vehicles?new=true",
  },
];

const settingsCommands: CommandAction[] = [
  {
    icon: UserRound,
    label: "Informações do perfil",
    navigateTo: "/settings?tab=profile",
  },
  {
    icon: Building2,
    label: "Informações da empresa",
    navigateTo: "/settings?tab=company",
  },
  {
    icon: ImageIcon,
    label: "Foto de perfil",
    navigateTo: "/settings?tab=appearance",
  },
];

export function CommandHeader({ className }: CommandHeaderProps) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const isCommandShortcut = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k";

      if (!isCommandShortcut) {
        return;
      }

      event.preventDefault();
      setOpen((currentOpen) => !currentOpen);
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  function handleNavigate(navigateTo: string) {
    setOpen(false);
    router.push(navigateTo);
  }

  return (
    <>
      <button
        type="button"
        aria-label="Abrir busca e atalhos"
        aria-keyshortcuts="Control+K Meta+K"
        onClick={() => setOpen(true)}
        className={cn(
          "mt-2 flex h-10 w-full min-w-0 cursor-text items-center gap-3 rounded-md border border-border bg-card px-3 text-left text-sm text-muted-foreground shadow-xs transition-[border-color,box-shadow] duration-200 ease-clean hover:border-primary/30 focus-visible:border-primary/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/15",
          className,
        )}
      >
        <Search aria-hidden className="size-4 shrink-0 text-muted-foreground" />

        <span className="min-w-0 flex-1 truncate">Buscar ou ir para...</span>

        <kbd className="hidden shrink-0 select-none items-center gap-1 rounded-md border border-border bg-background/70 px-1.5 py-0.5 font-mono text-[11px] font-medium leading-none text-muted-foreground shadow-xs sm:inline-flex">
          Ctrl K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Buscar ou executar comando..." />

        <CommandList className="scrollbar-none">
          <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>

          <CommandGroup heading="Sugestões">
            {suggestionCommands.map((command) => {
              const Icon = command.icon;

              return (
                <CommandItem
                  key={command.navigateTo}
                  value={command.label}
                  onSelect={() => handleNavigate(command.navigateTo)}
                  className="cursor-pointer"
                >
                  <Icon className="size-4" />
                  <span>{command.label}</span>
                </CommandItem>
              );
            })}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Configurações">
            {settingsCommands.map((command) => {
              const Icon = command.icon;

              return (
                <CommandItem
                  key={command.navigateTo}
                  value={command.label}
                  onSelect={() => handleNavigate(command.navigateTo)}
                  className="cursor-pointer"
                >
                  <Icon className="size-4" />
                  <span>{command.label}</span>
                </CommandItem>
              );
            })}
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
