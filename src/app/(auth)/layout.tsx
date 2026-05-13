import { AppQueryClientProvider } from "@/shared/providers/query-client-provider";
import authHeroImage from "@/assets/auth-hero-image.png";
import { ReactNode } from "react";

export default function AuthLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <AppQueryClientProvider>
      <main className="relative min-h-dvh overflow-x-hidden bg-[#0B0F19] text-[#F8FAFC] lg:h-dvh lg:overflow-hidden">
        <video
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster={authHeroImage.src}
        >
          <source src="/assets/auth-video-background.mp4" type="video/mp4" />
        </video>

        <div aria-hidden className="absolute inset-0 bg-[#0B0F19]/72" />

        <div
          aria-hidden
          className="absolute inset-0 bg-[radial-gradient(circle_at_34%_18%,rgba(37,99,235,0.24),transparent_34%),linear-gradient(180deg,rgba(11,15,25,0.1)_0%,rgba(11,15,25,0.78)_100%)]"
        />

        <section className="relative z-10 flex min-h-dvh items-center justify-center px-4 py-8 sm:px-6 lg:h-dvh lg:px-8 lg:py-4">
          <div className="w-full max-w-[480px] rounded-[24px] border border-[#1D2734]/20 bg-[#0B0F19]/60 px-6 py-8 shadow-[0_30px_120px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.03)] backdrop-blur-md sm:px-10 lg:px-12">
            {children}
          </div>
        </section>
      </main>
    </AppQueryClientProvider>
  );
}
