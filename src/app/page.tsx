import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  Activity,
  Calculator,
  Calendar,
  Car,
  CheckCircle2,
  ChevronRight,
  LineChart,
  Menu,
  Shield,
  Star,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import cleanMoveImage from "@/assets/clean-move.png";
import logoImage from "@/assets/logo.png";

const landingTitle = "CleanMove | Gestão para estéticas automotivas";
const landingDescription =
  "Organize agendamentos, clientes, veículos, orçamentos e caixa da sua estética automotiva em uma plataforma simples e profissional.";

export const metadata: Metadata = {
  title: {
    absolute: landingTitle,
  },
  description: landingDescription,
  keywords: [
    "CleanMove",
    "gestão para estética automotiva",
    "software para estética automotiva",
    "agenda para lava rápido",
    "orçamento automotivo",
    "controle de caixa automotivo",
  ],
  openGraph: {
    title: landingTitle,
    description: landingDescription,
    siteName: "CleanMove",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: landingTitle,
    description: landingDescription,
  },
};

const productJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "CleanMove",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  inLanguage: "pt-BR",
  description: landingDescription,
  provider: {
    "@type": "Organization",
    name: "CleanMove",
  },
  offers: [
    {
      "@type": "Offer",
      name: "Starter",
      price: "89",
      priceCurrency: "BRL",
      availability: "https://schema.org/InStock",
    },
    {
      "@type": "Offer",
      name: "Profissional",
      price: "149",
      priceCurrency: "BRL",
      availability: "https://schema.org/InStock",
    },
  ],
};

const containerClass = "mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8";
const primaryCtaClass =
  "inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-base font-semibold text-primary-foreground shadow-primary-glow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:w-auto";
const secondaryCtaClass =
  "inline-flex min-h-12 w-full items-center justify-center rounded-xl border border-border bg-card/60 px-6 py-3 text-base font-semibold text-foreground transition-colors hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:w-auto";

type Feature = {
  icon: LucideIcon;
  title: string;
  description: string;
};

const features: Feature[] = [
  {
    icon: Calendar,
    title: "Agendamentos Inteligentes",
    description:
      "Controle sua agenda por box, profissional e tipo de serviço. Nunca mais sobreponha horários.",
  },
  {
    icon: Calculator,
    title: "Orçamentos Profissionais",
    description:
      "Gere orçamentos em PDF com a sua marca em segundos. Aumente sua taxa de conversão.",
  },
  {
    icon: Car,
    title: "Gestão de Veículos",
    description:
      "Histórico completo por placa. Saiba exatamente o que foi feito no carro de cada cliente.",
  },
  {
    icon: LineChart,
    title: "Caixa e Financeiro",
    description:
      "Controle de entradas e saídas simples. Saiba exatamente quanto seu negócio está lucrando.",
  },
];

const appointments = [
  {
    time: "09:00",
    client: "Marcelo Silva",
    car: "BMW 320i",
    plate: "ABC-1D23",
    service: "Polimento Técnico",
    status: "Em andamento",
    color: "bg-blue-500/20 text-blue-300",
  },
  {
    time: "14:00",
    client: "Roberto Costa",
    car: "Porsche Macan",
    plate: "XYZ-9A87",
    service: "Vitrificação",
    status: "Agendado",
    color: "bg-yellow-500/20 text-yellow-300",
  },
  {
    time: "16:30",
    client: "Ana Santos",
    car: "Jeep Compass",
    plate: "QWE-5R43",
    service: "Lavagem Detalhada",
    status: "Agendado",
    color: "bg-yellow-500/20 text-yellow-300",
  },
];

const quoteBenefits = [
  "Catálogo de serviços pré-cadastrados",
  "Cálculo automático de totais",
  "Histórico de aprovação e negociação",
  "Link direto para o cliente visualizar online",
];

const showcaseBenefits = [
  "Painel de controle no tablet do balcão",
  "Acompanhamento do serviço em tempo real",
  "Comunicação integrada com o cliente",
  "Relatórios para tomar decisões com dados",
];

const steps = [
  {
    number: "01",
    title: "Cadastre o Cliente",
    desc: "Placa, modelo e dados básicos em segundos.",
  },
  {
    number: "02",
    title: "Envie o Orçamento",
    desc: "Selecione os serviços e envie o link via WhatsApp.",
  },
  {
    number: "03",
    title: "Execute o Serviço",
    desc: "Ao ser aprovado, o sistema já reserva a agenda.",
  },
  {
    number: "04",
    title: "Feche o Caixa",
    desc: "Baixa automática no financeiro ao concluir.",
  },
];

const testimonials = [
  {
    text: "Antes da CleanMove eu anotava os agendamentos no caderno e os orçamentos no WhatsApp. Hoje eu tenho visão completa de quanto a minha estética fatura e os clientes adoram o profissionalismo.",
    author: "Carlos Mendonça",
    role: "Dono, CM Detail",
    location: "São Paulo, SP",
  },
  {
    text: "A facilidade de puxar o histórico de serviços pela placa do carro é incrível. Consigo oferecer manutenções de vitrificação na hora certa porque o sistema me avisa.",
    author: "Juliana Freitas",
    role: "Gerente, Studio JF Automotivo",
    location: "Curitiba, PR",
  },
  {
    text: "O controle de caixa salvou meu negócio. Parei de misturar dinheiro pessoal com o da empresa e agora sei exatamente qual serviço me dá mais lucro.",
    author: "Felipe Costa",
    role: "Proprietário, Costa Lava Rápido",
    location: "Belo Horizonte, MG",
  },
];

const starterFeatures = [
  "Até 100 agendamentos/mês",
  "Cadastro de clientes e veículos",
  "Orçamentos em PDF",
  "Controle de caixa básico",
  "1 usuário",
];

const proFeatures = [
  "Agendamentos ilimitados",
  "Lembretes automáticos no WhatsApp",
  "Orçamentos interativos online",
  "Relatórios financeiros avançados",
  "Usuários ilimitados",
];

export default function Home() {
  return (
    <div className="cleanmove-landing min-h-screen overflow-x-clip bg-background text-foreground selection:bg-primary/30">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />

      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute left-[-12rem] top-[-12rem] h-[28rem] w-[28rem] rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute bottom-[-14rem] right-[-10rem] h-[30rem] w-[30rem] rounded-full bg-accent/10 blur-[130px]" />
      </div>

      <Navbar />

      <main className="relative z-10 pt-16">
        <HeroSection />
        <FeaturesSection />
        <MockupSection />
        <BrandShowcaseSection />
        <HowItWorksSection />
        <TestimonialsSection />
        <PricingSection />
        <CtaSection />
      </main>

      <Footer />
    </div>
  );
}

function Navbar() {
  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-border bg-background/85 backdrop-blur-md">
      <div
        className={`${containerClass} flex h-16 items-center justify-between gap-4`}
      >
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2.5"
          aria-label="CleanMove - página inicial"
        >
          <Image
            src={logoImage}
            alt="Logotipo CleanMove"
            width={36}
            height={36}
            priority
            className="h-9 w-9 shrink-0 object-contain"
          />
          <span className="truncate font-display text-xl font-bold tracking-tight">
            Clean<span className="text-primary">Move</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Menu principal">
          <a
            href="#recursos"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Recursos
          </a>
          <a
            href="#como-funciona"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Como funciona
          </a>
          <a
            href="#precos"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Preços
          </a>
          <a
            href="#depoimentos"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Depoimentos
          </a>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <a
            href="/login"
            className="inline-flex min-h-10 items-center justify-center rounded-lg px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Entrar
          </a>
          <a
            href="#precos"
            className="inline-flex min-h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Testar grátis
          </a>
        </div>

        <details className="landing-mobile-menu relative md:hidden">
          <summary
            className="landing-mobile-menu-summary flex h-10 w-10 cursor-pointer list-none items-center justify-center rounded-lg text-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            aria-label="Abrir menu"
          >
            <Menu className="h-5 w-5" aria-hidden />
          </summary>
          <nav
            className="absolute right-0 top-12 w-[min(calc(100vw-2rem),20rem)] rounded-2xl border border-border bg-card p-4 shadow-modal"
            aria-label="Menu mobile"
          >
            <div className="flex flex-col gap-1">
              <a href="#recursos" className="rounded-lg px-3 py-3 text-base font-medium hover:bg-muted">
                Recursos
              </a>
              <a href="#como-funciona" className="rounded-lg px-3 py-3 text-base font-medium hover:bg-muted">
                Como funciona
              </a>
              <a href="#precos" className="rounded-lg px-3 py-3 text-base font-medium hover:bg-muted">
                Preços
              </a>
              <a href="#depoimentos" className="rounded-lg px-3 py-3 text-base font-medium hover:bg-muted">
                Depoimentos
              </a>
              <div className="my-3 h-px bg-border" />
              <a
                href="/login"
                className="rounded-lg px-3 py-3 text-base font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                Entrar
              </a>
              <a
                href="#precos"
                className="mt-2 inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                Testar grátis
              </a>
            </div>
          </nav>
        </details>
      </div>
    </header>
  );
}

function HeroSection() {
  return (
    <section className="overflow-hidden pb-16 pt-16 sm:pb-24 sm:pt-20 lg:pb-32">
      <div className={containerClass}>
        <div className="mx-auto max-w-4xl text-center">
          <div className="animate-clean-reveal">
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              CleanMove · Gestão para estéticas automotivas
            </span>
          </div>

          <h1 className="animate-clean-reveal animation-delay-100 mb-6 text-4xl font-bold leading-tight tracking-normal sm:text-5xl md:text-6xl lg:text-7xl">
            Assuma o controle da sua{" "}
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
              estética automotiva
            </span>
          </h1>

          <p className="animate-clean-reveal animation-delay-200 mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
            Substitua a bagunça do WhatsApp e os orçamentos de papel por um
            fluxo profissional único. Agendamentos, clientes, orçamentos e caixa
            em um só lugar.
          </p>

          <div className="animate-clean-reveal animation-delay-300 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a href="#precos" className={primaryCtaClass}>
              Começar agora
              <ChevronRight className="h-5 w-5" aria-hidden />
            </a>
            <a href="#demo" className={secondaryCtaClass}>
              Ver demo
            </a>
          </div>
        </div>

        <div
          id="demo"
          className="animate-clean-reveal animation-delay-400 relative mx-auto mt-14 max-w-5xl scroll-mt-24 sm:mt-20"
        >
          <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-background via-transparent to-transparent" />
          <div className="relative overflow-hidden rounded-2xl border border-border bg-card/50 shadow-2xl backdrop-blur">
            <div className="flex h-12 min-w-0 items-center gap-3 border-b border-border bg-muted/30 px-3 sm:px-4">
              <div className="flex shrink-0 gap-1.5">
                <div className="h-3 w-3 rounded-full bg-red-500/80" />
                <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                <div className="h-3 w-3 rounded-full bg-green-500/80" />
              </div>
              <div className="mx-auto min-w-0 max-w-[18rem] flex-1 truncate rounded-md bg-background/50 px-3 py-1 text-center font-mono text-xs text-muted-foreground sm:px-8 md:px-12">
                app.cleanmove.com.br
              </div>
            </div>

            <div className="relative z-0 grid grid-cols-1 gap-4 p-3 sm:gap-6 sm:p-6 lg:grid-cols-[minmax(0,2fr)_minmax(16rem,1fr)]">
              <div className="min-w-0 space-y-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="font-display text-lg font-semibold">
                    Agenda de Hoje
                  </h3>
                  <a
                    href="#como-funciona"
                    className="inline-flex min-h-8 w-full items-center justify-center rounded-md border border-border bg-background px-3 text-sm font-medium transition-colors hover:bg-muted sm:w-auto"
                  >
                    Ver calendário
                  </a>
                </div>

                <div className="space-y-3">
                  {appointments.map((apt) => (
                    <article
                      key={`${apt.time}-${apt.plate}`}
                      className="flex min-w-0 flex-col gap-4 rounded-xl border border-border bg-background/50 p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                        <div className="w-12 shrink-0 text-sm font-medium text-muted-foreground">
                          {apt.time}
                        </div>
                        <div className="h-10 w-px shrink-0 bg-border" />
                        <div className="min-w-0">
                          <div className="truncate font-medium">
                            {apt.client}
                          </div>
                          <div className="flex min-w-0 flex-wrap items-center gap-2 text-sm text-muted-foreground">
                            <span className="truncate">{apt.car}</span>
                            <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] uppercase tracking-normal">
                              {apt.plate}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-start gap-2 sm:items-end">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${apt.color}`}
                        >
                          {apt.status}
                        </span>
                        <span className="text-sm text-muted-foreground sm:text-foreground">
                          {apt.service}
                        </span>
                      </div>
                    </article>
                  ))}
                </div>
              </div>

              <aside className="min-w-0 space-y-4 sm:space-y-6">
                <div className="rounded-xl border border-border bg-gradient-to-b from-card to-background p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="font-medium text-muted-foreground">
                      Caixa de Hoje
                    </h3>
                    <LineChart className="h-4 w-4 text-accent" aria-hidden />
                  </div>
                  <div className="mb-1 font-display text-3xl font-bold">
                    R$ 2.450,00
                  </div>
                  <div className="flex items-center gap-1 text-sm text-green-300">
                    <Activity className="h-3 w-3" aria-hidden /> +15% vs.
                    ontem
                  </div>

                  <div className="mt-6 space-y-3">
                    <div className="flex justify-between gap-4 text-sm">
                      <span className="text-muted-foreground">Entradas</span>
                      <span className="font-medium text-green-300">
                        R$ 2.800,00
                      </span>
                    </div>
                    <div className="flex justify-between gap-4 text-sm">
                      <span className="text-muted-foreground">Saídas</span>
                      <span className="font-medium text-red-300">
                        R$ 350,00
                      </span>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-background/50 p-5">
                  <h3 className="mb-4 font-medium">Orçamentos Pendentes</h3>
                  <div className="space-y-3">
                    <BudgetItem
                      title="Audi Q5 - Higienização"
                      subtitle="Enviado há 2h"
                      value="R$ 850"
                    />
                    <BudgetItem
                      title="Hilux - Polimento"
                      subtitle="Enviado ontem"
                      value="R$ 1.200"
                    />
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function BudgetItem({
  title,
  subtitle,
  value,
}: {
  title: string;
  subtitle: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg p-2 transition-colors hover:bg-muted/50">
      <div className="min-w-0">
        <div className="truncate text-sm font-medium">{title}</div>
        <div className="text-xs text-muted-foreground">{subtitle}</div>
      </div>
      <div className="shrink-0 text-sm font-medium">{value}</div>
    </div>
  );
}

function FeaturesSection() {
  return (
    <section
      id="recursos"
      className="border-y border-border bg-muted/20 py-16 sm:py-20 lg:py-24"
    >
      <div className={containerClass}>
        <SectionHeading
          title="Tudo que uma estética moderna precisa"
          description="Sem planilhas confusas. Sem sistemas complexos demais. Apenas o que funciona para o seu dia a dia."
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/50"
            >
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <feature.icon className="h-6 w-6 text-primary" aria-hidden />
              </div>
              <h3 className="mb-2 font-display text-xl font-semibold">
                {feature.title}
              </h3>
              <p className="leading-relaxed text-muted-foreground">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function MockupSection() {
  return (
    <section className="py-16 sm:py-20 lg:py-24">
      <div className={containerClass}>
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="min-w-0">
            <h2 className="mb-6 font-display text-3xl font-bold leading-tight sm:text-4xl">
              Orçamentos que vendem por você
            </h2>
            <p className="mb-8 text-lg leading-relaxed text-muted-foreground">
              Apresentação é tudo. Seus clientes vão receber um orçamento
              detalhado, profissional e claro, diretamente no WhatsApp. Quando
              eles aprovam, vira um agendamento com um clique.
            </p>

            <ul className="space-y-4">
              {quoteBenefits.map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden />
                  </div>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative min-w-0">
            <div className="absolute inset-0 rounded-full bg-accent/10 blur-[100px]" />
            <article className="relative rounded-2xl border border-border bg-card p-4 shadow-xl sm:p-6">
              <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-muted-foreground">
                    Orçamento #4082
                  </div>
                  <h3 className="mt-1 truncate font-display text-xl font-semibold">
                    Roberto Costa
                  </h3>
                </div>
                <div className="w-fit rounded bg-yellow-500/10 px-2 py-1 text-sm font-medium text-yellow-300">
                  Aguardando
                </div>
              </div>

              <div className="mb-6 rounded-xl border border-border bg-background p-4">
                <div className="mb-1 text-sm text-muted-foreground">
                  Veículo
                </div>
                <div className="flex flex-wrap items-center gap-2 font-medium">
                  Porsche Macan
                  <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] uppercase tracking-normal">
                    XYZ-9A87
                  </span>
                </div>
              </div>

              <div className="mb-6 space-y-3">
                <QuoteLine
                  title="Vitrificação de Pintura"
                  subtitle="Garantia de 3 anos"
                  value="R$ 1.800,00"
                />
                <QuoteLine
                  title="Higienização Interna"
                  subtitle="Bancos em couro"
                  value="R$ 450,00"
                />
              </div>

              <div className="flex items-end justify-between gap-4">
                <div className="text-sm text-muted-foreground">Total</div>
                <div className="text-right font-display text-2xl font-bold text-primary">
                  R$ 2.250,00
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#precos"
                  className="inline-flex min-h-10 w-full items-center justify-center rounded-md bg-green-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-green-700"
                >
                  Aprovar
                </a>
                <a
                  href="#recursos"
                  className="inline-flex min-h-10 w-full items-center justify-center rounded-md border border-border px-4 text-sm font-semibold transition-colors hover:bg-muted"
                >
                  Editar
                </a>
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}

function QuoteLine({
  title,
  subtitle,
  value,
}: {
  title: string;
  subtitle: string;
  value: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border pb-3 text-sm">
      <div className="min-w-0">
        <div className="font-medium">{title}</div>
        <div className="mt-0.5 text-xs text-muted-foreground">{subtitle}</div>
      </div>
      <div className="shrink-0 text-right font-medium">{value}</div>
    </div>
  );
}

function BrandShowcaseSection() {
  return (
    <section className="overflow-hidden border-y border-border bg-muted/20 py-16 sm:py-20 lg:py-24">
      <div className={containerClass}>
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-5">
          <div className="animate-clean-reveal lg:col-span-3 relative">
            <div className="absolute -inset-6 rounded-full bg-gradient-to-tr from-primary/30 via-accent/20 to-transparent blur-[80px]" />
            <div className="relative overflow-hidden rounded-2xl border border-border shadow-2xl">
              <Image
                src={cleanMoveImage}
                alt="Recepção de estética automotiva usando a plataforma CleanMove"
                sizes="(min-width: 1024px) 58vw, 100vw"
                className="block h-auto w-full"
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-background/40 via-transparent to-transparent" />
            </div>
            <div className="absolute -bottom-4 -right-4 hidden items-center gap-3 rounded-xl border border-border bg-card/90 px-4 py-3 shadow-xl backdrop-blur md:flex">
              <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-sm font-medium">
                Estética operando agora
              </span>
            </div>
          </div>

          <div className="animate-clean-reveal animation-delay-100 lg:col-span-2">
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-normal text-primary">
              <Shield className="h-3 w-3" aria-hidden /> Seu negócio, em outro
              patamar
            </span>
            <h2 className="mb-6 font-display text-3xl font-bold leading-tight sm:text-4xl">
              Profissionalismo que o cliente{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                enxerga de longe
              </span>
            </h2>
            <p className="mb-8 text-lg leading-relaxed text-muted-foreground">
              Da recepção do carro à entrega das chaves, a CleanMove dá ao seu
              negócio a estrutura de uma operação séria. Tablet no balcão,
              agenda na tela e orçamento no celular do cliente, tudo conectado,
              tudo com a sua marca.
            </p>
            <ul className="space-y-3">
              {showcaseBenefits.map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <CheckCircle2 className="h-4 w-4 text-primary" aria-hidden />
                  </div>
                  <span className="text-sm">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  return (
    <section id="como-funciona" className="bg-background py-16 sm:py-20 lg:py-24">
      <div className={containerClass}>
        <SectionHeading
          title="O fluxo perfeito de trabalho"
          description="Do primeiro contato até o recebimento, a CleanMove organiza cada etapa."
        />

        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {steps.map((step, index) => (
            <article key={step.number} className="relative">
              {index < steps.length - 1 && (
                <div className="absolute left-[60%] top-8 z-0 hidden h-px w-full border-t-2 border-dashed border-border md:block" />
              )}
              <div className="relative z-10 mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border-2 border-primary bg-card font-display text-xl font-bold text-primary shadow-step-glow md:mx-0">
                {step.number}
              </div>
              <h3 className="mb-2 text-center font-display text-lg font-semibold md:text-left">
                {step.title}
              </h3>
              <p className="text-center text-sm text-muted-foreground md:text-left">
                {step.desc}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function TestimonialsSection() {
  return (
    <section
      id="depoimentos"
      className="border-y border-border bg-muted/20 py-16 sm:py-20 lg:py-24"
    >
      <div className={containerClass}>
        <h2 className="mb-12 text-center font-display text-3xl font-bold sm:mb-16 sm:text-4xl">
          Quem usa, recomenda
        </h2>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:gap-6">
          {testimonials.map((testimonial) => (
            <article
              key={testimonial.author}
              className="flex flex-col justify-between rounded-2xl border border-border bg-card p-6 sm:p-8"
            >
              <div>
                <div className="mb-6 flex gap-1" aria-label="5 estrelas">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star
                      key={index}
                      className="h-4 w-4 fill-primary text-primary"
                      aria-hidden
                    />
                  ))}
                </div>
                <p className="mb-8 text-muted-foreground">
                  “{testimonial.text}”
                </p>
              </div>
              <footer>
                <div className="font-medium">{testimonial.author}</div>
                <div className="text-sm text-muted-foreground">
                  {testimonial.role}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {testimonial.location}
                </div>
              </footer>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function PricingSection() {
  return (
    <section id="precos" className="py-16 sm:py-20 lg:py-24">
      <div className={containerClass}>
        <SectionHeading
          title="Preço simples e transparente"
          description="Comece a organizar sua estética automotiva hoje mesmo."
        />

        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8">
          <PricingCard
            title="Starter"
            description="Para quem está começando e precisa organizar a casa."
            price="R$ 89"
            features={starterFeatures}
            cta="Testar grátis por 7 dias"
            ctaHref="#contato"
          />
          <PricingCard
            title="Profissional"
            description="Para estéticas estabelecidas que querem acelerar o crescimento."
            price="R$ 149"
            features={proFeatures}
            cta="Assinar Profissional"
            ctaHref="#contato"
            featured
          />
        </div>
      </div>
    </section>
  );
}

function PricingCard({
  title,
  description,
  price,
  features,
  cta,
  ctaHref,
  featured = false,
}: {
  title: string;
  description: string;
  price: string;
  features: string[];
  cta: string;
  ctaHref: string;
  featured?: boolean;
}) {
  return (
    <article
      className={`relative overflow-hidden rounded-2xl border p-6 sm:p-8 ${
        featured
          ? "border-primary bg-gradient-to-b from-primary/10 to-card"
          : "border-border bg-card"
      }`}
    >
      {featured && (
        <div className="absolute right-0 top-0 rounded-bl-lg bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
          MAIS ESCOLHIDO
        </div>
      )}
      <h3
        className={`mb-2 font-display text-xl font-semibold ${
          featured ? "text-primary" : ""
        }`}
      >
        {title}
      </h3>
      <p className="mb-6 text-sm text-muted-foreground">{description}</p>
      <div className="mb-8">
        <span className="font-display text-4xl font-bold">{price}</span>
        <span className="text-muted-foreground">/mês</span>
      </div>
      <ul className="mb-8 space-y-4">
        {features.map((item) => (
          <li key={item} className="flex items-center gap-3 text-sm">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-primary" aria-hidden />
            <span>{item}</span>
          </li>
        ))}
      </ul>
      <a
        href={ctaHref}
        className={`inline-flex min-h-11 w-full items-center justify-center rounded-xl px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
          featured
            ? "bg-primary text-primary-foreground hover:bg-primary/90"
            : "border border-border hover:bg-muted"
        }`}
      >
        {cta}
      </a>
    </article>
  );
}

function CtaSection() {
  return (
    <section id="contato" className="relative overflow-hidden py-16 sm:py-20 lg:py-24">
      <div className="absolute inset-0 bg-primary/5" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[42rem] w-[42rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-[150px]" />

      <div className={`${containerClass} relative z-10 text-center`}>
        <h2 className="mb-6 font-display text-4xl font-bold leading-tight sm:text-5xl">
          Pronto para acelerar seu negócio?
        </h2>
        <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
          Junte-se a centenas de estéticas automotivas que já revolucionaram sua
          gestão com a CleanMove.
        </p>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a href="/login" className={primaryCtaClass}>
            Começar teste gratuito
            <ChevronRight className="h-5 w-5" aria-hidden />
          </a>
          <a href="/login" className={secondaryCtaClass}>
            Falar com vendas
          </a>
        </div>
        <p className="mt-6 text-sm text-muted-foreground">
          Sem cartão de crédito. Cancele quando quiser.
        </p>
      </div>
    </section>
  );
}

function SectionHeading({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="mx-auto mb-12 max-w-2xl text-center sm:mb-16">
      <h2 className="mb-4 font-display text-3xl font-bold leading-tight sm:text-4xl">
        {title}
      </h2>
      <p className="text-lg leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  );
}

function Footer() {
  return (
    <footer className="relative z-10 border-t border-border bg-card pb-8 pt-14 sm:pt-16">
      <div className={containerClass}>
        <div className="mb-12 grid grid-cols-1 gap-10 md:grid-cols-4 md:gap-12 lg:mb-16">
          <div className="md:col-span-2">
            <Link
              href="/"
              className="mb-4 flex items-center gap-2.5"
              aria-label="CleanMove - página inicial"
            >
              <Image
                src={logoImage}
                alt="Logotipo CleanMove"
                width={36}
                height={36}
                className="h-9 w-9 object-contain"
              />
              <span className="font-display text-xl font-bold tracking-tight">
                Clean<span className="text-primary">Move</span>
              </span>
            </Link>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              A plataforma definitiva para gestão de estéticas automotivas.
              Controle sua agenda, orçamentos e caixa em um só lugar.
            </p>
          </div>

          <FooterNav
            title="Produto"
            links={[
              ["Recursos", "#recursos"],
              ["Como funciona", "#como-funciona"],
              ["Preços", "#precos"],
              ["Depoimentos", "#depoimentos"],
            ]}
          />

          <FooterNav
            title="Empresa"
            links={[
              ["Contato", "#contato"],
              ["Entrar", "/login"],
              ["Página de exemplo", "/home"],
              ["Design system", "/design-system"],
            ]}
          />
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-border pt-8 text-sm text-muted-foreground md:flex-row">
          <div>© 2026 CleanMove Sistemas. Todos os direitos reservados.</div>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            <a href="#recursos" className="transition-colors hover:text-foreground">
              Produto
            </a>
            <a href="#contato" className="transition-colors hover:text-foreground">
              Contato
            </a>
            <span>Feito no Brasil</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterNav({
  title,
  links,
}: {
  title: string;
  links: Array<[string, string]>;
}) {
  return (
    <nav aria-label={title}>
      <h3 className="mb-4 font-semibold text-foreground">{title}</h3>
      <ul className="space-y-3 text-sm text-muted-foreground">
        {links.map(([label, href]) => (
          <li key={href}>
            <a href={href} className="transition-colors hover:text-primary">
              {label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
