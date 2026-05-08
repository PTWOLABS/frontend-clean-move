import { AppQueryClientProvider } from '@/shared/providers/query-client-provider';
import Image from 'next/image';
import loginHeroImage from '@/assets/login-page-image.png';
import { ReactNode } from 'react';

export default function AuthLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <AppQueryClientProvider>
      <main className="relative min-h-dvh overflow-hidden bg-[#0B0F19] text-[#F8FAFC]">
        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(circle_at_20%_12%,rgba(37,99,235,0.18),transparent_30%),radial-gradient(circle_at_78%_5%,rgba(6,182,212,0.1),transparent_28%),linear-gradient(180deg,#0B0F19_0%,#07101D_100%)]"
        />

        <section className="relative flex min-h-dvh items-center justify-center px-4 py-8 sm:px-6 lg:px-10">
          <div className="grid w-full max-w-[1600px] overflow-hidden rounded-[24px] border border-[#1D2734] bg-[#141B24] shadow-[0_30px_120px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.03)] lg:min-h-[760px] lg:grid-cols-[1.12fr_0.88fr]">
            <div className="relative hidden min-h-[640px] overflow-hidden border-r border-[#1D2734] lg:block">
              <Image
                src={loginHeroImage}
                alt="Painel visual da CleanMove para gestão de estética automotiva"
                fill
                priority
                sizes="(min-width: 1024px) 56vw, 0vw"
                className="object-cover object-center"
              />
              <div
                aria-hidden
                className="absolute inset-0 bg-[linear-gradient(90deg,rgba(7,16,29,0.12)_0%,rgba(7,16,29,0)_45%,rgba(7,16,29,0.2)_100%)]"
              />
            </div>

            <div className="relative flex min-h-[680px] items-center justify-center bg-[linear-gradient(135deg,rgba(20,27,36,0.98)_0%,rgba(11,15,25,0.96)_100%)] px-6 py-10 sm:px-10 lg:px-12 xl:px-16">
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_34%_16%,rgba(37,99,235,0.12),transparent_30%)]"
              />
              <div className="relative z-10 w-full max-w-[420px]">
                {children}
              </div>
            </div>
          </div>
        </section>
      </main>
    </AppQueryClientProvider>
  );
}
